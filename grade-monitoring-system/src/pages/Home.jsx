import {
  BookOutlined,
  LineChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tabs,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [statistics, setStatistics] = useState({
    studentCount: 0,
    subjectCount: 0,
    gradeAverage: 0,
  });
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isStudentsModalVisible, setIsStudentsModalVisible] = useState(false);
  const [isSubjectsModalVisible, setIsSubjectsModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch student count
        const studentCountResponse = await axios.get(
          "http://localhost:3000/api/system/get-student-count",
          {
            withCredentials: true,
          }
        );

        // Fetch subject count
        const subjectCountResponse = await axios.get(
          "http://localhost:3000/api/system/get-subject-count",
          {
            withCredentials: true,
          }
        );

        // Fetch all student grades for average calculation
        const gradesResponse = await axios.get(
          "http://localhost:3000/api/system/all-student-grades",
          {
            withCredentials: true,
          }
        );

        const gradesData = Array.isArray(gradesResponse.data)
          ? gradesResponse.data
          : [];

        // Calculate grade average
        let gradeAverage = 0;
        if (gradesData.length > 0) {
          const grades = gradesData
            .map((student) => student.score)
            .filter((grade) => !isNaN(grade));

          gradeAverage =
            grades.length > 0
              ? (
                  grades.reduce((sum, grade) => sum + parseFloat(grade), 0) /
                  grades.length
                ).toFixed(1)
              : 0;
        }

        setStatistics({
          studentCount: studentCountResponse.data.count,
          subjectCount: subjectCountResponse.data.count,
          gradeAverage: gradeAverage,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchStudents = async (yearLevel) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/system/get-students-by-year?yearLevel=${yearLevel}`,
        {
          withCredentials: true,
        }
      );
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchSubjects = async (yearLevel, semester) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/system/get-subjects-by-year-semester?yearLevel=${yearLevel}&semester=${semester}`,
        {
          withCredentials: true,
        }
      );
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const studentColumns = [
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) =>
        `${record.first_name} ${record.middle_name} ${record.last_name}`,
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
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
    },
  ];

  const subjectColumns = [
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
      title: "Units",
      key: "units",
      render: (_, record) =>
        `${record.lec_units} (Lec) ${record.lab_units} (Lab)`,
    },
    {
      title: "Course",
      dataIndex: "course_code",
      key: "course_code",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
  ];

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center h-[calc(100vh-32px)]"
        style={{ backgroundColor: "#e6f7ff" }}
      >
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="w-full" style={{ backgroundColor: "#e6f7ff" }}>
      <div className="animate-fadeIn">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={24}>
            <Card className="bg-gradient-to-r from-[#59bf8f] to-[#3caea3] rounded-xl shadow-lg border-none overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-white mb-4 md:mb-0 max-w-2xl">
                  <Title
                    level={2}
                    style={{
                      color: "rgba(28, 28, 28, 0.9)",
                      marginBottom: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Welcome to the Grading System Dashboard
                  </Title>
                  <Paragraph
                    style={{
                      color: "rgba(28, 28, 28, 0.9)",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      marginBottom: "16px",
                    }}
                  >
                    Monitor and analyze student performance with our
                    comprehensive grading tools. Get insights, track progress,
                    and make data-driven decisions.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: "#59bf8f",
                      borderColor: "#59bf8f",
                      borderRadius: "8px",
                      fontWeight: "500",
                    }}
                    className="hover:bg-[#3caea3] transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <br />
        <br />
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <Card
                hoverable
                className="h-full shadow-md border-t-4 border-t-[#59bf8f] rounded-lg transition-all hover:transform hover:scale-[1.02]"
              >
                <Statistic
                  title={<span className="text-lg font-medium">Students</span>}
                  value={statistics.studentCount}
                  prefix={<UserOutlined className="mr-2" />}
                  valueStyle={{
                    color: "#59bf8f",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
                <Divider />
                <Paragraph className="text-gray-600">
                  Total registered students in the system
                </Paragraph>
                <Button
                  type="link"
                  className="p-0 text-[#59bf8f] font-medium hover:text-[#3caea3]"
                  onClick={() => setIsStudentsModalVisible(true)}
                >
                  View all students →
                </Button>
              </Card>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              <Card
                hoverable
                className="h-full shadow-md border-t-4 border-t-[#3caea3] rounded-lg transition-all hover:transform hover:scale-[1.02]"
              >
                <Statistic
                  title={<span className="text-lg font-medium">Subjects</span>}
                  value={statistics.subjectCount}
                  prefix={<BookOutlined className="mr-2" />}
                  valueStyle={{
                    color: "#3caea3",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
                <Divider />
                <Paragraph className="text-gray-600">
                  Total subjects being monitored
                </Paragraph>
                <Button
                  type="link"
                  className="p-0 text-[#3caea3] font-medium hover:text-[#59bf8f]"
                  onClick={() => setIsSubjectsModalVisible(true)}
                >
                  Manage subjects →
                </Button>
              </Card>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: "0.3s" }}
            >
              <Card
                hoverable
                className="h-full shadow-md border-t-4 border-t-[#2c3e50] rounded-lg transition-all hover:transform hover:scale-[1.02]"
              >
                <Statistic
                  title={
                    <span className="text-lg font-medium">Grade Average</span>
                  }
                  value={statistics.gradeAverage}
                  precision={1}
                  suffix="%"
                  prefix={<LineChartOutlined className="mr-2" />}
                  valueStyle={{
                    color: "#2c3e50",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
                <Divider />
                <Paragraph className="text-gray-600">
                  Overall student performance
                </Paragraph>
                <Button
                  type="link"
                  className="p-0 text-[#2c3e50] font-medium hover:text-[#59bf8f]"
                >
                  View analytics →
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      </div>

      {/* Students Modal */}
      <Modal
        title="Students by Year Level"
        open={isStudentsModalVisible}
        onCancel={() => setIsStudentsModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Select
          style={{ width: 200, marginBottom: 20 }}
          placeholder="Select Year Level"
          onChange={(value) => {
            setSelectedYear(value);
            fetchStudents(value);
          }}
        >
          <Select.Option value="1">First Year</Select.Option>
          <Select.Option value="2">Second Year</Select.Option>
          <Select.Option value="3">Third Year</Select.Option>
          <Select.Option value="4">Fourth Year</Select.Option>
        </Select>

        {selectedYear && (
          <Table
            columns={studentColumns}
            dataSource={students}
            rowKey="student_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>

      {/* Subjects Modal */}
      <Modal
        title="Subjects by Year Level and Semester"
        open={isSubjectsModalVisible}
        onCancel={() => setIsSubjectsModalVisible(false)}
        width={1000}
        footer={null}
      >
        <div style={{ marginBottom: 20 }}>
          <Select
            style={{ width: 200, marginRight: 20 }}
            placeholder="Select Year Level"
            onChange={(value) => {
              setSelectedYear(value);
              if (selectedSemester) {
                fetchSubjects(value, selectedSemester);
              }
            }}
          >
            <Select.Option value="1">First Year</Select.Option>
            <Select.Option value="2">Second Year</Select.Option>
            <Select.Option value="3">Third Year</Select.Option>
            <Select.Option value="4">Fourth Year</Select.Option>
          </Select>

          <Select
            style={{ width: 200 }}
            placeholder="Select Semester"
            onChange={(value) => {
              setSelectedSemester(value);
              if (selectedYear) {
                fetchSubjects(selectedYear, value);
              }
            }}
          >
            <Select.Option value="First">First Semester</Select.Option>
            <Select.Option value="Second">Second Semester</Select.Option>
          </Select>
        </div>

        {selectedYear && selectedSemester && (
          <Table
            columns={subjectColumns}
            dataSource={subjects}
            rowKey="subject_code"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </div>
  );
}

export default Home;
