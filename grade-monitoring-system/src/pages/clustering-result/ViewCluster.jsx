import {
  BarChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
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
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function ViewCluster() {
  const [clusters, setClusters] = useState({
    high: [],
    medium: [],
    low: [],
    majorHigh: [],
    majorMedium: [],
    majorLow: [],
    minorHigh: [],
    minorMedium: [],
    minorLow: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [loadingSchoolYears, setLoadingSchoolYears] = useState(false);
  // Keep allClusterData for potential future features like client-side filtering
  // eslint-disable-next-line no-unused-vars
  const [allClusterData, setAllClusterData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch school years from the API
  useEffect(() => {
    const fetchSchoolYears = async () => {
      setLoadingSchoolYears(true);
      try {
        const response = await fetch("/api/system/school-years", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSchoolYears(data.data);
          } else {
            console.error("Failed to fetch school years:", data.message);
            // Fallback to default options
            const currentYear = new Date().getFullYear();
            const defaultOptions = [
              `${currentYear - 1}-${currentYear}`,
              `${currentYear}-${currentYear + 1}`,
              `${currentYear + 1}-${currentYear + 2}`,
            ];
            setSchoolYears(defaultOptions);
          }
        } else {
          throw new Error(
            `Failed to fetch school years: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching school years:", error);
        // Fallback to default options
        const currentYear = new Date().getFullYear();
        const defaultOptions = [
          `${currentYear - 1}-${currentYear}`,
          `${currentYear}-${currentYear + 1}`,
          `${currentYear + 1}-${currentYear + 2}`,
        ];
        setSchoolYears(defaultOptions);
      } finally {
        setLoadingSchoolYears(false);
      }
    };

    fetchSchoolYears();
  }, []);

  const fetchClusterData = async () => {
    if (!yearLevel || !semester || !schoolYear) {
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      // Update path to match the server routing structure
      const response = await fetch("/api/system/cluster-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Add parameters for filtering if needed
        body: JSON.stringify({
          yearLevel: yearLevel,
          semester: semester,
          schoolYear: schoolYear,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cluster data: ${response.status} ${response.statusText}`
        );
      }

      // Get the response data
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error fetching cluster data");
      }

      // Check if data is properly structured
      if (!Array.isArray(data.data)) {
        throw new Error("Received invalid data structure from server");
      }

      console.log("Received cluster data:", data.data);

      // Store all data for filtering
      setAllClusterData(data.data);

      // Process and filter data
      processClusterData(data.data);
    } catch (error) {
      console.error("Error fetching cluster data:", error);
      setError(
        `Unable to fetch clustering data. Please ensure the backend services are running. 
        Error: ${error.message}`
      );

      // Initialize empty clusters instead of using mock data
      setClusters({
        high: [],
        medium: [],
        low: [],
        majorHigh: [],
        majorMedium: [],
        majorLow: [],
        minorHigh: [],
        minorMedium: [],
        minorLow: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const processClusterData = (data) => {
    if (!data || data.length === 0) return;

    const highPerformers = [];
    const mediumPerformers = [];
    const lowPerformers = [];
    const majorHigh = [];
    const majorMedium = [];
    const majorLow = [];
    const minorHigh = [];
    const minorMedium = [];
    const minorLow = [];

    data.forEach((student) => {
      const grade = parseFloat(student.average_score);
      const majorGrade =
        student.major_grade !== null ? parseFloat(student.major_grade) : null;
      const minorGrade =
        student.minor_grade !== null ? parseFloat(student.minor_grade) : null;

      // Extract year level from student.year_level or from elsewhere if available
      const extractedYearLevel = student.year_level || "Unknown";

      const isAtRisk = grade >= 2.6; // Changed from 2.8 to 2.6
      const majorRisk = majorGrade !== null ? majorGrade > 2.5 : false;
      const minorRisk = minorGrade !== null ? minorGrade > 3.0 : false;

      // Create a standardized student data object
      const studentData = {
        id: student.student_number || "Unknown ID",
        name:
          `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
          "Unknown Name",
        course: student.course || "Unknown Course",
        grade: grade,
        majorGrade: majorGrade,
        minorGrade: minorGrade,
        isAtRisk: isAtRisk,
        hasMajorRisk: majorRisk,
        hasMinorRisk: minorRisk,
        recommendation: student.recommendation || null,
        recommendations: student.recommendations || null,
        yearLevel: extractedYearLevel,
        semester: student.semester || "",
        schoolYear: student.school_year || "",
        majorCluster: student.major_cluster || "N/A",
        minorCluster: student.minor_cluster || "N/A",
      };

      // Categorize students by overall performance
      if (grade <= 1.7) {
        highPerformers.push(studentData);
      } else if (grade <= 2.5) {
        // Changed from 2.7 to 2.5
        mediumPerformers.push(studentData);
      } else {
        lowPerformers.push(studentData);
      }

      // Categorize by major subject performance
      if (majorGrade !== null) {
        if (majorGrade <= 1.7) {
          majorHigh.push(studentData);
        } else if (majorGrade <= 2.5) {
          majorMedium.push(studentData);
        } else {
          majorLow.push(studentData);
        }
      }

      // Categorize by minor subject performance
      if (minorGrade !== null) {
        if (minorGrade <= 1.7) {
          minorHigh.push(studentData);
        } else if (minorGrade <= 3.0) {
          minorMedium.push(studentData);
        } else {
          minorLow.push(studentData);
        }
      }
    });

    // Update all clusters
    setClusters({
      high: highPerformers,
      medium: mediumPerformers,
      low: lowPerformers,
      majorHigh,
      majorMedium,
      majorLow,
      minorHigh,
      minorMedium,
      minorLow,
    });
  };

  // Don't load data on initial page load anymore
  // useEffect(() => {
  //   fetchClusterData();
  // }, []);

  // When filters change AND all are selected, fetch data
  useEffect(() => {
    if (yearLevel && semester && schoolYear) {
      fetchClusterData();
    }
  }, [yearLevel, semester, schoolYear]);

  const handleReset = () => {
    setYearLevel("");
    setSemester("");
    setSchoolYear("");
    setHasSearched(false);
    setClusters({
      high: [],
      medium: [],
      low: [],
      majorHigh: [],
      majorMedium: [],
      majorLow: [],
      minorHigh: [],
      minorMedium: [],
      minorLow: [],
    });
  };

  // Modal functions
  const showModal = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
  };

  // Format recommendations for display in the modal
  const renderRecommendations = (student) => {
    if (!student.recommendations || student.recommendations.length === 0) {
      return <Empty description="No specific recommendations available" />;
    }

    return (
      <div>
        {student.recommendations.map((rec, index) => {
          // Determine color based on subject type
          const typeColor = rec.subject_type === "Major" ? "blue" : "green";

          return (
            <div key={index} className="mb-4 border-b pb-4">
              <div className="mb-2">
                <Tag color={typeColor}>{rec.subject_type} Subjects</Tag>
                <span className="ml-2 font-bold">{rec.focus_area}</span>
              </div>

              <div className="mb-2">
                <span className="text-gray-700 font-medium">
                  Recommended Action:{" "}
                </span>
                <Tag color="orange">{rec.recommended_action}</Tag>
              </div>

              <div className="mt-2 whitespace-pre-line text-gray-700">
                <p>{rec.reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Re-add the renderStudentList function that was accidentally removed
  const renderStudentList = (students, title, color, performance) => {
    // Sort students alphabetically by name
    const sortedStudents = [...students].sort((a, b) => {
      const nameA = `${a.name || ""}`.toLowerCase();
      const nameB = `${b.name || ""}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Set default course to "Computer Science" for all students
    const studentsWithDefaultCourse = sortedStudents.map((student) => ({
      ...student,
      course:
        student.course === "Unknown Course"
          ? "Computer Science"
          : student.course || "Computer Science",
    }));

    const columns = [
      {
        title: "Student Name",
        dataIndex: "name",
        key: "name",
        render: (_, record) => (
          <div className="flex items-center">
            <UserOutlined className="mr-2" />
            <span>{record.name}</span>
          </div>
        ),
      },
      {
        title: "Course",
        dataIndex: "course",
        key: "course",
      },
      {
        title: "Overall Grade",
        dataIndex: "grade",
        key: "grade",
        render: (grade) => (
          <Tag
            color={
              grade >= 2.6 ? "error" : grade >= 1.8 ? "warning" : "success"
            }
          >
            {parseFloat(grade).toFixed(2)}
          </Tag>
        ),
      },
      {
        title: "Major Subjects",
        dataIndex: "majorGrade",
        key: "majorGrade",
        render: (majorGrade) =>
          majorGrade !== null ? (
            <Tag
              color={
                majorGrade > 2.5
                  ? "error"
                  : majorGrade > 1.7
                  ? "warning"
                  : "success"
              }
            >
              {parseFloat(majorGrade).toFixed(2)}
            </Tag>
          ) : (
            <Tag color="default">N/A</Tag>
          ),
      },
      {
        title: "Minor Subjects",
        dataIndex: "minorGrade",
        key: "minorGrade",
        render: (minorGrade) =>
          minorGrade !== null ? (
            <Tag
              color={
                minorGrade > 3.0
                  ? "error"
                  : minorGrade > 1.7
                  ? "warning"
                  : "success"
              }
            >
              {parseFloat(minorGrade).toFixed(2)}
            </Tag>
          ) : (
            <Tag color="default">N/A</Tag>
          ),
      },
      {
        title: "Status",
        key: "status",
        render: (_, record) => {
          // Check if major or minor grades are failed
          const hasFailedMajor =
            record.majorGrade !== null && record.majorGrade > 2.5;
          const hasFailedMinor =
            record.minorGrade !== null && record.minorGrade > 3.0;

          // If either major or minor is failed, show "Needs Improvement"
          const needsImprovement =
            record.isAtRisk || hasFailedMajor || hasFailedMinor;

          return (
            <Tag
              color={needsImprovement ? "red" : "green"}
              icon={
                needsImprovement ? <WarningOutlined /> : <CheckCircleOutlined />
              }
            >
              {needsImprovement ? "Needs Improvement" : "Good Standing"}
            </Tag>
          );
        },
      },
      {
        title: "Recommendation",
        key: "recommendation",
        render: (_, record) => {
          const hasRecommendations =
            (record.recommendations && record.recommendations.length > 0) ||
            record.recommendation;

          // Check if major or minor grades are failed
          const hasFailedMajor =
            record.majorGrade !== null && record.majorGrade > 2.5;
          const hasFailedMinor =
            record.minorGrade !== null && record.minorGrade > 3.0;

          // If either major or minor is failed, show "Needs Improvement"
          const needsImprovement =
            record.isAtRisk || hasFailedMajor || hasFailedMinor;

          // Show recommendation button if student needs improvement and has recommendations
          if (hasRecommendations && needsImprovement) {
            return (
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => showModal(record)}
                size="small"
              >
                View Recommendation
              </Button>
            );
          } else {
            return <span className="text-gray-400">None needed</span>;
          }
        },
      },
    ];

    return (
      <Card
        className="mb-6 hover:shadow-xl transition-all duration-300"
        headStyle={{
          background: `linear-gradient(to right, ${color.start}, ${color.end})`,
          borderRadius: "8px 8px 0 0",
          color: "white",
        }}
        title={
          <div className="flex items-center">
            {performance}
            <span className="ml-2">{title}</span>
          </div>
        }
        bordered={false}
        style={{ borderRadius: "8px" }}
      >
        {studentsWithDefaultCourse.length > 0 ? (
          <Table
            dataSource={studentsWithDefaultCourse}
            columns={columns}
            rowKey="id"
            pagination={false}
            className="mt-4"
            scroll={{ x: "max-content" }}
          />
        ) : (
          <div className="text-center py-6">
            <Text type="secondary">No students in this cluster</Text>
          </div>
        )}
      </Card>
    );
  };

  const renderWelcomeMessage = () => (
    <Card className="mt-8 shadow-lg border-0">
      <div className="text-center py-4">
        <div className="mb-6">
          <BarChartOutlined className="text-5xl text-blue-500" />
          <Title level={3} className="mt-4 mb-0 text-gradient">
            Student Clustering Analysis
          </Title>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto my-4 rounded-full"></div>
          <Paragraph className="text-gray-600 max-w-2xl mx-auto text-base">
            Discover patterns in student performance using advanced machine
            learning algorithms. This tool analyzes academic records and groups
            students into meaningful performance clusters.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4">
          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500 text-white mx-auto mb-4">
                <TeamOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <div className="text-green-600 font-bold text-lg mb-2">
                High Performance
              </div>
              <div className="text-sm text-gray-600">
                Students with excellent academic standing
                <div className="font-mono bg-green-200 text-green-800 rounded-md px-2 py-1 mt-2 inline-block">
                  1.0-1.7
                </div>
                <div className="mt-2 flex space-x-2">
                  <Tag color="blue">Major ≤ 2.5</Tag>
                  <Tag color="green">Minor ≤ 3.0</Tag>
                </div>
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white mx-auto mb-4">
                <TeamOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <div className="text-blue-600 font-bold text-lg mb-2">
                Medium Performance
              </div>
              <div className="text-sm text-gray-600">
                Students with good academic standing
                <div className="font-mono bg-blue-200 text-blue-800 rounded-md px-2 py-1 mt-2 inline-block mb-2">
                  Major: 1.8-2.5
                </div>
                <div className="font-mono bg-blue-200 text-blue-800 rounded-md px-2 py-1 mt-1 inline-block">
                  Minor: 1.8-3.0
                </div>
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white mx-auto mb-4">
                <TeamOutlined style={{ fontSize: "1.5rem" }} />
              </div>
              <div className="text-red-600 font-bold text-lg mb-2">
                Low Performance
              </div>
              <div className="text-sm text-gray-600">
                Students who may need academic intervention
                <div className="font-mono bg-red-200 text-red-800 rounded-md px-2 py-1 mt-2 inline-block mb-2">
                  Major: &gt; 2.5
                </div>
                <div className="font-mono bg-red-200 text-red-800 rounded-md px-2 py-1 mt-1 inline-block">
                  Minor: &gt; 3.0
                </div>
                <div className="mt-2 text-xs">
                  <span className="font-bold">At Risk:</span> Students with
                  grades 3.5-5.0
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
            description="Select a Year Level and Semester from the filters above to view the clustering results."
            type="info"
            showIcon={false}
            className="text-center shadow-sm border border-blue-200"
          />
        </div>

        <style jsx global>{`
          .text-gradient {
            background: linear-gradient(to right, #2563eb, #7c3aed);
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
        <Spin size="large" tip="Loading cluster data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Clustering Data"
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
          <BarChartOutlined className="mr-2" />
          Student Performance Clusters
        </Title>
        <Text type="secondary">
          Students are grouped based on their academic performance metrics
        </Text>
        <div className="mt-2 text-sm text-gray-500">
          <p>Philippine Grading System: 1.0 (Excellent) to 5.0 (Failed)</p>
          <p className="mt-1">
            Major Subjects: Passing Grade ≤ 2.5 | Minor Subjects: Passing Grade
            ≤ 3.0
          </p>
          <p className="mt-1">
            Clustering: High: 1.0-1.7 | Medium (Major): 1.8-2.5 | Medium
            (Minor): 1.8-3.0 | Low: Above Passing Grade
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
      ) : clusters.high.length === 0 &&
        clusters.medium.length === 0 &&
        clusters.low.length === 0 ? (
        <Alert
          message="No Clustering Results"
          description={`No students found matching the selected filters (School Year: ${
            schoolYear || "Any"
          }, Year Level: ${yearLevel || "Any"}, Semester: ${
            semester || "Any"
          }).`}
          type="info"
          showIcon
          className="mb-6"
        />
      ) : (
        <Tabs defaultActiveKey="all" type="card" className="mb-6">
          <TabPane tab="All Subjects" key="all">
            <div className="space-y-6">
              {renderStudentList(
                clusters.high,
                "High Performance (1.0-1.7)",
                { start: "#52c41a", end: "#389e0d" },
                <TeamOutlined style={{ color: "white" }} />
              )}
              {renderStudentList(
                clusters.medium,
                "Medium Performance (1.8-2.5)",
                { start: "#1890ff", end: "#096dd9" },
                <TeamOutlined style={{ color: "white" }} />
              )}
              {renderStudentList(
                clusters.low,
                "Low Performance (2.6-5.0)",
                { start: "#ff4d4f", end: "#cf1322" },
                <TeamOutlined style={{ color: "white" }} />
              )}
            </div>
          </TabPane>

          <TabPane tab="High Performance" key="high">
            {renderStudentList(
              clusters.high,
              "High Performance (1.0-1.7)",
              { start: "#52c41a", end: "#389e0d" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </TabPane>
          <TabPane tab="Medium Performance" key="medium">
            {renderStudentList(
              clusters.medium,
              "Medium Performance (1.8-2.5)",
              { start: "#1890ff", end: "#096dd9" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </TabPane>
          <TabPane tab="Low Performance" key="low">
            {renderStudentList(
              clusters.low,
              "Low Performance (2.6-5.0)",
              { start: "#ff4d4f", end: "#cf1322" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </TabPane>
        </Tabs>
      )}

      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            <span>
              Academic Recommendations for{" "}
              {selectedStudent ? selectedStudent.name : ""}
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="close" onClick={handleModalCancel}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedStudent && (
          <div className="p-4">
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Student:</span>
                <span>{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Overall Grade:</span>
                <Tag
                  color={
                    selectedStudent.grade >= 2.6
                      ? "error"
                      : selectedStudent.grade >= 1.8
                      ? "warning"
                      : "success"
                  }
                >
                  {parseFloat(selectedStudent.grade).toFixed(2)}
                </Tag>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Major Subject Average:</span>
                {selectedStudent.majorGrade !== null ? (
                  <Tag
                    color={
                      selectedStudent.majorGrade > 2.5
                        ? "error"
                        : selectedStudent.majorGrade > 1.7
                        ? "warning"
                        : "success"
                    }
                  >
                    {parseFloat(selectedStudent.majorGrade).toFixed(2)}
                  </Tag>
                ) : (
                  <Tag color="default">N/A</Tag>
                )}
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Minor Subject Average:</span>
                {selectedStudent.minorGrade !== null ? (
                  <Tag
                    color={
                      selectedStudent.minorGrade > 3.0
                        ? "error"
                        : selectedStudent.minorGrade > 1.7
                        ? "warning"
                        : "success"
                    }
                  >
                    {parseFloat(selectedStudent.minorGrade).toFixed(2)}
                  </Tag>
                ) : (
                  <Tag color="default">N/A</Tag>
                )}
              </div>
            </div>

            <Divider orientation="left">
              <span className="text-blue-600">
                <FileTextOutlined /> Academic Recommendations
              </span>
            </Divider>

            {renderRecommendations(selectedStudent)}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ViewCluster;
