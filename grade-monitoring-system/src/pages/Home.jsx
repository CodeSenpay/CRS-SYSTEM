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
  Row,
  Spin,
  Statistic,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [statistics, setStatistics] = useState({
    studentCount: 0,
    subjectCount: 0,
    gradeAverage: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all student grades
        const gradesResponse = await axios.get(
          "http://localhost:3000/api/system/all-student-grades",
          {
            withCredentials: true,
          }
        );

        // Fetch all subjects
        const subjectsResponse = await axios.get(
          "http://localhost:3000/api/system/get-all-subjects",
          {
            withCredentials: true,
          }
        );

        const gradesData = Array.isArray(gradesResponse.data)
          ? gradesResponse.data
          : [];
        const subjectsData = subjectsResponse.data.data || [];

        // Calculate statistics
        if (gradesData.length > 0) {
          // Get unique student count
          const uniqueStudents = [
            ...new Set(gradesData.map((item) => item.student_number)),
          ];

          // Calculate grade average
          const grades = gradesData
            .map((student) => student.score)
            .filter((grade) => !isNaN(grade));

          const gradeAverage =
            grades.length > 0
              ? (
                  grades.reduce((sum, grade) => sum + parseFloat(grade), 0) /
                  grades.length
                ).toFixed(1)
              : 0;

          setStatistics({
            studentCount: uniqueStudents.length,
            subjectCount: subjectsData.length,
            gradeAverage: gradeAverage,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Keep defaults in case of error
      } finally {
        setIsLoaded(true);
      }
    };

    fetchDashboardData();
  }, []);

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
    </div>
  );
}

export default Home;
