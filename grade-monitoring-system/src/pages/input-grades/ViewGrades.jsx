import {
  BarChartOutlined,
  BookOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

function ViewGrades() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);
  const [schoolYear, setSchoolYear] = useState("");
  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [loadingSchoolYears, setLoadingSchoolYears] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isGradesModalVisible, setIsGradesModalVisible] = useState(false);
  const [gradesData, setGradesData] = useState([]);

  // Fetch school years from the API
  useEffect(() => {
    const fetchSchoolYears = async () => {
      setLoadingSchoolYears(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/system/school-years",
          { withCredentials: true }
        );

        if (response.data.success) {
          setSchoolYearOptions(response.data.data);
        } else {
          message.error("Failed to fetch school years");
          // Fallback to default options
          const currentYear = new Date().getFullYear();
          const defaultOptions = [
            `${currentYear - 1}-${currentYear}`,
            `${currentYear}-${currentYear + 1}`,
            `${currentYear + 1}-${currentYear + 2}`,
          ];
          setSchoolYearOptions(defaultOptions);
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
        setSchoolYearOptions(defaultOptions);
      } finally {
        setLoadingSchoolYears(false);
      }
    };

    fetchSchoolYears();
  }, []);

  // Fetch students based on filters
  const fetchStudentsByFilters = async () => {
    if (!yearLevel || !semester || !schoolYear) {
      message.warning(
        "Please select Year Level, Semester, and School Year first"
      );
      return;
    }

    setLoadingStudents(true);
    try {
      console.log("Fetching students with filters:", {
        yearLevel,
        semester,
        schoolYear,
      });
      const response = await axios.get(
        "http://localhost:3000/api/system/students-by-filters",
        {
          params: {
            yearLevel,
            semester,
            schoolYear,
          },
          withCredentials: true,
        }
      );

      console.log("Students API response:", response.data);

      if (response.data.status === "success") {
        setStudentsList(response.data.data.students);
      } else {
        message.error(response.data.message || "Failed to fetch students");
        setStudentsList([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch students");
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch subjects based on filters
  const fetchSubjects = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (yearLevel) params.append("yearLevel", yearLevel);
      if (semester) params.append("semester", semester);
      if (schoolYear) params.append("schoolYear", schoolYear);

      console.log("Fetching subjects with params:", {
        yearLevel,
        semester,
        schoolYear,
        url: `http://localhost:3000/api/system/get-subjects-by-year-semester?${params.toString()}`,
      });

      const response = await axios.get(
        `http://localhost:3000/api/system/get-subjects-by-year-semester?${params.toString()}`,
        { withCredentials: true }
      );

      console.log("Subjects API response:", response.data);

      if (response.data && response.data.data) {
        console.log("Subjects fetched:", response.data.data.length);
        setFilteredSubjects(response.data.data);
        return response.data.data;
      } else {
        console.log("No subjects returned from API");
        setFilteredSubjects([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setFilteredSubjects([]);
      return [];
    }
  };

  // Fetch student grades for specific student and subjects
  const fetchStudentGrades = async (studentId, subjectCode) => {
    setLoadingGrades(true);
    try {
      // Using axios post request to fetch student grades
      const response = await axios.post(
        "http://localhost:3000/api/system/view-student-grades",
        {
          studentId,
          schoolYear,
          semester,
          subjectCodes: subjectCode ? [subjectCode] : undefined,
        },
        { withCredentials: true }
      );

      // Process the response data
      const data = response.data;
      if (data.status === "success" && Array.isArray(data.data)) {
        setStudents(data.data);
        return data.data;
      } else {
        console.log("API response for grades:", data);
        setStudents([]);
        return [];
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to fetch student grades");
      setStudents([]);
      return [];
    } finally {
      setLoadingGrades(false);
    }
  };

  const fetchAllStudentGrades = async () => {
    try {
      setLoading(true);

      // Modified to use yearLevel, semester, and subject filters
      const response = await axios.get(
        "http://localhost:3000/api/system/all-student-grades",
        {
          params: {
            yearLevel: yearLevel,
            semester: semester,
            subjectCode: subjectCode,
            schoolYear: schoolYear,
          },
          withCredentials: true,
        }
      );
      // Process the response data
      const data = response.data;
      console.log(Array.isArray(data));
      console.log(data);

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      // Set empty array instead of mock data
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch subjects on initial mount, not grades
    if (yearLevel && semester && schoolYear) {
      fetchSubjects();
    }
  }, [yearLevel, semester, schoolYear]);

  const handleSearch = () => {
    setSearchPerformed(true);
    if (studentId.trim()) {
      fetchStudentGrades(studentId.trim(), subjectCode).then((grades) => {
        setStudents(grades);
      });
    } else if (yearLevel && semester && schoolYear) {
      // Only fetch all grades if required filters are selected
      fetchStudentsByFilters();
    } else {
      message.warning(
        "Please select Year Level, Semester, and School Year first"
      );
    }
  };

  const handleViewStudentGrades = async (student) => {
    setSelectedStudent(student);
    // Fetch the grades but show them in a modal
    try {
      setLoadingGrades(true);
      console.log("Fetching grades for student:", {
        studentId: student.student_id,
        schoolYear,
        semester,
      });

      const response = await axios.post(
        "http://localhost:3000/api/system/view-student-grades",
        {
          studentId: student.student_id,
          schoolYear,
          semester,
        },
        { withCredentials: true }
      );

      console.log("Student grades API response:", response.data);

      const data = response.data;
      if (data.status === "success" && Array.isArray(data.data)) {
        setGradesData(data.data); // Store in separate state for the modal
        setIsGradesModalVisible(true); // Show the modal
      } else {
        console.error("Failed API response format:", data);
        message.error("Failed to fetch student grades");
      }
    } catch (err) {
      console.error(
        "Error fetching student grades:",
        err.response?.data || err.message
      );
      message.error("Failed to fetch student grades");
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setStudentId("");
    setYearLevel("");
    setSemester("");
    setSubjectCode("");
    setSchoolYear("");
    setStudents([]);
    setStudentsList([]);
    setFilteredSubjects([]);
    setSearchPerformed(false);
  };

  const handleYearLevelChange = (value) => {
    setYearLevel(value);
    setSubjectCode(""); // Reset subject when year level changes
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
    setSubjectCode(""); // Reset subject when semester changes
  };

  const handleSchoolYearChange = (value) => {
    setSchoolYear(value);
    setSubjectCode(""); // Reset subject when school year changes
  };

  const studentColumns = [
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <span>
          {record.first_name}{" "}
          {record.middle_name ? record.middle_name + " " : ""}
          {record.last_name}
        </span>
      ),
    },
    {
      title: "Course",
      dataIndex: "course_code",
      key: "course_code",
    },
    {
      title: "Year Level",
      dataIndex: "year_level",
      key: "year_level",
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewStudentGrades(record)}
        >
          View Grades
        </Button>
      ),
    },
  ];

  const columns = [
    {
      title: "Student ID",
      dataIndex: "student_number",
      key: "student_number",
    },
    {
      title: "Name",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Subject Code",
      dataIndex: "subject_code",
      key: "subject_code",
    },
    {
      title: "Subject Name",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "Subject Type",
      dataIndex: "subject_type",
      key: "subject_type",
      render: (type) => (
        <Tag color={type === "Major" ? "blue" : "green"}>
          {type || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Grade",
      dataIndex: "score",
      key: "score",
      render: (score, record) => {
        // Handle null, undefined or non-numeric values
        if (score === null || score === undefined || isNaN(parseFloat(score))) {
          return <span>-</span>;
        }

        const numericScore = parseFloat(score);
        // Get the passing threshold based on subject type
        const isMajorSubject = record.subject_type === "Major";
        const passingThreshold = isMajorSubject ? 2.5 : 3.0;

        // Determine if the grade is passing or failing
        const isPassing = numericScore <= passingThreshold;

        return isPassing ? (
          <Tag color="success" className="font-bold">
            {score}
          </Tag>
        ) : (
          <Tag color="error" className="font-bold">
            {score}
          </Tag>
        );
      },
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Year Level",
      dataIndex: "year_level",
      key: "year_level",
    },
    {
      title: "School Year",
      dataIndex: "school_year",
      key: "school_year",
    },
  ];

  // Calculate statistics safely
  const calculateStats = () => {
    if (!students.length) return { avg: 0, max: 0, min: 0 };

    const grades = students
      .map((student) => student.score)
      .filter((grade) => !isNaN(parseFloat(grade)));

    if (!grades.length) return { avg: 0, max: 0, min: 0 };

    const numericGrades = grades.map((grade) => parseFloat(grade));

    return {
      avg: (
        numericGrades.reduce((sum, grade) => sum + grade, 0) /
        numericGrades.length
      ).toFixed(2),
      max: Math.max(...numericGrades),
      min: Math.min(...numericGrades),
    };
  };

  const stats = calculateStats();

  // Calculate statistics for grades data
  const calculateModalStats = () => {
    if (!gradesData.length) return { avg: 0, max: 0, min: 0 };

    const grades = gradesData
      .map((grade) => grade.score)
      .filter((grade) => !isNaN(parseFloat(grade)));

    if (!grades.length) return { avg: 0, max: 0, min: 0 };

    const numericGrades = grades.map((grade) => parseFloat(grade));

    return {
      avg: (
        numericGrades.reduce((sum, grade) => sum + grade, 0) /
        numericGrades.length
      ).toFixed(2),
      max: Math.max(...numericGrades),
      min: Math.min(...numericGrades),
    };
  };

  const modalStats = calculateModalStats();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card
        className="hover:shadow-xl transition-all duration-300"
        styles={{
          header: {
            background: "linear-gradient(to right, #1890ff, #4c6ef5)",
            borderRadius: "8px 8px 0 0",
            padding: "16px",
          },
        }}
        title={
          <div className="text-center">
            <Title
              level={3}
              style={{ color: "white", margin: 0 }}
              className="flex items-center justify-center"
            >
              <BookOutlined className="mr-3" />
              View Student Grades
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Review and analyze student performance
            </Text>
          </div>
        }
      >
        <Form layout="vertical" className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Form.Item label="Student ID" className="mb-2">
                <Input
                  placeholder="Enter Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={handleKeyPress}
                  prefix={<SearchOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Year Level" className="mb-2">
                <Select
                  placeholder="Select Year Level"
                  value={yearLevel}
                  onChange={handleYearLevelChange}
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
                  onChange={handleSemesterChange}
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
            <Col xs={24} md={6}>
              <Form.Item label="School Year" className="mb-2">
                <Select
                  placeholder="Select School Year"
                  value={schoolYear}
                  onChange={handleSchoolYearChange}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {schoolYearOptions.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Space>
                <Button
                  type="primary"
                  onClick={handleSearch}
                  icon={<SearchOutlined />}
                >
                  Search
                </Button>
                <Button onClick={handleReset}>Reset Filters</Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {(loading || loadingStudents) && (
          <div className="text-center py-10">
            <Spin size="large" />
            <p className="mt-4">Loading...</p>
          </div>
        )}

        {!loading && !loadingStudents && searchPerformed && (
          <>
            {studentId.trim() ? (
              // Show grades if student ID was directly searched
              <>
                {students.length === 0 && (
                  <Alert
                    message="No Data Available"
                    description={`No grades found for student ID: ${studentId}`}
                    type="info"
                    showIcon
                  />
                )}
                {students.length > 0 && (
                  <div className="grades-table-container">
                    <Table
                      dataSource={students}
                      columns={columns}
                      rowKey={(record) =>
                        `${record.student_number}-${record.subject_code}-${record.semester}-${record.year_level}`
                      }
                      pagination={{ pageSize: 10 }}
                      className="shadow-sm"
                    />
                  </div>
                )}
              </>
            ) : (
              // Show students list if no student ID was entered but filters are applied
              <>
                {studentsList.length === 0 &&
                yearLevel &&
                semester &&
                schoolYear ? (
                  <Alert
                    message="No Students Found"
                    description="No students found matching the selected filters."
                    type="info"
                    showIcon
                  />
                ) : studentsList.length > 0 ? (
                  <div className="students-table-container">
                    <Title level={4} className="mb-3">
                      Students
                    </Title>
                    <Table
                      dataSource={studentsList}
                      columns={studentColumns}
                      rowKey="student_id"
                      pagination={{ pageSize: 10 }}
                      className="shadow-sm"
                    />
                  </div>
                ) : null}

                {students.length > 0 && selectedStudent && (
                  <div className="grades-table-container mt-6">
                    <Title level={4} className="mb-3">
                      Grades for {selectedStudent?.first_name}{" "}
                      {selectedStudent?.last_name}
                    </Title>
                    <Table
                      dataSource={students}
                      columns={columns}
                      rowKey={(record) =>
                        `${record.student_number}-${record.subject_code}-${record.semester}-${record.year_level}`
                      }
                      pagination={{ pageSize: 10 }}
                      className="shadow-sm"
                      loading={loadingGrades}
                    />
                  </div>
                )}

                {loadingGrades && !students.length && (
                  <div className="text-center mt-6 py-8">
                    <Spin size="large" />
                    <p className="mt-4">Loading student grades...</p>
                  </div>
                )}
              </>
            )}

            {students.length > 0 && (
              <Card
                className="mt-6"
                title={
                  <div className="flex items-center">
                    <BarChartOutlined className="mr-2 text-blue-500" />
                    <span>
                      {studentId
                        ? `Statistics for Student ID: ${studentId}${
                            schoolYear ? ` (S.Y. ${schoolYear})` : ""
                          }`
                        : selectedStudent
                        ? `Statistics for ${selectedStudent.first_name} ${
                            selectedStudent.last_name
                          }${schoolYear ? ` (S.Y. ${schoolYear})` : ""}`
                        : `Class Statistics${
                            schoolYear ? ` - S.Y. ${schoolYear}` : ""
                          }`}
                    </span>
                  </div>
                }
              >
                <div className="mb-3 text-sm text-gray-500 bg-gray-50 p-2 rounded flex justify-center">
                  <div className="mr-4">
                    <Tag color="blue">Major Subjects</Tag>
                    <span>Passing Grade: ≤ 2.5</span>
                  </div>
                  <div>
                    <Tag color="green">Minor Subjects</Tag>
                    <span>Passing Grade: ≤ 3.0</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card p-4 border rounded-lg text-center bg-blue-50">
                    <Text type="secondary">Average Grade</Text>
                    <div className="text-xl font-bold text-blue-600">
                      {stats.avg}
                    </div>
                  </div>

                  <div className="stat-card p-4 border rounded-lg text-center bg-green-50">
                    <Text type="secondary">Best Grade</Text>
                    <div className="text-xl font-bold text-green-600">
                      {stats.min}
                    </div>
                  </div>

                  <div className="stat-card p-4 border rounded-lg text-center bg-red-50">
                    <Text type="secondary">Lowest Performance</Text>
                    <div className="text-xl font-bold text-red-600">
                      {stats.max}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </Card>

      <Modal
        title={
          <div className="text-lg">
            <span className="font-bold">
              Grades for {selectedStudent?.first_name}{" "}
              {selectedStudent?.last_name}
            </span>
            <div className="text-sm text-gray-500 mt-1">
              {schoolYear ? `School Year: ${schoolYear}` : ""}
              {semester ? `, Semester: ${semester}` : ""}
            </div>
          </div>
        }
        open={isGradesModalVisible}
        onCancel={() => setIsGradesModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setIsGradesModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {loadingGrades ? (
          <div className="text-center py-20">
            <Spin size="large" />
            <p className="mt-4">Loading grades...</p>
          </div>
        ) : gradesData.length > 0 ? (
          <div>
            <Table
              dataSource={gradesData}
              columns={columns}
              rowKey={(record) =>
                `${record.student_number}-${record.subject_code}-${record.semester}-${record.year_level}`
              }
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
              className="shadow-sm"
            />

            <Card
              className="mt-6"
              title={
                <div className="flex items-center">
                  <BarChartOutlined className="mr-2 text-blue-500" />
                  <span>Grade Statistics</span>
                </div>
              }
            >
              <div className="mb-3 text-sm text-gray-500 bg-gray-50 p-2 rounded flex justify-center">
                <div className="mr-4">
                  <Tag color="blue">Major Subjects</Tag>
                  <span>Passing Grade: ≤ 2.5</span>
                </div>
                <div>
                  <Tag color="green">Minor Subjects</Tag>
                  <span>Passing Grade: ≤ 3.0</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card p-4 border rounded-lg text-center bg-blue-50">
                  <Text type="secondary">Average Grade</Text>
                  <div className="text-xl font-bold text-blue-600">
                    {modalStats.avg}
                  </div>
                </div>

                <div className="stat-card p-4 border rounded-lg text-center bg-green-50">
                  <Text type="secondary">Best Grade</Text>
                  <div className="text-xl font-bold text-green-600">
                    {modalStats.min}
                  </div>
                </div>

                <div className="stat-card p-4 border rounded-lg text-center bg-red-50">
                  <Text type="secondary">Lowest Performance</Text>
                  <div className="text-xl font-bold text-red-600">
                    {modalStats.max}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Alert
            message="No Grades Found"
            description={`No grades found for ${selectedStudent?.first_name} ${selectedStudent?.last_name} with the selected filters.`}
            type="info"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
}

export default ViewGrades;
