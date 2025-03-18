import {
  BarChartOutlined,
  BookOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
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
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);

  const fetchStudentGrades = async (id = "") => {
    try {
      setLoading(true);

      // Using axios post request to fetch student grades

      if (!id) fetchAllStudentGrades();

      const response = await axios.post(
        "http://localhost:3000/api/system/student-grades",
        {
          studentId: id,
        },
        { withCredentials: true }
      );

      // Process the response data
      const data = response.data;
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
          },
          withCredentials: true,
        }
      );
      // Process the response data
      const data = response.data;
      console.log(Array.isArray(data));

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      // Set empty array instead of mock data
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/system/all-subjects",
        { withCredentials: true }
      );

      if (response.data && response.data.data) {
        setSubjects(response.data.data);
        filterSubjects(response.data.data, yearLevel, semester);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // Filter subjects based on year level and semester
  const filterSubjects = (allSubjects, yearLevel, semester) => {
    if (!yearLevel && !semester) {
      setFilteredSubjects(allSubjects);
      return;
    }
    // console.log("Year Level: " + yearLevel);
    // console.log("Semester: " + semester);
    // console.log("All Subjects: " + allSubjects);
    // console.log(Array.isArray(allSubjects));
    const filtered = Array.isArray(allSubjects)
      ? allSubjects.filter((subject) => {
          // Convert both to the same type (string) for comparison
          const subjectYearLevel = String(subject.year_level);
          const filterYearLevel = String(yearLevel);
          const subjectSemester = String(subject.semester);
          const filterSemester = String(semester);

          const matchYearLevel =
            !yearLevel || subjectYearLevel === filterYearLevel;
          const matchSemester = !semester || subjectSemester === filterSemester;

          console.log(subjectYearLevel, filterYearLevel);
          console.log(subjectSemester, filterSemester);

          return matchYearLevel && matchSemester;
        })
      : [];

    setFilteredSubjects(filtered);

    // If current selected subject doesn't match filters, clear it
    if (subjectCode && !filtered.some((s) => s.subject_code === subjectCode)) {
      setSubjectCode("");
    }
  };

  useEffect(() => {
    // Fetch all student grades on initial load
    fetchAllStudentGrades();
    fetchSubjects();
  }, []);

  // Filter subjects when year level or semester changes
  useEffect(() => {
    filterSubjects(subjects, yearLevel, semester);
  }, [yearLevel, semester]);

  // Refetch grades when filters change
  useEffect(() => {
    if (!studentId) {
      fetchAllStudentGrades();
    }
  }, [yearLevel, semester, subjectCode]);

  const handleSearch = () => {
    if (studentId.trim()) {
      fetchStudentGrades(studentId.trim());
      setYearLevel("");
      setSemester("");
      setSubjectCode("");
    } else {
      // If search field is empty, fetch all grades with filters
      fetchAllStudentGrades();
      setYearLevel("");
      setSemester("");
      setSubjectCode("");
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
    setFilteredSubjects(subjects);
    fetchAllStudentGrades();
  };

  const handleYearLevelChange = (value) => {
    setYearLevel(value);
    setSubjectCode(""); // Reset subject when year level changes
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
    setSubjectCode(""); // Reset subject when semester changes
  };

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
      title: "Grade",
      dataIndex: "score",
      key: "score",
      render: (score) => {
        // Handle null, undefined or non-numeric values
        if (score === null || score === undefined || isNaN(parseFloat(score))) {
          return <span>-</span>;
        }

        const numericScore = parseFloat(score);
        return numericScore <= 3.0 ? (
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
  ];

  // Calculate statistics safely
  const calculateStats = () => {
    if (!students.length) return { avg: 0, max: 0, min: 0 };

    const grades = students
      .map((student) => student.score)
      .filter((grade) => !isNaN(grade));

    if (!grades.length) return { avg: 0, max: 0, min: 0 };

    console.log(grades.reduce((sum, grade) => sum + grade, 0) / grades.length);
    return {
      avg: (
        grades.reduce((sum, grade) => sum + parseFloat(grade), 0) /
        grades.length
      ).toFixed(2),
      max: Math.max(...grades),
      min: Math.min(...grades),
    };
  };

  const stats = calculateStats();

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
              <Form.Item label="Subject" className="mb-2">
                <Select
                  placeholder="Select Subject"
                  value={subjectCode}
                  onChange={setSubjectCode}
                  style={{ width: "100%" }}
                  allowClear
                  disabled={
                    filteredSubjects.length === 0 && (yearLevel || semester)
                  }
                >
                  {filteredSubjects.map((subject) => (
                    <Option
                      key={subject.subject_code}
                      value={subject.subject_code}
                    >
                      {subject.subject_code} - {subject.subject_name}
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

        {loading && (
          <div className="text-center py-10">
            <Spin size="large" />
            <p className="mt-4">Loading student grades...</p>
          </div>
        )}

        {!loading && (
          <>
            {students.length === 0 ? (
              <Alert
                message="No Data Available"
                description={
                  studentId
                    ? `No grades found for student ID: ${studentId}`
                    : "No student grades available for the selected filters."
                }
                type="info"
                showIcon
              />
            ) : (
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

            {students.length > 0 && (
              <Card
                className="mt-6"
                title={
                  <div className="flex items-center">
                    <BarChartOutlined className="mr-2 text-blue-500" />
                    <span>
                      {studentId
                        ? `Statistics for Student ID: ${studentId}`
                        : "Class Statistics"}
                    </span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card p-4 border rounded-lg text-center bg-blue-50">
                    <Text type="secondary">Average Grade</Text>
                    <div className="text-xl font-bold text-blue-600">
                      {stats.avg}
                    </div>
                  </div>

                  <div className="stat-card p-4 border rounded-lg text-center bg-green-50">
                    <Text type="secondary">Highest Grade</Text>
                    <div className="text-xl font-bold text-green-600">
                      {stats.min}
                    </div>
                  </div>

                  <div className="stat-card p-4 border rounded-lg text-center bg-red-50">
                    <Text type="secondary">Lowest Grade</Text>
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
    </div>
  );
}

export default ViewGrades;
