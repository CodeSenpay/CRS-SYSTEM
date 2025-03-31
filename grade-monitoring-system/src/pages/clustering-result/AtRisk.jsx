import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  List,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function AtRisk() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);
  const [schoolYears] = useState(["2022-2023", "2023-2024", "2024-2025"]);
  const [hasSearched, setHasSearched] = useState(false);
  const [allStudentData, setAllStudentData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);

  const fetchAtRiskStudents = async () => {
    if (!yearLevel || !semester || !schoolYear) {
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      // Use the cluster-students API endpoint to match ViewCluster.jsx
      const response = await fetch("/api/system/cluster-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yearLevel: yearLevel,
          semester: semester,
          schoolYear: schoolYear,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch at-risk students: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error fetching at-risk students");
      }

      // Store all data for filtering
      setAllStudentData(data.data || []);

      // Filter for at-risk students only and process the data
      processAtRiskStudents(data.data || []);
    } catch (error) {
      console.error("Error fetching at-risk students:", error);
      setError(`Unable to fetch at-risk student data. Error: ${error.message}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const processAtRiskStudents = (data) => {
    // Filter data by year level and semester if selected
    let filteredData = [...data];

    if (yearLevel) {
      // Compare against both the year_level field and extract from course field when needed
      filteredData = filteredData.filter((student) => {
        // Check direct year_level field
        if (student.year_level === yearLevel) {
          return true;
        }

        // Extract year level from course field (format: "Year X")
        if (student.course && student.course.startsWith("Year ")) {
          const courseYearLevel = student.course.replace("Year ", "");
          return courseYearLevel === yearLevel;
        }

        return false;
      });
    }

    if (semester) {
      filteredData = filteredData.filter(
        (student) => student.semester === semester
      );
    }

    // Filter to include students who meet any of the at-risk criteria:
    // 1. Overall grade above 3.3
    // 2. Major subjects average above 2.5
    // 3. Minor subjects average above 3.0
    filteredData = filteredData.filter((student) => {
      const overallGrade = parseFloat(student.average_score || 0);
      const majorGrade =
        student.major_grade !== null ? parseFloat(student.major_grade) : null;
      const minorGrade =
        student.minor_grade !== null ? parseFloat(student.minor_grade) : null;

      return (
        overallGrade > 3.3 ||
        (majorGrade !== null && majorGrade > 2.5) ||
        (minorGrade !== null && minorGrade > 3.0)
      );
    });

    // Process student data into the required format for the UI
    const processedStudents = filteredData.map((student) => {
      // Extract the actual year level from the course field if needed
      let extractedYearLevel = student.year_level || "";
      if (
        !extractedYearLevel &&
        student.course &&
        student.course.startsWith("Year ")
      ) {
        extractedYearLevel = student.course.replace("Year ", "");
      }

      // Convert grade to GPA-like value (using the average_score)
      const overallGrade = parseFloat(student.average_score || 0);
      const majorGrade =
        student.major_grade !== null ? parseFloat(student.major_grade) : null;
      const minorGrade =
        student.minor_grade !== null ? parseFloat(student.minor_grade) : null;

      // Determine risk level based on combined risk factors
      let riskLevel = "medium";
      let riskReasons = [];

      if (overallGrade > 3.3) {
        riskReasons.push("Overall GPA > 3.3");
      }

      if (majorGrade !== null && majorGrade > 2.5) {
        riskReasons.push("Major subjects > 2.5");
      }

      if (minorGrade !== null && minorGrade > 3.0) {
        riskReasons.push("Minor subjects > 3.0");
      }

      // Assign higher risk level for more severe cases
      if (
        overallGrade >= 4.0 ||
        (majorGrade !== null && majorGrade >= 4.0) ||
        (minorGrade !== null && minorGrade >= 4.0)
      ) {
        riskLevel = "high";
      }

      // Get recommendation if available
      const recommendedAction =
        student.recommendations && student.recommendations.length > 0
          ? student.recommendations
              .map(
                (rec) =>
                  `${rec.recommended_action} for ${rec.subject_type} subjects`
              )
              .join(". ")
          : student.recommendation
          ? `${student.recommendation.recommended_action}. ${student.recommendation.focus_area}`
          : "Academic counseling recommended";

      return {
        id: student.student_number || "Unknown ID",
        name:
          `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
          "Unknown Name",
        course: student.course || "Computer Science",
        yearLevel: extractedYearLevel,
        semester: student.semester || "",
        riskLevel,
        riskReasons: riskReasons.join(", "),
        overallGrade,
        majorGrade,
        minorGrade,
        recommendedAction,
        rawData: student, // Store original data for reference
      };
    });

    // Sort students by risk level (high to low) and then by GPA (worst first)
    processedStudents.sort((a, b) => {
      if (a.riskLevel === b.riskLevel) {
        return b.overallGrade - a.overallGrade; // Higher GPA (worse in Philippine system) comes first
      }

      // Risk level priority: high > medium
      if (a.riskLevel === "high") return -1;
      if (b.riskLevel === "high") return 1;
      return 0;
    });

    setStudents(processedStudents);
  };

  // When filters change AND both are selected, fetch data
  useEffect(() => {
    if (yearLevel && semester && schoolYear) {
      fetchAtRiskStudents();
    }
  }, [yearLevel, semester, schoolYear]);

  const handleReset = () => {
    setYearLevel("");
    setSemester("");
    setSchoolYear("");
    setHasSearched(false);
    setStudents([]);
  };

  // New function to fetch a student's actual subject data
  const fetchStudentSubjects = async (studentId) => {
    setSubjectLoading(true);
    try {
      const response = await fetch("/api/system/student-grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: studentId,
          semester: semester,
          schoolYear: schoolYear,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student grades: ${response.status}`);
      }

      const data = await response.json();

      // Transform the API response into our expected subject format
      const subjects = data.map((grade) => ({
        name: grade.subject_name,
        code: grade.subject_code,
        grade: parseFloat(grade.score) || 0,
        units: 3, // Assuming 3 units as default since API doesn't provide units
        subjectType: grade.subject_type || "Unknown",
        isPassing: grade.subject_type?.toLowerCase().includes("major")
          ? parseFloat(grade.score) <= 2.5
          : parseFloat(grade.score) <= 3.0,
        semester: grade.semester,
      }));

      console.log("Fetched student subjects:", subjects);

      // Filter by the selected semester if it exists
      const filteredSubjects = semester
        ? subjects.filter((subject) => subject.semester === semester)
        : subjects;

      // Sort by grade (best performance first)
      filteredSubjects.sort((a, b) => a.grade - b.grade);

      return filteredSubjects;
    } catch (error) {
      console.error("Error fetching student grades:", error);
      return []; // Return empty array in case of error
    } finally {
      setSubjectLoading(false);
    }
  };

  const showStudentDetails = async (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
    setStudentSubjects([]); // Clear previous subjects

    // Fetch the student's actual grades for the selected semester
    const subjects = await fetchStudentSubjects(student.id);
    setStudentSubjects(subjects);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Student ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Year Level",
      dataIndex: "yearLevel",
      key: "yearLevel",
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (riskLevel) => {
        let color = "orange";
        let icon = <WarningOutlined />;

        if (riskLevel === "high") {
          color = "red";
          icon = <ExclamationCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {riskLevel.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: "High", value: "high" },
        { text: "Medium", value: "medium" },
      ],
      onFilter: (value, record) => record.riskLevel === value,
    },
    {
      title: "Risk Factors",
      dataIndex: "riskReasons",
      key: "riskReasons",
      render: (text) => (
        <Tooltip title={text}>
          <Paragraph ellipsis={{ rows: 1 }}>{text}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: "Overall Grade",
      dataIndex: "overallGrade",
      key: "overallGrade",
      render: (grade) => (
        <Tag color={grade > 3.3 ? "error" : "success"}>{grade.toFixed(2)}</Tag>
      ),
      sorter: (a, b) => a.overallGrade - b.overallGrade,
    },
    {
      title: "Major Subjects",
      dataIndex: "majorGrade",
      key: "majorGrade",
      render: (grade) =>
        grade !== null ? (
          <Tag color={grade > 2.5 ? "error" : "success"}>
            {grade.toFixed(2)}
          </Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
      sorter: (a, b) => {
        if (a.majorGrade === null && b.majorGrade === null) return 0;
        if (a.majorGrade === null) return 1;
        if (b.majorGrade === null) return -1;
        return a.majorGrade - b.majorGrade;
      },
    },
    {
      title: "Minor Subjects",
      dataIndex: "minorGrade",
      key: "minorGrade",
      render: (grade) =>
        grade !== null ? (
          <Tag color={grade > 3.0 ? "error" : "success"}>
            {grade.toFixed(2)}
          </Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
      sorter: (a, b) => {
        if (a.minorGrade === null && b.minorGrade === null) return 0;
        if (a.minorGrade === null) return 1;
        if (b.minorGrade === null) return -1;
        return a.minorGrade - b.minorGrade;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => showStudentDetails(record)}
          size="small"
        >
          View Subjects
        </Button>
      ),
    },
  ];

  const renderSubjectDetails = () => {
    if (!selectedStudent) return null;

    // If still loading subjects, show loading state
    if (subjectLoading) {
      return (
        <Modal
          title={`${selectedStudent.name}'s Subjects`}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="back" onClick={handleModalClose}>
              Close
            </Button>,
          ]}
        >
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading subject data..." />
          </div>
        </Modal>
      );
    }

    // Group subjects by strength and weakness criteria
    // Strengths: Only exceptional performances (below 1.7)
    // Weaknesses: Check if grade exceeds passing threshold based on subject type
    // - Major: Failing if > 2.5
    // - Minor: Failing if > 3.0
    const strengthSubjects = studentSubjects.filter((s) => s.grade < 1.7);
    const weaknessSubjects = studentSubjects.filter((s) => !s.isPassing);
    const averageSubjects = studentSubjects.filter(
      (s) => s.grade >= 1.7 && s.isPassing
    );

    return (
      <Modal
        title={
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="mr-2 text-lg">{selectedStudent.name}</span>
                <Tag
                  color={selectedStudent.overallGrade < 3.0 ? "orange" : "red"}
                >
                  Overall GPA: {selectedStudent.overallGrade.toFixed(2)}
                </Tag>
              </div>
              <Tag color="purple">{semester} Semester Only</Tag>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {selectedStudent.course}, Year {selectedStudent.yearLevel},{" "}
              {selectedStudent.semester} Semester
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Text strong>Performance Analysis:</Text>
          <p className="mt-1 text-gray-700">
            This student is at {selectedStudent.riskLevel} risk, with an average
            GPA of {selectedStudent.overallGrade.toFixed(2)}.
            {selectedStudent.overallGrade > 3.0
              ? " Immediate intervention is recommended as the student is failing to meet minimum requirements."
              : " The student is currently maintaining passing grades but requires support to improve performance."}
          </p>
        </div>

        {studentSubjects.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No subject data available for this student"
          />
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card
                title={
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    <span>Strengths (Exceptional Performance)</span>
                  </div>
                }
                className="h-full"
                size="small"
              >
                {strengthSubjects.length > 0 ? (
                  <List
                    size="small"
                    dataSource={strengthSubjects}
                    renderItem={(subject) => (
                      <List.Item
                        key={subject.code}
                        className="hover:bg-green-50 transition-colors duration-200"
                      >
                        <div className="flex justify-between w-full items-center">
                          <Tooltip title={subject.code}>
                            <span>{subject.name}</span>
                          </Tooltip>
                          <div>
                            <Tag
                              color={subject.grade <= 1.5 ? "success" : "green"}
                              className="ml-2"
                            >
                              {subject.grade.toFixed(1)}
                            </Tag>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No subjects with exceptional performance"
                  />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <div className="flex items-center">
                    <CloseCircleOutlined className="text-red-500 mr-2" />
                    <span>Areas for Improvement (Failing)</span>
                  </div>
                }
                className="h-full"
                size="small"
              >
                {weaknessSubjects.length > 0 ? (
                  <List
                    size="small"
                    dataSource={weaknessSubjects}
                    renderItem={(subject) => (
                      <List.Item
                        key={subject.code}
                        className="hover:bg-red-50 transition-colors duration-200"
                      >
                        <div className="flex justify-between w-full items-center">
                          <Tooltip title={subject.code}>
                            <span>
                              <Tag
                                color={
                                  subject.subjectType
                                    ?.toLowerCase()
                                    .includes("major")
                                    ? "blue"
                                    : "green"
                                }
                                style={{ marginRight: 8 }}
                              >
                                {subject.subjectType}
                              </Tag>
                              {subject.name}
                            </span>
                          </Tooltip>
                          <div>
                            <Tag
                              color={subject.grade >= 4.0 ? "error" : "orange"}
                              className="ml-2"
                            >
                              {subject.grade.toFixed(1)}
                            </Tag>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No failing subjects"
                  />
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Add a section for average performance subjects (1.7-3.0) */}
        {averageSubjects.length > 0 && (
          <>
            <Divider orientation="left">
              <Text type="secondary">Other Passing Subjects</Text>
            </Divider>
            <Card size="small">
              <div className="grid grid-cols-2 gap-2">
                {averageSubjects.map((subject) => (
                  <Tag
                    key={subject.code}
                    className="mr-2 mb-2 py-1"
                    color="blue"
                  >
                    <Tooltip title={subject.code}>
                      <span>
                        {subject.name}: {subject.grade.toFixed(1)}
                      </span>
                    </Tooltip>
                  </Tag>
                ))}
              </div>
            </Card>
          </>
        )}

        <Divider />

        <div>
          <Text strong>Academic Support Recommendations:</Text>
          <ul className="mt-2 pl-5 list-disc">
            {weaknessSubjects.length > 0 && (
              <li className="mb-1">
                <Text type="danger">
                  Prioritize improvement in failing subjects:{" "}
                  <strong>
                    {weaknessSubjects.map((s) => s.name).join(", ")}
                  </strong>
                </Text>
              </li>
            )}
            {strengthSubjects.length > 0 && (
              <li className="mb-1">
                <Text type="success">
                  Build on existing strengths in:{" "}
                  <strong>
                    {strengthSubjects.map((s) => s.name).join(", ")}
                  </strong>
                </Text>
              </li>
            )}
            <li className="mb-1">
              Schedule regular consultations with academic advisor
            </li>
            <li className="mb-1">
              Consider tutoring services for challenging subjects
            </li>
            <li className="mb-1">
              Review study habits and time management techniques
            </li>
            {selectedStudent.overallGrade > 3.5 && (
              <li className="mb-1 text-red-600">
                <strong>
                  Consider program shifting options if consistent improvement is
                  not achieved
                </strong>
              </li>
            )}
          </ul>
        </div>
      </Modal>
    );
  };

  const renderWelcomeMessage = () => (
    <Card className="mt-8 shadow-lg border-0">
      <div className="text-center py-4">
        <div className="mb-6">
          <ExclamationCircleOutlined className="text-5xl text-red-500" />
          <Title level={3} className="mt-4 mb-0 text-gradient">
            At-Risk Student Identification
          </Title>
          <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto my-4 rounded-full"></div>
          <Paragraph className="text-gray-600 max-w-2xl mx-auto text-base">
            Identify students who need academic interventions and assistance
            before they fall too far behind. Early detection and support can
            significantly improve student outcomes.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4">
          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white mx-auto mb-4">
                <ExclamationCircleOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <div className="text-red-600 font-bold text-lg mb-2">
                Overall Grade Risk
              </div>
              <div className="text-sm text-gray-600">
                Overall grade requires improvement
                <div className="font-mono bg-red-200 text-red-800 rounded-md px-2 py-1 mt-2 inline-block">
                  Overall Grade {">"} 3.3
                </div>
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-500 text-white mx-auto mb-4">
                <WarningOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <div className="text-orange-600 font-bold text-lg mb-2">
                Major Subjects Risk
              </div>
              <div className="text-sm text-gray-600">
                Major subject grades below passing
                <div className="font-mono bg-orange-200 text-orange-800 rounded-md px-2 py-1 mt-2 inline-block">
                  Major Subjects {">"} 2.5
                </div>
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-sm border border-yellow-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-500 text-white mx-auto mb-4">
                <InfoCircleOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <div className="text-yellow-600 font-bold text-lg mb-2">
                Minor Subjects Risk
              </div>
              <div className="text-sm text-gray-600">
                Minor subject grades below passing
                <div className="font-mono bg-yellow-200 text-yellow-800 rounded-md px-2 py-1 mt-2 inline-block">
                  Minor Subjects {">"} 3.0
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-4">
          <Alert
            message={
              <div className="flex items-center">
                <InfoCircleOutlined className="mr-2 text-lg" />
                <span className="font-medium">Ready to begin?</span>
              </div>
            }
            description="Select a Year Level and Semester from the filters above to identify at-risk students."
            type="info"
            showIcon={false}
            className="text-center shadow-sm border border-blue-200"
          />
        </div>

        <style jsx global>{`
          .text-gradient {
            background: linear-gradient(to right, #ef4444, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading student data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading At-Risk Student Data"
        description={
          <div>
            <p>{error}</p>
            <div className="mt-4">
              <h4 className="font-bold">Troubleshooting Steps:</h4>
              <ol className="list-decimal ml-5 mt-2">
                <li>Ensure the Node.js backend server is running</li>
                <li>
                  Verify the Python ML API service is running on port 5001
                </li>
                <li>
                  Check that your database contains valid student grade records
                </li>
                <li>
                  Inspect the browser console and server logs for detailed error
                  messages
                </li>
              </ol>
            </div>
          </div>
        }
        type="error"
        showIcon
        icon={<ExclamationCircleOutlined />}
        className="max-w-2xl mx-auto my-8"
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <Title level={2} className="mb-2">
          <ExclamationCircleOutlined className="mr-2" />
          Students At Risk
        </Title>
        <Text type="secondary">
          Identify students who may need academic intervention or program
          shifting advice
        </Text>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            Students are considered at risk if they meet ANY of these criteria:
          </p>
          <p>
            Overall Grade {">"} 3.3 | Major Subjects {">"} 2.5 | Minor Subjects{" "}
            {">"} 3.0
          </p>
        </div>
      </div>

      {/* Filter Form */}
      <Card className="mb-6">
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={7}>
              <Form.Item label="School Year" className="mb-2">
                <Select
                  placeholder="Select School Year"
                  value={schoolYear}
                  onChange={setSchoolYear}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {schoolYears.map((y) => (
                    <Option key={y} value={y}>
                      {y}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Year Level" className="mb-2">
                <Select
                  placeholder="Select Year Level"
                  value={yearLevel}
                  onChange={setYearLevel}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {yearLevels.map((y) => (
                    <Option key={y} value={y}>
                      {y}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Semester" className="mb-2">
                <Select
                  placeholder="Select Semester"
                  value={semester}
                  onChange={setSemester}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {semesters.map((sem) => (
                    <Option key={sem} value={sem}>
                      {sem}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={5} className="flex items-end">
              <Button onClick={handleReset} icon={<SearchOutlined />}>
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {!hasSearched ? (
        renderWelcomeMessage()
      ) : students.length === 0 ? (
        <Alert
          message="No At-Risk Students Found"
          description={`No at-risk students found matching the selected filters (Year Level: ${
            yearLevel || "Any"
          }, Semester: ${semester || "Any"}).`}
          type="info"
          showIcon
          className="mb-6"
        />
      ) : (
        <Card
          className="hover:shadow-lg transition-all duration-300"
          headStyle={{
            background: "linear-gradient(to right, #ff7875, #ff4d4f)",
            borderRadius: "8px 8px 0 0",
            color: "white",
          }}
          title={
            <div className="flex items-center">
              <ExclamationCircleOutlined style={{ marginRight: 12 }} />
              <Title level={4} style={{ margin: 0, color: "white" }}>
                At-Risk Students Found
              </Title>
            </div>
          }
        >
          <Alert
            message={`${students.length} student${
              students.length !== 1 ? "s" : ""
            } identified as at-risk`}
            description="The following students may need academic intervention or program shifting advice. Early intervention can help these students succeed in their academic journey."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Table
            dataSource={students}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
            className="shadow-sm"
            rowClassName={(record) =>
              record.riskLevel === "high"
                ? "bg-red-50"
                : record.riskLevel === "medium"
                ? "bg-yellow-50"
                : ""
            }
          />

          {/* Student details modal */}
          {renderSubjectDetails()}
        </Card>
      )}
    </div>
  );
}

export default AtRisk;
