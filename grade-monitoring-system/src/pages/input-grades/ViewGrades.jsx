import {
  BarChartOutlined,
  BookOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Input,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

function ViewGrades() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");

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

      // Using axios post request to fetch student grades
      const response = await axios.get(
        "http://localhost:3000/api/system/all-student-grades",
        {
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

  useEffect(() => {
    // Fetch all student grades on initial load
    fetchAllStudentGrades();
  }, []);

  const handleSearch = () => {
    if (studentId.trim()) {
      fetchStudentGrades(studentId.trim());
    } else {
      // If search field is empty, fetch all grades
      fetchStudentGrades();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
      render: (score) => (
        <span
          className={parseFloat(score) < 3.0 ? "text-red-500 font-bold" : ""}
        >
          {score}
        </span>
      ),
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
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
        grades.reduce((sum, grade) => sum + parseFloat(grade), 0) / grades.length
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
        <div className="mb-6">
          <Space>
            <Input
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleKeyPress(e);
                }
              }}
              style={{ width: 200 }}
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Button
              type="primary"
              onClick={handleSearch}
              icon={<SearchOutlined />}
            >
              Search
            </Button>
            {studentId && (
              <Button
                onClick={() => {
                  setStudentId("");
                  fetchStudentGrades();
                }}
              >
                Clear
              </Button>
            )}
          </Space>
        </div>
        <br />

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
                    : "No student grades available at this time."
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
                    `${record.student_number}-${record.subject_code}-${record.semester}-${record.year}`
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
                      {stats.max}
                    </div>
                  </div>

                  <div className="stat-card p-4 border rounded-lg text-center bg-red-50">
                    <Text type="secondary">Lowest Grade</Text>
                    <div className="text-xl font-bold text-red-600">
                      {stats.min}
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
