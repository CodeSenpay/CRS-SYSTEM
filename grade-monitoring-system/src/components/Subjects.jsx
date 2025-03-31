import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";

const { Option } = Select;

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSubject, setEditingSubject] = useState(null);
  const [verifyUser, setVerifyUser] = useState(null);

  // Verify user authorization
  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/auth/verify-jwt",
        {
          withCredentials: true,
        }
      );

      setVerifyUser(response.data.user.userId);
    } catch (err) {
      setVerifyUser(undefined);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate school years (current year - 5 to current year + 1)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      years.push(`${year}-${year + 1}`);
    }
    setSchoolYears(years);
    setSelectedSchoolYear(years[5]); // Default to current year
  }, []);

  // Fetch subjects when filters change
  useEffect(() => {
    if (
      selectedSchoolYear &&
      selectedSemester &&
      selectedYearLevel &&
      verifyUser === "admin"
    ) {
      fetchSubjects();
    }
  }, [selectedSchoolYear, selectedSemester, selectedYearLevel, verifyUser]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/system/subjects",
        {
          params: {
            schoolYear: selectedSchoolYear,
            semester: selectedSemester,
            yearLevel: selectedYearLevel,
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setSubjects(response.data.data);
      } else {
        message.error("Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      message.error("Error loading subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingSubject(record);
    form.setFieldsValue({
      subject_code: record.subject_code,
      subject_name: record.subject_name,
      lec_units: record.lec_units,
      lab_units: record.lab_units,
      course_code: record.course_code,
      category: record.category,
      semester: record.semester,
      year_level: record.year_level,
      subject_type: record.subject_type,
      school_year: record.school_year,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingSubject) {
        // Update existing subject
        const response = await axios.put(
          `http://localhost:3000/api/system/subjects/${editingSubject.subject_code}`,
          values,
          { withCredentials: true }
        );
        if (response.data.success) {
          message.success("Subject updated successfully");
          fetchSubjects();
        } else {
          message.error("Failed to update subject");
        }
      } else {
        // Add new subject
        const response = await axios.post(
          "http://localhost:3000/api/system/subjects",
          values,
          { withCredentials: true }
        );
        if (response.data.success) {
          message.success("Subject added successfully");
          fetchSubjects();
        } else {
          message.error("Failed to add subject");
        }
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error saving subject:", error);
      message.error("Error saving subject. Please try again.");
    }
  };

  const handleDelete = async (subjectCode) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/system/subjects/${subjectCode}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        message.success("Subject deleted successfully");
        fetchSubjects();
      } else {
        message.error("Failed to delete subject");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      message.error("Error deleting subject. Please try again.");
    }
  };

  const columns = [
    {
      title: "Subject Code",
      dataIndex: "subject_code",
      key: "subject_code",
      width: 120,
    },
    {
      title: "Subject Name",
      dataIndex: "subject_name",
      key: "subject_name",
      width: 250,
    },
    {
      title: "Lec Units",
      dataIndex: "lec_units",
      key: "lec_units",
      width: 100,
    },
    {
      title: "Lab Units",
      dataIndex: "lab_units",
      key: "lab_units",
      width: 100,
    },
    {
      title: "Course",
      dataIndex: "course_code",
      key: "course_code",
      width: 120,
    },
    {
      title: "Subject Type",
      dataIndex: "subject_type",
      key: "subject_type",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            onClick={() =>
              Modal.confirm({
                title: "Are you sure you want to delete this subject?",
                content: "This action cannot be undone.",
                onOk: () => handleDelete(record.subject_code),
              })
            }
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {loading && <Loading />}

      {verifyUser !== "admin" && (
        <div className="text-center py-5" style={{ margin: "24px" }}>
          <h1
            style={{ color: "#ff4d4f", fontSize: "2rem", marginBottom: "1rem" }}
          >
            Access Denied
          </h1>
          <p style={{ fontSize: "1.2rem" }}>
            Only administrators can access this page.
          </p>
        </div>
      )}

      {verifyUser === "admin" && (
        <Card title="Manage Subjects" style={{ margin: "24px" }}>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Select
                placeholder="Select School Year"
                style={{ width: 150 }}
                value={selectedSchoolYear}
                onChange={setSelectedSchoolYear}
              >
                {schoolYears.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Select Semester"
                style={{ width: 150 }}
                value={selectedSemester}
                onChange={setSelectedSemester}
              >
                <Option value="First">First</Option>
                <Option value="Second">Second</Option>
                <Option value="Summer">Summer</Option>
              </Select>

              <Select
                placeholder="Select Year Level"
                style={{ width: 150 }}
                value={selectedYearLevel}
                onChange={setSelectedYearLevel}
              >
                <Option value="1">First Year</Option>
                <Option value="2">Second Year</Option>
                <Option value="3">Third Year</Option>
                <Option value="4">Fourth Year</Option>
              </Select>

              <Button
                type="primary"
                onClick={fetchSubjects}
                disabled={
                  !selectedSchoolYear || !selectedSemester || !selectedYearLevel
                }
              >
                Search
              </Button>

              <Button type="primary" onClick={showAddModal}>
                Add New Subject
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={subjects}
            rowKey="subject_code"
            loading={loading}
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 10 }}
          />

          <Modal
            title={editingSubject ? "Edit Subject" : "Add New Subject"}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                school_year: selectedSchoolYear,
                semester: selectedSemester,
                year_level: selectedYearLevel,
                lec_units: 0,
                lab_units: 0,
              }}
            >
              <Form.Item
                name="subject_code"
                label="Subject Code"
                rules={[
                  { required: true, message: "Please enter subject code" },
                ]}
              >
                <Input disabled={editingSubject} />
              </Form.Item>

              <Form.Item
                name="subject_name"
                label="Subject Name"
                rules={[
                  { required: true, message: "Please enter subject name" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="lec_units"
                label="Lecture Units"
                rules={[
                  { required: true, message: "Please enter lecture units" },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="lab_units"
                label="Laboratory Units"
                rules={[
                  { required: true, message: "Please enter laboratory units" },
                ]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="course_code"
                label="Course Code"
                rules={[
                  { required: true, message: "Please enter course code" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select>
                  <Option value="Major">Major</Option>
                  <Option value="Minor">Minor</Option>
                  <Option value="General Education">General Education</Option>
                  <Option value="Elective">Elective</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: "Please select semester" }]}
              >
                <Select>
                  <Option value="First">First</Option>
                  <Option value="Second">Second</Option>
                  <Option value="Summer">Summer</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="year_level"
                label="Year Level"
                rules={[
                  { required: true, message: "Please select year level" },
                ]}
              >
                <Select>
                  <Option value="1">First Year</Option>
                  <Option value="2">Second Year</Option>
                  <Option value="3">Third Year</Option>
                  <Option value="4">Fourth Year</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="subject_type"
                label="Subject Type"
                rules={[
                  { required: true, message: "Please select subject type" },
                ]}
              >
                <Select>
                  <Option value="Core">Core</Option>
                  <Option value="Elective">Elective</Option>
                  <Option value="Prerequisite">Prerequisite</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="school_year"
                label="School Year"
                rules={[
                  { required: true, message: "Please select school year" },
                ]}
              >
                <Select>
                  {schoolYears.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingSubject ? "Update" : "Add"}
                  </Button>
                  <Button onClick={handleCancel}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      )}
    </>
  );
};

export default Subjects;
