import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;

function AtRisk() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAtRiskStudents = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/at-risk-students");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch at-risk students: ${response.status} ${response.statusText}`
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
          const mockData = [
            {
              id: "2023001",
              name: "John Smith",
              course: "Computer Science",
              riskLevel: "high",
              gpa: 1.8,
              failedCourses: 3,
              attendanceRate: 65,
              recommendedAction: "Academic counseling and tutoring",
            },
            {
              id: "2023008",
              name: "Maria Garcia",
              course: "Biology",
              riskLevel: "high",
              gpa: 1.9,
              failedCourses: 2,
              attendanceRate: 70,
              recommendedAction:
                "Consider program shift to Allied Health Sciences",
            },
            {
              id: "2023015",
              name: "Alex Johnson",
              course: "Engineering",
              riskLevel: "medium",
              gpa: 2.2,
              failedCourses: 1,
              attendanceRate: 78,
              recommendedAction: "Math tutoring and study skills workshop",
            },
            {
              id: "2023022",
              name: "Sarah Williams",
              course: "Mathematics",
              riskLevel: "medium",
              gpa: 2.3,
              failedCourses: 1,
              attendanceRate: 82,
              recommendedAction: "Regular check-ins with academic advisor",
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

    fetchAtRiskStudents();
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
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Current Program",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (riskLevel) => {
        let color = "green";
        let icon = <InfoCircleOutlined />;

        if (riskLevel === "high") {
          color = "red";
          icon = <ExclamationCircleOutlined />;
        } else if (riskLevel === "medium") {
          color = "orange";
          icon = <WarningOutlined />;
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
        { text: "Low", value: "low" },
      ],
      onFilter: (value, record) => record.riskLevel === value,
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      render: (gpa) => (
        <Text
          style={{
            color: gpa < 2.0 ? "#ff4d4f" : gpa < 2.5 ? "#faad14" : "#52c41a",
          }}
        >
          {gpa.toFixed(1)}
        </Text>
      ),
      sorter: (a, b) => a.gpa - b.gpa,
    },
    {
      title: "Failed Courses",
      dataIndex: "failedCourses",
      key: "failedCourses",
      sorter: (a, b) => a.failedCourses - b.failedCourses,
    },
    {
      title: "Attendance",
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Recommended Action",
      dataIndex: "recommendedAction",
      key: "recommendedAction",
      render: (text) => (
        <Tooltip title={text}>
          <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small">
            Contact
          </Button>
          <Button icon={<UserSwitchOutlined />} size="small">
            Advise
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
              Students At Risk
            </Title>
          </div>
        }
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Paragraph className="mb-4">
          This dashboard identifies students who may need academic intervention
          or program shifting advice. Early intervention can help these students
          succeed in their academic journey.
        </Paragraph>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Loading student data..." />
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );
}

export default AtRisk;
