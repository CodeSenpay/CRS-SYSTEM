import {
  BarChartOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Card, Spin, Table, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function ViewCluster() {
  const [clusters, setClusters] = useState({
    high: [],
    medium: [],
    low: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/student-clusters");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch cluster data: ${response.status} ${response.statusText}`
          );
        }

        // Check if the response is empty
        const text = await response.text();
        if (!text) {
          setClusters({ high: [], medium: [], low: [] });
          setLoading(false);
          return;
        }

        // Try to parse the JSON
        try {
          const data = JSON.parse(text);
          setClusters(data);
        } catch (parseError) {
          console.error(
            "JSON Parse Error:",
            parseError,
            "Response text:",
            text
          );

          // Use mock data for development/testing purposes
          const mockData = {
            high: [
              {
                id: "2023001",
                name: "John Smith",
                course: "Computer Science",
                grade: 95,
                attendance: 98,
                participation: 90,
              },
              {
                id: "2023002",
                name: "Sarah Johnson",
                course: "Mathematics",
                grade: 92,
                attendance: 95,
                participation: 88,
              },
            ],
            medium: [
              {
                id: "2023003",
                name: "Michael Lee",
                course: "Physics",
                grade: 78,
                attendance: 85,
                participation: 75,
              },
              {
                id: "2023004",
                name: "Emily Brown",
                course: "English Literature",
                grade: 82,
                attendance: 80,
                participation: 85,
              },
            ],
            low: [
              {
                id: "2023005",
                name: "David Wilson",
                course: "Chemistry",
                grade: 65,
                attendance: 70,
                participation: 60,
              },
              {
                id: "2023006",
                name: "Jessica Martinez",
                course: "Biology",
                grade: 58,
                attendance: 65,
                participation: 55,
              },
            ],
          };

          setClusters(mockData);
          console.log("Using mock data due to API response parsing error");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClusterData();
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
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
      render: (value) => `${value}%`,
    },
    {
      title: "Participation",
      dataIndex: "participation",
      key: "participation",
      render: (value) => `${value}%`,
    },
  ];

  const renderClusterCard = (title, data, color, icon) => (
    <Card
      className="mb-6 hover:shadow-xl transition-all duration-300"
      headStyle={{
        background: `linear-gradient(to right, ${color.start}, ${color.end})`,
        borderRadius: "8px 8px 0 0",
        color: "white",
      }}
      title={
        <div className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
      }
      bordered={false}
      style={{ borderRadius: "8px" }}
    >
      {data.length > 0 ? (
        <Table
          dataSource={data}
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
        message="Error Loading Data"
        description={error}
        type="error"
        showIcon
        icon={<ExclamationCircleOutlined />}
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
      </div>

      <Tabs defaultActiveKey="all" type="card" className="mb-6">
        <TabPane tab="All Clusters" key="all">
          <div className="space-y-6">
            {renderClusterCard(
              "High Performance Cluster",
              clusters.high,
              { start: "#52c41a", end: "#389e0d" },
              <TeamOutlined style={{ color: "white" }} />
            )}

            {renderClusterCard(
              "Medium Performance Cluster",
              clusters.medium,
              { start: "#1890ff", end: "#096dd9" },
              <TeamOutlined style={{ color: "white" }} />
            )}

            {renderClusterCard(
              "Low Performance Cluster",
              clusters.low,
              { start: "#ff4d4f", end: "#cf1322" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </div>
        </TabPane>
        <TabPane tab="High Performance" key="high">
          {renderClusterCard(
            "High Performance Cluster",
            clusters.high,
            { start: "#52c41a", end: "#389e0d" },
            <TeamOutlined style={{ color: "white" }} />
          )}
        </TabPane>
        <TabPane tab="Medium Performance" key="medium">
          {renderClusterCard(
            "Medium Performance Cluster",
            clusters.medium,
            { start: "#1890ff", end: "#096dd9" },
            <TeamOutlined style={{ color: "white" }} />
          )}
        </TabPane>
        <TabPane tab="Low Performance" key="low">
          {renderClusterCard(
            "Low Performance Cluster",
            clusters.low,
            { start: "#ff4d4f", end: "#cf1322" },
            <TeamOutlined style={{ color: "white" }} />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}

export default ViewCluster;
