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
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
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
                  value={256}
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
                  title={<span className="text-lg font-medium">Courses</span>}
                  value={42}
                  prefix={<BookOutlined className="mr-2" />}
                  valueStyle={{
                    color: "#3caea3",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
                <Divider />
                <Paragraph className="text-gray-600">
                  Active courses being monitored
                </Paragraph>
                <Button
                  type="link"
                  className="p-0 text-[#3caea3] font-medium hover:text-[#59bf8f]"
                >
                  Manage courses →
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
                  value={85.7}
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
