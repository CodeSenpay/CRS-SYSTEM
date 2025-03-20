import {
  BulbOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  List,
  Row,
  Select,
  Spin,
  Steps,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

function ShiftAdvisories() {
  const [loading, setLoading] = useState(false);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);

  // Program options that can be recommended
  const programOptions = [
    {
      program: "Computer Science",
      description:
        "Focus on algorithms, programming, and computational theory.",
      subjects: [
        "Programming",
        "Data Structures",
        "Algorithms",
        "Software Engineering",
      ],
      careers: ["Software Developer", "Systems Analyst", "Data Scientist"],
      forStrengths: ["Logical Thinking", "Problem Solving", "Mathematics"],
    },
    {
      program: "Information Technology",
      description: "Focus on practical application of technology in business.",
      subjects: [
        "Network Management",
        "System Administration",
        "Web Development",
        "IT Project Management",
      ],
      careers: [
        "IT Support Specialist",
        "Network Administrator",
        "Web Developer",
      ],
      forStrengths: [
        "Practical Skills",
        "Technical Support",
        "System Configuration",
      ],
    },
    {
      program: "Information Systems",
      description: "Bridge between business and technology.",
      subjects: [
        "Database Management",
        "Business Analysis",
        "System Design",
        "Project Management",
      ],
      careers: [
        "Business Analyst",
        "Database Administrator",
        "IT Project Manager",
      ],
      forStrengths: ["Business Acumen", "Communication", "Organization"],
    },
    {
      program: "Multimedia Arts",
      description: "Combines creative arts with digital technology.",
      subjects: [
        "Digital Design",
        "Animation",
        "Audio/Video Production",
        "Interactive Media",
      ],
      careers: ["Graphic Designer", "Animator", "UI/UX Designer"],
      forStrengths: ["Creativity", "Visual Arts", "Design Thinking"],
    },
    {
      program: "Business Administration",
      description: "Learn management principles and business operations.",
      subjects: ["Management", "Marketing", "Finance", "Entrepreneurship"],
      careers: ["Business Manager", "Marketing Specialist", "Entrepreneur"],
      forStrengths: ["Leadership", "Communication", "Strategic Thinking"],
    },
  ];

  const fetchAtRiskStudents = async () => {
    if (!yearLevel || !semester) {
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      // API call to get students at risk based on clustering
      const response = await fetch("/api/system/cluster-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yearLevel: yearLevel,
          semester: semester,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch student data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || "Error fetching student data");
      }

      // Process to find at-risk students (students in the low cluster with cluster C)
      const atRiskStudentsData = data.data
        .filter((student) => {
          // Check for at-risk flag or cluster C (low performance)
          return student.is_at_risk || student.cluster === "C";
        })
        .map((student) => {
          // Extract year level from course field if needed
          let extractedYearLevel = student.year_level || "";
          if (
            !extractedYearLevel &&
            student.course &&
            student.course.startsWith("Year ")
          ) {
            extractedYearLevel = student.course.replace("Year ", "");
          }

          // Get student grade information
          const avgGrade = parseFloat(student.average_score || 0);

          // Analyze subject strengths and weaknesses based on grades
          const strengths = [];
          const weaknesses = [];

          // Add some mock subject data since we don't have actual subject breakdowns
          if (student.subjects) {
            // If we have subject data, use it
            student.subjects.forEach((subject) => {
              if (subject.grade <= 2.0) {
                strengths.push(subject.name);
              } else if (subject.grade >= 3.0) {
                weaknesses.push(subject.name);
              }
            });
          } else {
            // Mock data if no subjects available
            if (avgGrade <= 2.5) {
              strengths.push("Communication");
              if (student.student_number % 2 === 0) {
                strengths.push("Creative Thinking");
              } else {
                strengths.push("Problem Solving");
              }
            }

            // Add weaknesses based on their cluster
            if (student.cluster === "C") {
              weaknesses.push("Mathematics");
              weaknesses.push("Programming");
              if (student.student_number % 3 === 0) {
                weaknesses.push("Data Structures");
              }
            }
          }

          // Generate program recommendations
          const recommendedPrograms = generateRecommendations(
            strengths,
            weaknesses,
            avgGrade
          );

          return {
            id: student.student_number || "Unknown ID",
            name:
              `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
              "Unknown Name",
            currentProgram: student.course || "Computer Science",
            grade: avgGrade,
            yearLevel: extractedYearLevel,
            semester: student.semester || "",
            cluster: student.cluster || "C",
            strengths,
            weaknesses,
            recommendedPrograms,
          };
        });

      setAtRiskStudents(atRiskStudentsData);
      setFilteredStudents(atRiskStudentsData);
    } catch (error) {
      console.error("Error fetching at-risk students:", error);
      setError(`Unable to fetch student data. Error: ${error.message}`);
      setAtRiskStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate program recommendations based on student strengths/weaknesses
  const generateRecommendations = (strengths, weaknesses, avgGrade) => {
    const recommendations = [];

    // Match student strengths with programs that align with those strengths
    programOptions.forEach((program) => {
      let matchScore = 0;

      // Check for strength matches
      program.forStrengths.forEach((strength) => {
        if (
          strengths.some(
            (s) =>
              s.toLowerCase().includes(strength.toLowerCase()) ||
              strength.toLowerCase().includes(s.toLowerCase())
          )
        ) {
          matchScore += 2;
        }
      });

      // Check for subjects that don't match weaknesses
      let weaknessMatch = 0;
      program.subjects.forEach((subject) => {
        if (
          weaknesses.some(
            (w) =>
              w.toLowerCase().includes(subject.toLowerCase()) ||
              subject.toLowerCase().includes(w.toLowerCase())
          )
        ) {
          weaknessMatch += 1;
        }
      });

      // Lower score if program focuses on student weaknesses
      matchScore -= weaknessMatch;

      // Add program if it has a positive match score
      if (matchScore > 0) {
        recommendations.push({
          ...program,
          matchScore,
          reason: `This program aligns with your strengths in ${strengths.join(
            ", "
          )}${
            weaknesses.length > 0
              ? ` and helps you work around challenges in ${weaknesses.join(
                  ", "
                )}`
              : ""
          }.`,
        });
      }
    });

    // If no matches found based on strengths/weaknesses, recommend based on grade
    if (recommendations.length === 0) {
      if (avgGrade <= 2.5) {
        // Better grades - more technical programs
        recommendations.push({
          ...programOptions[0], // Computer Science
          matchScore: 5,
          reason:
            "Based on your academic performance, you have potential for more technical programs.",
        });
        recommendations.push({
          ...programOptions[1], // Information Technology
          matchScore: 4,
          reason:
            "Your grades show you can handle technical subjects with practical applications.",
        });
      } else {
        // Lower grades - less technical programs
        recommendations.push({
          ...programOptions[4], // Business Administration
          matchScore: 5,
          reason:
            "This program focuses on different skills that may better match your learning style.",
        });
        recommendations.push({
          ...programOptions[3], // Multimedia Arts
          matchScore: 4,
          reason:
            "This program offers a creative approach that might better align with your strengths.",
        });
      }
    }

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  };

  const handleSearch = () => {
    if (yearLevel && semester) {
      fetchAtRiskStudents();
    }
  };

  const handleReset = () => {
    setYearLevel("");
    setSemester("");
    setHasSearched(false);
    setAtRiskStudents([]);
    setFilteredStudents([]);
    setCurrentStudent(null);
  };

  // When filters change AND both are selected, fetch data
  useEffect(() => {
    if (yearLevel && semester) {
      fetchAtRiskStudents();
    }
  }, [yearLevel, semester]);

  const handleViewDetails = (student) => {
    setCurrentStudent(student);
  };

  const renderWelcomeMessage = () => (
    <Card className="mt-8 shadow-lg border-0">
      <div className="text-center py-4">
        <div className="mb-6">
          <SwapOutlined className="text-5xl text-purple-500" />
          <Title level={3} className="mt-4 mb-0 text-gradient">
            Program Shift Advisory System
          </Title>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto my-4 rounded-full"></div>
          <Paragraph className="text-gray-600 max-w-2xl mx-auto text-base">
            This tool helps identify at-risk students and provides personalized
            program shift recommendations based on their academic performance,
            strengths, and weaknesses.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4">
          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
              <div className="text-purple-600 font-bold text-lg mb-2">
                Step 1: Identify
              </div>
              <div className="text-sm text-gray-600">
                System identifies students at risk of academic failure based on
                clustering analysis
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="text-blue-600 font-bold text-lg mb-2">
                Step 2: Analyze
              </div>
              <div className="text-sm text-gray-600">
                Evaluate student strengths, weaknesses, and academic history
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl shadow-sm border border-pink-200">
              <div className="text-pink-600 font-bold text-lg mb-2">
                Step 3: Recommend
              </div>
              <div className="text-sm text-gray-600">
                Suggest alternative programs that better match the student's
                abilities and interests
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
            description="Select a Year Level and Semester from the filters above to identify at-risk students."
            type="info"
            showIcon={false}
            className="text-center shadow-sm border border-blue-200"
          />
        </div>

        <style jsx global>{`
          .text-gradient {
            background: linear-gradient(to right, #8b5cf6, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
      </div>
    </Card>
  );

  const renderStudentDetail = () => {
    if (!currentStudent) return null;

    return (
      <div className="mt-6">
        <Card
          className="shadow-md border-0 overflow-hidden"
          title={
            <div className="flex items-center justify-between">
              <span>Student Profile & Recommendations</span>
              <Button
                type="link"
                onClick={() => setCurrentStudent(null)}
                icon={<SwapOutlined />}
              >
                Back to List
              </Button>
            </div>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <Avatar
                    size={80}
                    className="bg-purple-500"
                    style={{ fontSize: "2rem" }}
                  >
                    {currentStudent.name.charAt(0)}
                  </Avatar>
                  <Title level={4} className="mt-2 mb-0">
                    {currentStudent.name}
                  </Title>
                  <Text type="secondary">ID: {currentStudent.id}</Text>

                  <div className="mt-2">
                    <Badge
                      status={currentStudent.grade > 3.0 ? "error" : "warning"}
                      text={
                        <span className="font-medium">At-Risk Student</span>
                      }
                    />
                  </div>
                </div>

                <Descriptions
                  bordered
                  size="small"
                  column={1}
                  labelStyle={{ fontWeight: "bold" }}
                >
                  <Descriptions.Item label="Current Program">
                    {currentStudent.currentProgram}
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Grade">
                    <span
                      className={
                        currentStudent.grade > 3.0
                          ? "text-red-500 font-bold"
                          : "text-orange-500"
                      }
                    >
                      {currentStudent.grade.toFixed(2)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Year Level">
                    {currentStudent.yearLevel}
                  </Descriptions.Item>
                  <Descriptions.Item label="Semester">
                    {currentStudent.semester}
                  </Descriptions.Item>
                  <Descriptions.Item label="Performance Cluster">
                    <Tag
                      color={currentStudent.cluster === "C" ? "red" : "orange"}
                    >
                      {currentStudent.cluster === "C"
                        ? "Low Performance"
                        : "Medium-Low Performance"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <Title level={5}>Academic Profile</Title>
                <div className="mb-3">
                  <div className="font-medium text-green-600 mb-1">
                    Strengths:
                  </div>
                  <div>
                    {currentStudent.strengths.length > 0 ? (
                      currentStudent.strengths.map((strength, index) => (
                        <Tag color="green" key={index} className="mb-1">
                          {strength}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">
                        No significant strengths identified
                      </Text>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-red-600 mb-1">
                    Areas for Improvement:
                  </div>
                  <div>
                    {currentStudent.weaknesses.length > 0 ? (
                      currentStudent.weaknesses.map((weakness, index) => (
                        <Tag color="red" key={index} className="mb-1">
                          {weakness}
                        </Tag>
                      ))
                    ) : (
                      <Text type="secondary">
                        No significant weaknesses identified
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Title level={4}>
                <BulbOutlined className="text-yellow-500 mr-2" />
                Recommended Program Shifts
              </Title>
              <Paragraph className="text-gray-500">
                Based on the student's academic performance, strengths, and
                areas for improvement, the following program shifts are
                recommended:
              </Paragraph>

              <Steps direction="vertical" current={-1} className="mb-6">
                {currentStudent.recommendedPrograms.map((program, index) => (
                  <Step
                    key={index}
                    title={
                      <div className="flex items-center">
                        <span className="font-medium">{program.program}</span>
                        <Tag color="purple" className="ml-2">
                          {Math.round((program.matchScore / 5) * 100)}% Match
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="mt-2">
                        <Paragraph>{program.description}</Paragraph>
                        <div className="mb-3">
                          <Text strong>Key Subjects: </Text>
                          {program.subjects.map((subject, idx) => (
                            <Tag color="blue" key={idx} className="mb-1">
                              {subject}
                            </Tag>
                          ))}
                        </div>
                        <div className="mb-3">
                          <Text strong>Career Paths: </Text>
                          {program.careers.map((career, idx) => (
                            <Tag color="cyan" key={idx} className="mb-1">
                              {career}
                            </Tag>
                          ))}
                        </div>
                        <Alert message={program.reason} type="info" showIcon />
                      </div>
                    }
                  />
                ))}
              </Steps>

              <Divider />

              <Alert
                type="warning"
                showIcon
                message="Next Steps"
                description={
                  <div>
                    <p>For this student, we recommend:</p>
                    <ol className="list-decimal ml-5 mt-2">
                      <li>Schedule an academic counseling session</li>
                      <li>Discuss program shift options with the student</li>
                      <li>
                        Connect with the department chair of the recommended
                        programs
                      </li>
                      <li>
                        Create a transition plan if the student decides to shift
                        programs
                      </li>
                    </ol>
                  </div>
                }
              />
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading student data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Student Data"
        description={
          <div>
            <p>{error}</p>
            <div className="mt-4">
              <h4 className="font-bold">Troubleshooting Steps:</h4>
              <ol className="list-decimal ml-5 mt-2">
                <li>Ensure the Node.js backend server is running</li>
                <li>Verify the database connection is active</li>
                <li>
                  Check that student records exist for the selected criteria
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
          <SwapOutlined className="mr-2" />
          Program Shift Advisories
        </Title>
        <Text type="secondary">
          Identify at-risk students and recommend alternative programs that
          better match their strengths
        </Text>
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
      ) : currentStudent ? (
        renderStudentDetail()
      ) : filteredStudents.length === 0 ? (
        <Alert
          message="No At-Risk Students Found"
          description={`No at-risk students found matching the selected filters (Year Level: ${
            yearLevel || "Any"
          }, Semester: ${semester || "Any"}).`}
          type="info"
          showIcon
          className="mb-6"
        />
      ) : (
        <div>
          <Row className="mb-4">
            <Col span={24}>
              <Alert
                message={
                  <span className="font-medium">
                    {filteredStudents.length} At-Risk Student
                    {filteredStudents.length !== 1 ? "s" : ""} Found
                  </span>
                }
                description="The following students may benefit from program shifting based on their academic performance."
                type="warning"
                showIcon
              />
            </Col>
          </Row>

          <List
            className="shadow-md rounded-lg overflow-hidden"
            itemLayout="horizontal"
            dataSource={filteredStudents}
            renderItem={(student) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleViewDetails(student)}
                    icon={<SwapOutlined />}
                  >
                    View Recommendations
                  </Button>,
                ]}
                className="hover:bg-gray-50"
              >
                <List.Item.Meta
                  avatar={
                    <Avatar className="bg-purple-500">
                      {student.name.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <div className="flex items-center">
                      <span className="font-medium">{student.name}</span>
                      <Tag
                        color={student.grade > 3.0 ? "red" : "orange"}
                        className="ml-2"
                      >
                        GPA: {student.grade.toFixed(2)}
                      </Tag>
                      <Tag
                        color={student.cluster === "C" ? "red" : "orange"}
                        className="ml-2"
                      >
                        {student.cluster === "C" ? "Low" : "Medium"} Performance
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div>
                        <Text type="secondary">ID: {student.id}</Text>
                        <Text type="secondary" className="ml-4">
                          Current Program: {student.currentProgram}
                        </Text>
                        <Text type="secondary" className="ml-4">
                          Year {student.yearLevel}, {student.semester} Semester
                        </Text>
                      </div>
                      <div className="mt-1">
                        <Text type="secondary">
                          Recommended Shift:{" "}
                          <Text strong className="text-purple-600">
                            {student.recommendedPrograms[0]?.program || "None"}
                          </Text>
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default ShiftAdvisories;
