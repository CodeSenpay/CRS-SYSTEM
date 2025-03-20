import {
  BarChartOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);
  const [allClusterData, setAllClusterData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchClusterData = async () => {
    if (!yearLevel || !semester) {
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
      });
    } finally {
      setLoading(false);
    }
  };

  const processClusterData = (data) => {
    // Filter data by year level and semester if selected
    let filteredData = [...data];

    if (yearLevel) {
      // Compare against both the year_level field and extract from course field when needed
      filteredData = filteredData.filter((student) => {
        // Check direct year_level field
        if (student.year_level === yearLevel) {
          return true;
        }

        // Extract year level from course field (format: "Year X")
        if (student.course && student.course.startsWith("Year ")) {
          const courseYearLevel = student.course.replace("Year ", "");
          return courseYearLevel === yearLevel;
        }

        return false;
      });
    }

    if (semester) {
      filteredData = filteredData.filter(
        (student) => student.semester === semester
      );
    }

    // Process the cluster results into high, medium, low categories
    const clusterData = {
      high: [],
      medium: [],
      low: [],
    };

    // Process data from the ML algorithm
    filteredData.forEach((student) => {
      try {
        // Extract the actual year level from the course field if needed
        let extractedYearLevel = student.year_level || "";

        // If no year_level but we have a course field with "Year X" format
        if (
          !extractedYearLevel &&
          student.course &&
          student.course.startsWith("Year ")
        ) {
          extractedYearLevel = student.course.replace("Year ", "");
        }

        const studentData = {
          id: student.student_number || "Unknown ID",
          name:
            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
            "Unknown Name",
          course: student.course || "Unknown Course",
          grade: parseFloat(student.average_score || 0),
          isAtRisk: student.is_at_risk || false,
          recommendation: student.recommendation || null,
          yearLevel: extractedYearLevel,
          semester: student.semester || "",
        };

        // Map clusters correctly for Philippine grading system (lower is better)
        // Cluster A (best scores) → high performance
        // Cluster C (worst scores) → low performance
        if (student.cluster === "A") {
          clusterData.high.push(studentData);
        } else if (student.cluster === "B") {
          clusterData.medium.push(studentData);
        } else if (student.cluster === "C") {
          clusterData.low.push(studentData);
        }
      } catch (studentError) {
        console.error("Error processing student data:", student, studentError);
        // Continue processing other students
      }
    });

    // Sort each cluster by grade (ascending, since lower is better in Philippine system)
    clusterData.high.sort((a, b) => a.grade - b.grade);
    clusterData.medium.sort((a, b) => a.grade - b.grade);
    clusterData.low.sort((a, b) => a.grade - b.grade);

    setClusters(clusterData);
  };

  // Don't load data on initial page load anymore
  // useEffect(() => {
  //   fetchClusterData();
  // }, []);

  // When filters change AND both are selected, fetch data
  useEffect(() => {
    if (yearLevel && semester) {
      fetchClusterData();
    }
  }, [yearLevel, semester]);

  const handleSearch = () => {
    if (yearLevel && semester) {
      fetchClusterData();
    }
  };

  const handleReset = () => {
    setYearLevel("");
    setSemester("");
    setHasSearched(false);
    setClusters({
      high: [],
      medium: [],
      low: [],
    });
  };

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
      title: "Year Level",
      dataIndex: "yearLevel",
      key: "yearLevel",
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade) => (
        <span className={grade > 3.0 ? "text-red-500 font-bold" : ""}>
          {grade}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <span>
          {record.isAtRisk ? (
            <span className="text-red-500 font-bold">At Risk</span>
          ) : (
            <span className="text-green-500">Good Standing</span>
          )}
        </span>
      ),
    },
    {
      title: "Recommendation",
      key: "recommendation",
      render: (_, record) => (
        <span>
          {record.recommendation ? (
            <div>
              <div>
                <strong>{record.recommendation.recommended_action}</strong>
              </div>
              <div className="text-xs text-gray-500">
                {record.recommendation.focus_area}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">None needed</span>
          )}
        </span>
      ),
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
                  1.0-2.0
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
                <div className="font-mono bg-blue-200 text-blue-800 rounded-md px-2 py-1 mt-2 inline-block">
                  2.0-3.0
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
                <div className="font-mono bg-red-200 text-red-800 rounded-md px-2 py-1 mt-2 inline-block">
                  3.0-5.0
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
          <p>
            Philippine Grading System: 1.0 (Excellent) to 5.0 (Failed) - 3.0 or
            lower is passing
          </p>
        </div>
      </div>

      {/* Filter Form */}
      <Card className="mb-6">
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={9}>
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
            <Col xs={24} md={9}>
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
            <Col xs={24} md={6} className="flex items-end">
              <Button
                type="primary"
                onClick={handleSearch}
                disabled={!yearLevel || !semester}
                className="mr-2"
                icon={<SearchOutlined />}
              >
                Search
              </Button>
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
          description={
            yearLevel || semester
              ? `No students found matching the selected filters (Year Level: ${
                  yearLevel || "Any"
                }, Semester: ${semester || "Any"}).`
              : "No students were found or the clustering algorithm couldn't create meaningful groups. Please ensure that there are student grade records in the database."
          }
          type="info"
          showIcon
          className="mb-6"
        />
      ) : (
        <Tabs defaultActiveKey="all" type="card" className="mb-6">
          <TabPane tab="All Clusters" key="all">
            <div className="space-y-6">
              {renderClusterCard(
                "High Performance (1.0-2.0)",
                clusters.high,
                { start: "#52c41a", end: "#389e0d" },
                <TeamOutlined style={{ color: "white" }} />
              )}

              {renderClusterCard(
                "Medium Performance (2.0-3.0)",
                clusters.medium,
                { start: "#1890ff", end: "#096dd9" },
                <TeamOutlined style={{ color: "white" }} />
              )}

              {renderClusterCard(
                "Low Performance (3.0-5.0)",
                clusters.low,
                { start: "#ff4d4f", end: "#cf1322" },
                <TeamOutlined style={{ color: "white" }} />
              )}
            </div>
          </TabPane>
          <TabPane tab="High Performance" key="high">
            {renderClusterCard(
              "High Performance (1.0-2.0)",
              clusters.high,
              { start: "#52c41a", end: "#389e0d" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </TabPane>
          <TabPane tab="Medium Performance" key="medium">
            {renderClusterCard(
              "Medium Performance (2.0-3.0)",
              clusters.medium,
              { start: "#1890ff", end: "#096dd9" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </TabPane>
          <TabPane tab="Low Performance" key="low">
            {renderClusterCard(
              "Low Performance (3.0-5.0)",
              clusters.low,
              { start: "#ff4d4f", end: "#cf1322" },
              <TeamOutlined style={{ color: "white" }} />
            )}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
}

export default ViewCluster;
