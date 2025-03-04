import {
  BankOutlined,
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Select,
  Typography,
  notification,
} from "antd";
import { useEffect, useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function AddGrades() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [yearLevel, setYearLevel] = useState(null);
  const [semester, setSemester] = useState(null);

  // Subject mapping based on year level and semester
  const subjectMapping = {
    1: {
      1: [
        "Mathematics 1",
        "English 1",
        "Science 1",
        "History 1",
        "Computer Fundamentals",
      ],
      2: [
        "Mathematics 2",
        "English 2",
        "Science 2",
        "History 2",
        "Programming Basics",
      ],
      summer: ["Summer Math", "Summer English"],
    },
    2: {
      1: [
        "Calculus 1",
        "Literature",
        "Physics 1",
        "Data Structures",
        "Web Development",
      ],
      2: [
        "Calculus 2",
        "Technical Writing",
        "Physics 2",
        "Algorithms",
        "Database Systems",
      ],
      summer: ["Advanced Programming", "Technical Elective 1"],
    },
    3: {
      1: [
        "Statistics",
        "Software Engineering",
        "Networks",
        "Operating Systems",
        "Mobile Development",
      ],
      2: [
        "Research Methods",
        "AI Fundamentals",
        "System Analysis",
        "Cybersecurity",
        "Cloud Computing",
      ],
      summer: ["Industry Practicum", "Technical Elective 2"],
    },
    4: {
      1: [
        "Capstone Project 1",
        "Ethics in Computing",
        "Advanced Databases",
        "Elective 1",
        "Elective 2",
      ],
      2: [
        "Capstone Project 2",
        "Professional Practice",
        "Elective 3",
        "Elective 4",
        "Internship",
      ],
      summer: ["Special Topics", "Professional Development"],
    },
  };

  // Update subjects when year level or semester changes
  useEffect(() => {
    if (yearLevel && semester) {
      const availableSubjects = subjectMapping[yearLevel]?.[semester] || [];
      setSubjects(availableSubjects);

      // Clear subject field when year level or semester changes
      form.setFieldValue("subject", undefined);
    }
  }, [yearLevel, semester, form]);

  const handleYearLevelChange = (value) => {
    setYearLevel(value);
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:3000/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit grade");
      }

      // Reset form after successful submission
      form.resetFields();
      setSuccess(true);
      notification.success({
        message: "Success",
        description: "Grade submitted successfully!",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6 sm:px-8 lg:px-10 flex justify-center items-center">
      <div className="w-full max-w-2xl">
        {success && (
          <Alert
            message="Grade submitted successfully!"
            type="success"
            showIcon
            closable
            onClose={() => setSuccess(false)}
            className="mb-6 animate-fadeIn"
            icon={<CheckCircleOutlined />}
          />
        )}

        <Card
          className="hover:shadow-xl transition-all duration-300"
          headStyle={{
            background: "linear-gradient(to right, #1890ff, #4c6ef5)",
            borderRadius: "8px 8px 0 0",
            padding: "16px",
          }}
          title={
            <div className="text-center">
              <Title
                level={3}
                style={{ color: "white", margin: 0 }}
                className="flex items-center justify-center"
              >
                <BookOutlined className="mr-3" />
                Input Student Grades
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Enter student information and grades below
              </Text>
            </div>
          }
        >
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6"
              icon={<ExclamationCircleOutlined />}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label={
                  <span className="flex items-center">
                    <UserOutlined className="text-blue-500 mr-2" />
                    Student ID
                  </span>
                }
                name="studentId"
                rules={[{ required: true, message: "Please enter student ID" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Enter student ID"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="flex items-center">
                    <BankOutlined className="text-blue-500 mr-2" />
                    Year Level
                  </span>
                }
                name="yearLevel"
                rules={[
                  { required: true, message: "Please select year level" },
                ]}
              >
                <Select
                  placeholder="Select Year Level"
                  size="large"
                  suffixIcon={<DownOutlined />}
                  onChange={handleYearLevelChange}
                >
                  <Option value="1">First Year</Option>
                  <Option value="2">Second Year</Option>
                  <Option value="3">Third Year</Option>
                  <Option value="4">Fourth Year</Option>
                </Select>
              </Form.Item>

              <Form.Item
                className="col-span-1 md:col-span-2"
                label={
                  <span className="flex items-center">
                    <CalendarOutlined className="text-blue-500 mr-2" />
                    Semester
                  </span>
                }
                name="semester"
                rules={[{ required: true, message: "Please select semester" }]}
              >
                <Select
                  placeholder="Select Semester"
                  size="large"
                  suffixIcon={<DownOutlined />}
                  onChange={handleSemesterChange}
                >
                  <Option value="1">First Semester</Option>
                  <Option value="2">Second Semester</Option>
                  <Option value="summer">Summer</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="flex items-center">
                    <BookOutlined className="text-blue-500 mr-2" />
                    Subject
                  </span>
                }
                name="subject"
                rules={[{ required: true, message: "Please select a subject" }]}
              >
                <Select
                  placeholder={
                    yearLevel && semester
                      ? "Select Subject"
                      : "Please select year level and semester first"
                  }
                  size="large"
                  suffixIcon={<DownOutlined />}
                  disabled={!yearLevel || !semester}
                >
                  {subjects.map((subject) => (
                    <Option key={subject} value={subject}>
                      {subject}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="flex items-center">
                    <BarChartOutlined className="text-blue-500 mr-2" />
                    Grade
                  </span>
                }
                name="grade"
                rules={[{ required: true, message: "Please enter grade" }]}
              >
                <Input
                  prefix={<BarChartOutlined className="text-gray-400" />}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Enter grade (0-100)"
                  size="large"
                />
              </Form.Item>
            </div>

            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg"
                icon={loading ? null : <CheckOutlined />}
              >
                {loading ? "Submitting..." : "Submit Grade"}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-2 text-center text-sm text-gray-600 font-medium">
            All fields are required to submit a grade
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AddGrades;
