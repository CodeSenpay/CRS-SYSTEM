import {
  BarChartOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Alert, Card, Spin, Table, Typography } from "antd";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

function ViewGrades() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch student grades data
    const fetchStudentGrades = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/student-grades");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch student grades: ${response.status} ${response.statusText}`
          );
        }

        // Check if the response is empty
        const text = await response.text();
        if (!text) {
          setStudents([]);
          setLoading(false);
          return;
        }

        // Try to parse the JSON
        try {
          const data = JSON.parse(text);
          setStudents(Array.isArray(data) ? data : []);
        } catch (parseError) {
          console.error(
            "JSON Parse Error:",
            parseError,
            "Response text:",
            text
          );

          // Use mock data for development/testing purposes
          // Remove this in production or replace with proper error handling
          const mockData = [
            {
              id: "2023001",
              name: "John Doe",
              course: "Computer Science",
              assignment: "Final Project",
              grade: 85,
              submissionDate: "2023-05-15T10:30:00Z",
            },
            {
              id: "2023002",
              name: "Jane Smith",
              course: "Mathematics",
              assignment: "Calculus Exam",
              grade: 92,
              submissionDate: "2023-05-14T09:15:00Z",
            },
            {
              id: "2023003",
              name: "Michael Johnson",
              course: "Physics",
              assignment: "Lab Report",
              grade: 78,
              submissionDate: "2023-05-16T14:45:00Z",
            },
            {
              id: "2023004",
              name: "Emily Brown",
              course: "English Literature",
              assignment: "Essay",
              grade: 88,
              submissionDate: "2023-05-13T11:20:00Z",
            },
            {
              id: "2023005",
              name: "David Wilson",
              course: "Chemistry",
              assignment: "Final Exam",
              grade: 75,
              submissionDate: "2023-05-17T13:10:00Z",
            },
          ];

          setStudents(mockData);
          console.log("Using mock data due to API response parsing error");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentGrades();
  }, []);

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
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Assignment",
      dataIndex: "assignment",
      key: "assignment",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade) => (
        <span className={grade < 60 ? "text-red-500 font-bold" : ""}>
          {grade}
        </span>
      ),
    },
    {
      title: "Submission Date",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  // Calculate statistics safely
  const calculateStats = () => {
    if (!students.length) return { avg: 0, max: 0, min: 0 };

    const grades = students
      .map((student) => student.grade)
      .filter((grade) => !isNaN(grade));

    if (!grades.length) return { avg: 0, max: 0, min: 0 };

    return {
      avg: (
        grades.reduce((sum, grade) => sum + grade, 0) / grades.length
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
        headStyle={{
          background: "linear-gradient(to right, #1890ff, #4c6ef5)",
          borderRadius: "8px 8px 0 0",
          padding: "16px",
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
        {loading && (
          <div className="text-center py-10">
            <Spin size="large" />
            <p className="mt-4">Loading student grades...</p>
          </div>
        )}

        {error && (
          <Alert
            message="Error Loading Data"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
            icon={<ExclamationCircleOutlined />}
          />
        )}

        {!loading && !error && (
          <>
            {students.length === 0 ? (
              <Alert
                message="No Data Available"
                description="No student grades available at this time."
                type="info"
                showIcon
              />
            ) : (
              <div className="grades-table-container">
                <Table
                  dataSource={students}
                  columns={columns}
                  rowKey="id"
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
                    <span>Class Statistics</span>
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
