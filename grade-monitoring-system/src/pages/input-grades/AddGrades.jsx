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

  // Update semester options when year level changes
  useEffect(() => {
    const academicYear = `2024-2025`;

    const options = [
      {
        value: `First`,
        label: `1st Semester - ${academicYear}`,
      },
      {
        value: `Second`,
        label: `2nd Semester - ${academicYear}`,
      },
    ];

    // Add summer option only for year level 3
    if (yearLevel === "3") {
      options.push({
        value: `Summer`,
        label: `Summer`,
      });
    }

    setSemesterOptions(options);
    // Set default semester to first option
    setSemester(options[0].value);
  }, [yearLevel]);

  const fetchTeachingLoad = async () => {
    console.log({
      yearLevel,
      semester,
    });
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/system/teaching-load",
        {
          yearLevel,
          semester,
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
    console.log(subject);
    setLoadingStudents(true);
    try {
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
          grade: student.grade || null,
          gradeStatus: getGradeStatus(student.grade),
        }));
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
  const getGradeStatus = (grade) => {
    if (grade === null || grade === undefined) return null;
    return parseFloat(grade) <= 3.0 ? "passed" : "failed";
  };

  // Handle grade change for a student
  const handleGradeChange = (value, record) => {
    const updatedStudents = studentData.map((student) => {
      if (student.key === record.key) {
        const gradeStatus = getGradeStatus(value);
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
      // Filter only students with grades
      const gradesData = studentData
        .filter((student) => student.grade !== null)
        .map((student) => ({
          student_number: student.student_id, // Using student_id as student_number
          subject_code: selectedSubject.subject_code,
          score: student.grade,
          semester: selectedSubject.semester,
          year: selectedSubject.year_level,
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
              gradeStatus: getGradeStatus(student.grade),
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
          value={record.grade}
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
        if (status === null) return <Tag>Not graded</Tag>;
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
      title: "Category",
      dataIndex: "category",
      key: "category",
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
            onClick={() => handleViewStudents(record)}
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
            <div className="w-full md:w-[30%]">
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
            <div className="w-full md:w-[30%]">
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
                ? `${selectedSubject.course_code} - Year ${selectedSubject.year_level} - ${selectedSubject.semester}`
                : ""}
            </p>
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
              <Tooltip title="Passing grade is 3.0 or lower">
                <div className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Grading System:</span> 1.0
                  (Excellent) to 5.0 (Failed) - 3.0 or lower is passing
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
