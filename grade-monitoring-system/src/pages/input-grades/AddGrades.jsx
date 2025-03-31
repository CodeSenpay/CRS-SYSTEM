import {
  Button,
  Card,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title } = Typography;
const { Option } = Select;

function AddGrades() {
  const [yearLevel, setYearLevel] = useState("1");
  const [semester, setSemester] = useState("1st Semester");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [teachingLoadData, setTeachingLoadData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isMajorSubject, setIsMajorSubject] = useState(false);
  const [schoolYear, setSchoolYear] = useState("2024-2025");
  const schoolYearOptions = [
    "2022-2023",
    "2023-2024",
    "2024-2025",
    "2025-2026",
  ];

  // Update semester options when year level changes
  useEffect(() => {
    const options = [
      {
        value: `First`,
        label: `1st Semester - ${schoolYear}`,
      },
      {
        value: `Second`,
        label: `2nd Semester - ${schoolYear}`,
      },
    ];

    // Add summer option only for year level 3
    if (yearLevel === "3") {
      options.push({
        value: `Summer`,
        label: `Summer - ${schoolYear}`,
      });
    }

    setSemesterOptions(options);
    // Set default semester to first option
    setSemester(options[0].value);
  }, [yearLevel, schoolYear]);

  const fetchTeachingLoad = async () => {
    console.log({
      yearLevel,
      semester,
      schoolYear,
    });
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/system/teaching-load",
        {
          yearLevel,
          semester,
          schoolYear,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setTeachingLoadData(
          response.data.data.map((item, index) => ({
            ...item,
            key: index.toString(),
          }))
        );
        message.success("Teaching load data fetched successfully");
      } else {
        message.error(response.data.message || "Failed to fetch teaching load");
        setTeachingLoadData([]);
      }
    } catch (error) {
      console.error("Error fetching teaching load:", error);
      message.error("Failed to fetch teaching load. Please try again.");
      setTeachingLoadData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForSubject = async (subject) => {
    setLoadingStudents(true);
    try {
      // Determine if the subject is a major subject
      const isMajor = subject.subject_type === "Major";
      setIsMajorSubject(isMajor);

      // Call the API endpoint to fetch students for the selected subject
      const response = await axios.post(
        "http://localhost:3000/api/system/subject-students",
        {
          subjectCode: subject.subject_code,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        // Transform the data to include grade state
        const studentsWithGrades = response.data.data.map((student, index) => ({
          ...student,
          key: index.toString(),
          // Set grade to null if it's 'N/A' or not available
          grade: student.score === "N/A" ? null : student.score,
          gradeStatus: getGradeStatus(
            student.score === "N/A" ? null : student.score,
            isMajor
          ),
        }));
        console.log(studentsWithGrades);
        setStudentData(studentsWithGrades);
        message.success(
          `Loaded ${studentsWithGrades.length} students for ${subject.subject_code}`
        );
      } else {
        message.info(`No students enrolled in ${subject.subject_code}`);
        setStudentData([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch students. Please try again.");
      setStudentData([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Function to determine if a grade is passing or failing
  const getGradeStatus = (grade, isMajor) => {
    // Return null if grade is null, undefined, or 'N/A'
    if (grade === null || grade === undefined || grade === "N/A") return null;

    // Different passing thresholds for major and minor subjects
    const passingThreshold = isMajor ? 2.5 : 3.0;
    return parseFloat(grade) <= passingThreshold ? "passed" : "failed";
  };

  // Handle grade change for a student
  const handleGradeChange = (value, record) => {
    const updatedStudents = studentData.map((student) => {
      if (student.key === record.key) {
        // If value is null or undefined, set gradeStatus to null (Not graded)
        const gradeStatus =
          value === null || value === undefined
            ? null
            : getGradeStatus(value, isMajorSubject);

        return { ...student, grade: value, gradeStatus };
      }
      return student;
    });

    setStudentData(updatedStudents);
  };

  // Save grades for all students
  const saveGrades = async () => {
    // Check if there are any students to grade
    if (studentData.length === 0) {
      message.warning("No students to grade");
      return;
    }

    try {
      // Filter only students with valid grades
      const gradesData = studentData
        .filter(
          (student) => student.grade !== null && student.grade !== undefined
        )
        .map((student) => ({
          student_number: student.student_id, // Using student_id as student_number
          subject_code: selectedSubject.subject_code,
          score: student.grade,
          semester: selectedSubject.semester,
          year: selectedSubject.year_level,
          school_year: schoolYear,
        }));

      console.log(gradesData);

      if (gradesData.length === 0) {
        message.warning("No grades to save");
        return;
      }

      console.log({ grades: gradesData });
      // Call the API endpoint to save grades
      const response = await axios.post(
        "http://localhost:3000/api/system/save-grades",
        {
          grades: gradesData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        message.success("Grades saved successfully");
        // Update the local state to reflect saved grades
        const updatedStudents = studentData.map((student) => {
          if (student.grade !== null) {
            return {
              ...student,
              gradeStatus: getGradeStatus(student.grade, isMajorSubject),
            };
          }
          return student;
        });
        setStudentData(updatedStudents);

        // Close the modal after successful save
        setStudentModalVisible(false);
      } else {
        message.error(response.data.message || "Failed to save grades");
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      message.error("Failed to save grades. Please try again.");
    }
  };

  const studentColumns = [
    {
      title: "Student ID",
      dataIndex: "student_id",
      key: "student_id",
      width: "15%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
    },
    {
      title: "Year Level",
      dataIndex: "year_level",
      key: "year_level",
      width: "10%",
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      width: "10%",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: "15%",
      render: (text, record) => (
        <InputNumber
          min={1.0}
          max={5.0}
          step={0.1}
          value={record.grade !== null ? record.grade : undefined}
          onChange={(value) => handleGradeChange(value, record)}
          style={{ width: "100%" }}
          placeholder="Enter grade"
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "gradeStatus",
      key: "gradeStatus",
      width: "15%",
      render: (status) => {
        if (status === null) return <Tag color="gray">Not graded</Tag>;
        return status === "passed" ? (
          <Tag color="green">PASSED</Tag>
        ) : (
          <Tag color="red">FAILED</Tag>
        );
      },
    },
  ];

  const columns = [
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
      title: "Lec Units",
      dataIndex: "lec_units",
      key: "lec_units",
    },
    {
      title: "Lab Units",
      dataIndex: "lab_units",
      key: "lab_units",
    },
    {
      title: "Course Code",
      dataIndex: "course_code",
      key: "course_code",
    },
    {
      title: "Subject Type",
      dataIndex: "subject_type",
      key: "subject_type",
      render: (text) => (
        <Tag color={text === "Major" ? "blue" : "green"}>{text}</Tag>
      ),
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Year Level",
      dataIndex: "year_level",
      key: "year_level",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            className="bg-blue-500"
            onClick={() => {
              handleViewStudents(record);
            }}
          >
            <span className="text-xs">VIEW STUDENTS</span>
          </Button>
          <Button type="primary" size="small" className="bg-green-500">
            <span className="text-xs">EXPORT</span>
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewStudents = (subject) => {
    setSelectedSubject(subject);
    fetchStudentsForSubject(subject);
    setStudentModalVisible(true);
  };

  const handleYearLevelChange = (value) => {
    setYearLevel(value);
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
  };

  // Get the passing threshold based on subject type
  const getPassingThresholdText = () => {
    if (isMajorSubject) {
      return "1.0 (Excellent) to 5.0 (Failed) - 2.5 or lower is passing";
    } else {
      return "1.0 (Excellent) to 5.0 (Failed) - 3.0 or lower is passing";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-6">
      <div className="w-full">
        <Card
          className="hover:shadow-xl transition-all duration-300"
          title={
            <div className="text-left">
              <Title level={4} style={{ margin: 0 }}>
                TEACHING LOAD
              </Title>
            </div>
          }
        >
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="w-full md:w-[20%]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Year
              </label>
              <Select
                value={schoolYear}
                onChange={(value) => setSchoolYear(value)}
                style={{ width: "100%" }}
                size="large"
              >
                {schoolYearOptions.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="w-full md:w-[20%]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level
              </label>
              <Select
                value={yearLevel}
                onChange={handleYearLevelChange}
                style={{ width: "100%" }}
                size="large"
              >
                <Option value="1">1st Year</Option>
                <Option value="2">2nd Year</Option>
                <Option value="3">3rd Year</Option>
                <Option value="4">4th Year</Option>
              </Select>
            </div>
            <div className="w-full md:w-[20%]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <Select
                value={semester}
                onChange={handleSemesterChange}
                style={{ width: "100%" }}
                size="large"
              >
                {semesterOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="w-full md:w-[30%] flex items-end mt-3">
              <Button
                type="primary"
                size="large"
                className="bg-blue-500 w-full"
                onClick={fetchTeachingLoad}
                loading={loading}
              >
                Search Teaching Load
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={teachingLoadData}
            pagination={false}
            size="middle"
            bordered
            className="teaching-load-table"
            loading={loading}
          />
        </Card>
      </div>

      {/* Student Grades Modal */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {selectedSubject
                ? `${selectedSubject.subject_code}: ${selectedSubject.subject_name}`
                : "Student List"}
            </Title>
            <p className="text-sm text-gray-500 mt-1">
              {selectedSubject
                ? `${selectedSubject.course_code} - Year ${selectedSubject.year_level} - ${selectedSubject.semester} - S.Y. ${schoolYear}`
                : ""}
            </p>
            {selectedSubject && (
              <div className="mt-2 flex items-center">
                <Tag
                  color={
                    selectedSubject.subject_type === "Major" ? "blue" : "green"
                  }
                >
                  {selectedSubject.subject_type} Subject
                </Tag>
                <span className="ml-2 text-xs text-gray-500">
                  (Passing grade:{" "}
                  {selectedSubject.subject_type === "Major" ? "≤ 2.5" : "≤ 3.0"}
                  )
                </span>
              </div>
            )}
          </div>
        }
        open={studentModalVisible}
        onCancel={() => setStudentModalVisible(false)}
        width={800}
        footer={[
          <Button
            key="save"
            type="primary"
            className="bg-blue-500"
            onClick={saveGrades}
            disabled={studentData.length === 0}
          >
            Save Grades
          </Button>,
        ]}
      >
        <div className="my-4">
          {studentData.length > 0 ? (
            <>
              <Tooltip
                title={`Passing grade is ${
                  isMajorSubject ? "2.5" : "3.0"
                } or lower for ${isMajorSubject ? "major" : "minor"} subjects`}
              >
                <div className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Grading System:</span>{" "}
                  {getPassingThresholdText()}
                </div>
              </Tooltip>
              <Table
                columns={studentColumns}
                dataSource={studentData}
                pagination={{ pageSize: 10 }}
                size="middle"
                bordered
                loading={loadingStudents}
                scroll={{ y: 400 }}
              />
            </>
          ) : (
            <div className="text-center py-10">
              {loadingStudents ? (
                <p>Loading students...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-500">
                    No students enrolled in this subject
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    There are currently no students enrolled in{" "}
                    {selectedSubject?.subject_code || "this subject"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AddGrades;
