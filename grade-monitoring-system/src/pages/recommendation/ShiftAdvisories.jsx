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
  Empty,
  Form,
  List,
  Row,
  Select,
  Spin,
  Steps,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

function ShiftAdvisories() {
  const [loading, setLoading] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [yearLevels] = useState(["1", "2", "3", "4"]);
  const [semesters] = useState(["First", "Second", "Summer"]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [loadingSchoolYears, setLoadingSchoolYears] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);

  // Fetch school years from the API
  useEffect(() => {
    const fetchSchoolYears = async () => {
      setLoadingSchoolYears(true);
      try {
        const response = await axios.get(
          "http://localhost:3000/api/system/school-years",
          { withCredentials: true }
        );

        if (response.data.success) {
          setSchoolYears(response.data.data);
        } else {
          console.error("Failed to fetch school years:", response.data.message);
          // Fallback to default options
          const currentYear = new Date().getFullYear();
          const defaultOptions = [
            `${currentYear - 1}-${currentYear}`,
            `${currentYear}-${currentYear + 1}`,
            `${currentYear + 1}-${currentYear + 2}`,
          ];
          setSchoolYears(defaultOptions);
        }
      } catch (error) {
        console.error("Error fetching school years:", error);
        // Fallback to default options
        const currentYear = new Date().getFullYear();
        const defaultOptions = [
          `${currentYear - 1}-${currentYear}`,
          `${currentYear}-${currentYear + 1}`,
          `${currentYear + 1}-${currentYear + 2}`,
        ];
        setSchoolYears(defaultOptions);
      } finally {
        setLoadingSchoolYears(false);
      }
    };

    fetchSchoolYears();
  }, []);

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
    if (!yearLevel || !semester || !schoolYear) {
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      // API call to get students at risk based on clustering
      console.log(
        `[API REQUEST] Fetching at-risk students with filters: School Year: ${schoolYear}, Year Level: ${yearLevel}, Semester: ${semester}`
      );

      const response = await axios.post(
        "http://localhost:3000/api/system/cluster-students",
        {
          yearLevel: yearLevel,
          semester: semester,
          schoolYear: schoolYear,
        }
      );

      console.log("[API RESPONSE] Cluster Students - Status:", response.status);
      console.log("[API RESPONSE] Cluster Students - Full Response:", response);
      console.log("[API RESPONSE] Cluster Students - Data:", response.data);

      if (!response.data.success || !Array.isArray(response.data.data)) {
        console.error("[API ERROR] Invalid response format:", response.data);
        throw new Error(response.data.message || "Error fetching student data");
      }

      console.log(
        `[API SUCCESS] Found ${response.data.data.length} students from API`
      );

      // Process to find at-risk students using the same threshold as ViewCluster.jsx
      const atRiskStudentsData = response.data.data
        .filter((student) => {
          // Filter by year level
          let matchesYearLevel = false;

          // Check direct year_level field
          if (student.year_level === yearLevel) {
            matchesYearLevel = true;
          }
          // Extract year level from course field (format: "Year X")
          else if (student.course && student.course.startsWith("Year ")) {
            const courseYearLevel = student.course.replace("Year ", "");
            if (courseYearLevel === yearLevel) {
              matchesYearLevel = true;
            }
          }

          // Filter by semester
          const matchesSemester = student.semester === semester;

          // Updated filter: using the same criteria as AtRisk.jsx
          // 1. Overall grade above 3.3
          // 2. Major subjects average above 2.5
          // 3. Minor subjects average above 3.0
          const overallGrade = parseFloat(student.average_score || 0);
          const majorGrade =
            student.major_grade !== null
              ? parseFloat(student.major_grade)
              : null;
          const minorGrade =
            student.minor_grade !== null
              ? parseFloat(student.minor_grade)
              : null;

          // Student is at risk if ANY of these criteria are met
          const isAtRisk =
            overallGrade > 3.3 ||
            (majorGrade !== null && majorGrade > 2.5) ||
            (minorGrade !== null && minorGrade > 3.0);

          console.log(
            `[PROCESSING] Student ${
              student.student_number || student.id
            }: Overall=${overallGrade}, Major=${majorGrade}, Minor=${minorGrade}, isAtRisk=${isAtRisk}, matches=${
              matchesYearLevel && matchesSemester && isAtRisk
            }`
          );

          const matches = matchesYearLevel && matchesSemester && isAtRisk;
          return matches;
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
          const overallGrade = parseFloat(student.average_score || 0);
          const majorGrade =
            student.major_grade !== null
              ? parseFloat(student.major_grade)
              : null;
          const minorGrade =
            student.minor_grade !== null
              ? parseFloat(student.minor_grade)
              : null;

          // Determine risk level based on combined risk factors
          let riskLevel = "medium";
          let riskReasons = [];

          if (overallGrade > 3.3) {
            riskReasons.push("Overall GPA > 3.3");
          }

          if (majorGrade !== null && majorGrade > 2.5) {
            riskReasons.push("Major subjects > 2.5");
          }

          if (minorGrade !== null && minorGrade > 3.0) {
            riskReasons.push("Minor subjects > 3.0");
          }

          // Assign higher risk level for more severe cases
          if (
            overallGrade >= 4.0 ||
            (majorGrade !== null && majorGrade >= 4.0) ||
            (minorGrade !== null && minorGrade >= 4.0)
          ) {
            riskLevel = "high";
          }

          return {
            id: student.student_number || "Unknown ID",
            name:
              `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
              "Unknown Name",
            currentProgram: student.course || "Computer Science",
            grade: overallGrade,
            majorGrade,
            minorGrade,
            yearLevel: extractedYearLevel,
            semester: student.semester || "",
            cluster: student.cluster || "C",
            riskLevel,
            riskReasons: riskReasons.join(", "),
            // We'll fetch real subject data when a student is selected
            strengths: [],
            weaknesses: [],
            // We'll generate recommendations after fetching subject data
            recommendedPrograms: [],
            rawData: student, // Store original data for reference
          };
        });

      console.log(`[FILTERED] At-risk students: ${atRiskStudentsData.length}`);
      console.log(
        "[FILTERED] Detailed filtered student data:",
        atRiskStudentsData
      );

      setFilteredStudents(atRiskStudentsData);
    } catch (error) {
      console.error("[API ERROR] Error fetching at-risk students:", error);
      console.error(
        "[API ERROR] Details:",
        error.response?.data || error.message
      );
      setError(`Unable to fetch student data. Error: ${error.message}`);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch a student's actual subject data
  const fetchStudentSubjects = async (studentId) => {
    setSubjectLoading(true);
    try {
      console.log(
        `[API REQUEST] Fetching grades for student ${studentId} (School Year: ${schoolYear}, Semester: ${semester})`
      );

      const response = await axios.post(
        "http://localhost:3000/api/system/student-grades",
        {
          studentId: studentId,
          semester: semester,
          schoolYear: schoolYear,
        }
      );

      console.log("[API RESPONSE] Student Grades - Status:", response.status);
      console.log("[API RESPONSE] Student Grades - Full Response:", response);
      console.log("[API RESPONSE] Student Grades - Data:", response.data);
      console.log(
        `[API SUCCESS] Received ${response.data.length} subjects for student ${studentId}`
      );

      // Transform the API response into our expected subject format
      const subjects = response.data.map((grade) => ({
        name: grade.subject_name,
        code: grade.subject_code,
        grade: parseFloat(grade.score) || 0,
        units: 3, // Assuming 3 units as default since API doesn't provide units
        subject_type: grade.subject_type || null, // Capture subject_type if available
        isPassing: grade.subject_type?.toLowerCase().includes("major")
          ? parseFloat(grade.score) <= 2.5
          : parseFloat(grade.score) <= 3.0,
        semester: grade.semester,
      }));

      console.log("[PROCESSING] Transformed subjects data:", subjects);

      // Filter by the selected semester if it exists
      const filteredSubjects = semester
        ? subjects.filter((subject) => subject.semester === semester)
        : subjects;

      console.log(
        `[PROCESSING] Filtered ${subjects.length} subjects to ${filteredSubjects.length} for semester ${semester}`
      );

      // Sort by grade (best performance first)
      filteredSubjects.sort((a, b) => a.grade - b.grade);

      console.log(
        "[PROCESSED] Final filtered and sorted subjects:",
        filteredSubjects
      );

      return filteredSubjects;
    } catch (error) {
      console.error("[API ERROR] Error fetching student grades:", error);
      console.error(
        "[API ERROR] Details:",
        error.response?.data || error.message
      );
      return []; // Return empty array in case of error
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleReset = () => {
    setYearLevel("");
    setSemester("");
    setSchoolYear("");
    setHasSearched(false);
    setFilteredStudents([]);
    setCurrentStudent(null);
    setStudentSubjects([]);
  };

  // When filters change AND all are selected, fetch data
  useEffect(() => {
    if (yearLevel && semester && schoolYear) {
      console.log(
        `Filters selected: School Year: ${schoolYear}, Year Level: ${yearLevel}, Semester: ${semester}`
      );
      fetchAtRiskStudents();
    }
  }, [yearLevel, semester, schoolYear]);

  const handleViewDetails = async (student) => {
    console.log("Starting recommendation process for student:", student.id);
    // Fetch the student's actual grades for the selected semester
    const subjects = await fetchStudentSubjects(student.id);
    setStudentSubjects(subjects);
    console.log("Fetched subjects:", subjects);

    // Group subjects by performance level based on subject type
    const exceptionalSubjects = subjects.filter((s) => s.grade <= 1.5);
    const failingSubjects = subjects.filter((s) => !s.isPassing);

    console.log("Exceptional subjects:", exceptionalSubjects);
    console.log("Failing subjects:", failingSubjects);

    // Calculate major and minor subject grades if subject_type is available
    let majorGrade = null;
    let minorGrade = null;

    // First check if subjects have subject_type property
    const hasMajorMinorInfo = subjects.some((s) => s.subject_type);

    if (hasMajorMinorInfo) {
      const majorSubjects = subjects.filter((s) =>
        s.subject_type?.toLowerCase().includes("major")
      );
      const minorSubjects = subjects.filter((s) =>
        s.subject_type?.toLowerCase().includes("minor")
      );

      // Calculate average grades if subjects exist
      if (majorSubjects.length > 0) {
        majorGrade =
          majorSubjects.reduce((sum, s) => sum + s.grade, 0) /
          majorSubjects.length;
        console.log(
          `Calculated major subjects grade: ${majorGrade.toFixed(2)} from ${
            majorSubjects.length
          } subjects`
        );
      }

      if (minorSubjects.length > 0) {
        minorGrade =
          minorSubjects.reduce((sum, s) => sum + s.grade, 0) /
          minorSubjects.length;
        console.log(
          `Calculated minor subjects grade: ${minorGrade.toFixed(2)} from ${
            minorSubjects.length
          } subjects`
        );
      }
    } else {
      console.log("Subject type information not available in the data");
    }

    // Extract subject names for tracking
    const strengths = exceptionalSubjects.map((s) => s.name);
    const weaknesses = failingSubjects.map((s) => s.name);

    console.log("Identified strengths:", strengths);
    console.log("Identified weaknesses:", weaknesses);

    // Update UI to show that we're analyzing only subjects from the current semester
    const semesterInfo = document.querySelector(".student-selected-semester");
    if (semesterInfo) {
      semesterInfo.textContent = `Analyzing subjects from ${semester} Semester`;
    }

    // Initialize recommendations array and error state
    let recommendedPrograms = [];
    let recommendationError = null;

    try {
      // Only fetch recommendations if there are failing subjects
      if (failingSubjects.length > 0) {
        console.log(
          "[API REQUEST] Student has failing subjects. Fetching course recommendations..."
        );
        const requestBody = {
          studentId: student.id,
          yearLevel: student.yearLevel,
          semester: student.semester,
          schoolYear: schoolYear,
        };
        console.log(
          "[API REQUEST] Course Recommendations - Request Body:",
          requestBody
        );

        try {
          const response = await axios.post(
            "http://localhost:3000/api/system/course-recommendations",
            requestBody
          );
          console.log(
            "[API RESPONSE] Course Recommendations - Status:",
            response.status
          );
          console.log(
            "[API RESPONSE] Course Recommendations - Full Response:",
            response
          );
          console.log(
            "[API RESPONSE] Course Recommendations - Data:",
            response.data
          );

          if (
            response.data.success &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            console.log(
              `[API SUCCESS] Found ${response.data.data.length} program recommendations`
            );
            // Format API recommendations for display
            recommendedPrograms = response.data.data.map((rec) => {
              // Find matching program option to get additional details
              const programOption = programOptions.find(
                (po) => po.program.toLowerCase() === rec.program.toLowerCase()
              ) || {
                description: "Program focused on different skill sets.",
                subjects: [],
                careers: [],
                forStrengths: [],
              };

              const recommendation = {
                program: rec.program,
                description: programOption.description,
                subjects: programOption.subjects,
                careers: programOption.careers,
                matchScore: rec.matchScore,
                reason: rec.reasons.join(" "),
                failedSubjects: rec.failedSubjects,
              };
              console.log(
                `[PROCESSING] Recommendation for ${rec.program}:`,
                recommendation
              );
              return recommendation;
            });

            console.log(
              "[PROCESSED] Final recommendations list:",
              recommendedPrograms
            );
          } else {
            recommendationError =
              "No recommendations available from the database for this student.";
            console.log(
              "[API INFO] No recommendations available in the response:",
              response.data
            );
          }
        } catch (axiosError) {
          console.error(
            "[API ERROR] Course recommendations request failed:",
            axiosError
          );
          console.error(
            "[API ERROR] Details:",
            axiosError.response?.data || axiosError.message
          );
          recommendationError = `Failed to fetch recommendations. ${axiosError.message}`;
        }
      } else {
        console.log(
          "Student has no failing subjects. No recommendations needed."
        );
        recommendationError =
          "No recommendations needed as the student has no failing subjects.";
      }
    } catch (error) {
      console.error("[API ERROR] Error in recommendation process:", error);
      console.error(
        "[API ERROR] Details:",
        error.response?.data || error.message
      );
      recommendationError = `Error fetching recommendations: ${error.message}`;
    }

    console.log("Final recommendations:", recommendedPrograms);

    // Update the student with real strengths, weaknesses, and recommendations
    setCurrentStudent({
      ...student,
      majorGrade,
      minorGrade,
      strengths,
      weaknesses,
      recommendedPrograms,
      recommendationError,
    });
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
                System identifies students at risk of academic failure
                <div className="font-mono bg-purple-200 text-purple-800 rounded-md px-2 py-1 mt-2 inline-block">
                  Students meeting any risk criteria
                </div>
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
            description={
              <div>
                <p>
                  Select School Year, Year Level and Semester from the filters
                  above to identify at-risk students.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Students are considered at risk if they meet ANY of these
                  criteria:
                  <br />
                  Overall Grade {">"} 3.3 | Major Subjects {">"} 2.5 | Minor
                  Subjects {">"} 3.0
                </p>
              </div>
            }
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

    // If still loading subjects, show a loading state
    if (subjectLoading) {
      return (
        <div className="mt-6">
          <Card className="shadow-md border-0">
            <div className="flex justify-center items-center h-64">
              <Spin size="large" tip="Loading student data..." />
            </div>
          </Card>
        </div>
      );
    }

    // Group subjects by performance level based on subject type
    const exceptionalSubjects = studentSubjects.filter((s) => s.grade <= 1.5);
    const passingSubjects = studentSubjects.filter(
      (s) => s.isPassing && s.grade > 1.5
    );
    const failingSubjects = studentSubjects.filter((s) => !s.isPassing);

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
                  {currentStudent.majorGrade !== null && (
                    <Descriptions.Item label="Major Subjects">
                      <span
                        className={
                          currentStudent.majorGrade > 2.5
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        {currentStudent.majorGrade.toFixed(2)}
                      </span>
                    </Descriptions.Item>
                  )}
                  {currentStudent.minorGrade !== null && (
                    <Descriptions.Item label="Minor Subjects">
                      <span
                        className={
                          currentStudent.minorGrade > 3.0
                            ? "text-red-500"
                            : "text-green-500"
                        }
                      >
                        {currentStudent.minorGrade.toFixed(2)}
                      </span>
                    </Descriptions.Item>
                  )}
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
                <div className="flex justify-between items-center mb-2">
                  <Title level={5} className="m-0">
                    Academic Performance
                  </Title>
                  <Tag color="purple" className="student-selected-semester">
                    {semester} Semester Only
                  </Tag>
                </div>

                {studentSubjects.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <div className="font-medium text-green-600 mb-1">
                        Exceptional Subjects (1.0-1.5):
                      </div>
                      <div>
                        {exceptionalSubjects.length > 0 ? (
                          exceptionalSubjects.map((subject, index) => (
                            <Tag color="green" key={index} className="mb-1">
                              <span>
                                {subject.subject_type && (
                                  <span className="mr-1">
                                    [{subject.subject_type}]
                                  </span>
                                )}
                                {subject.name} ({subject.grade.toFixed(1)})
                              </span>
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">
                            No exceptional subjects identified
                          </Text>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="font-medium text-blue-600 mb-1">
                        Passing Subjects:
                      </div>
                      <div>
                        {passingSubjects.length > 0 ? (
                          passingSubjects.map((subject, index) => (
                            <Tag color="blue" key={index} className="mb-1">
                              <span>
                                {subject.subject_type && (
                                  <span className="mr-1">
                                    [{subject.subject_type}]
                                  </span>
                                )}
                                {subject.name} ({subject.grade.toFixed(1)})
                              </span>
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">
                            No average subjects identified
                          </Text>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-red-600 mb-1">
                        Failing Subjects:
                      </div>
                      <div>
                        {failingSubjects.length > 0 ? (
                          failingSubjects.map((subject, index) => (
                            <Tag color="red" key={index} className="mb-1">
                              <span>
                                {subject.subject_type && (
                                  <span className="mr-1">
                                    [{subject.subject_type}]
                                  </span>
                                )}
                                {subject.name} ({subject.grade.toFixed(1)})
                                {subject.subject_type && (
                                  <span className="ml-1 text-xs">
                                    (Pass:{" "}
                                    {subject.subject_type
                                      .toLowerCase()
                                      .includes("major")
                                      ? "≤2.5"
                                      : "≤3.0"}
                                    )
                                  </span>
                                )}
                              </span>
                            </Tag>
                          ))
                        ) : (
                          <Text type="secondary">
                            No failing subjects identified
                          </Text>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No subject data available for this student"
                  />
                )}
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

              {currentStudent.recommendationError ? (
                <Alert
                  message="Recommendation Status"
                  description={currentStudent.recommendationError}
                  type="info"
                  showIcon
                  className="mb-6"
                />
              ) : currentStudent.recommendedPrograms.length === 0 ? (
                <Alert
                  message="No Recommendations Available"
                  description="No program shift recommendations are available for this student at this time."
                  type="info"
                  showIcon
                  className="mb-6"
                />
              ) : (
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
                          <Alert
                            message={program.reason}
                            type="info"
                            showIcon
                          />
                        </div>
                      }
                    />
                  ))}
                </Steps>
              )}

              <Divider />

              {!currentStudent.recommendationError &&
                currentStudent.recommendedPrograms.length > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Next Steps"
                    description={
                      <div>
                        <p>For this student, we recommend:</p>
                        <ol className="list-decimal ml-5 mt-2">
                          <li>Schedule an academic counseling session</li>
                          <li>
                            Discuss program shift options with the student
                          </li>
                          <li>
                            Connect with the department chair of the recommended
                            programs
                          </li>
                          <li>
                            Create a transition plan if the student decides to
                            shift programs
                          </li>
                        </ol>
                      </div>
                    }
                  />
                )}
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
            <Col xs={24} md={7}>
              <Form.Item label="School Year" className="mb-2">
                <Select
                  placeholder="Select School Year"
                  value={schoolYear}
                  onChange={setSchoolYear}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {schoolYears.map((y) => (
                    <Option key={y} value={y}>
                      {y}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
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
            <Col xs={24} md={6}>
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
            <Col xs={24} md={5} className="flex items-end">
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
                      {student.riskLevel && (
                        <Tag
                          color={
                            student.riskLevel === "high" ? "red" : "orange"
                          }
                          className="ml-2"
                        >
                          {student.riskLevel.toUpperCase()} Risk
                        </Tag>
                      )}
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
                      {student.riskReasons && (
                        <div className="mt-1">
                          <Text type="danger">
                            Risk Factors: {student.riskReasons}
                          </Text>
                        </div>
                      )}
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
