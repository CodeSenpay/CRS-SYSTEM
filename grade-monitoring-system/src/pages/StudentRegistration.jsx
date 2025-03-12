import { InboxOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  message,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const StudentRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [verifyUser, setVerifyUser] = useState(null);

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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({});

  // Fetch user role on component mount
  useEffect(() => {
    verifyToken();
  }, [verifyUser]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format the date to ISO string if it exists
      if (data.birthDate) {
        data.birthDate = data.birthDate.format("YYYY-MM-DD");
      }

      // API request to register student
      const response = await axios.post(
        "http://localhost:3000/api/system/register-student",
        data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        message.success("Student registered successfully!");
        reset(); // Reset form fields
      } else {
        message.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to register student. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel file upload for bulk registration
  const handleBulkUpload = async () => {
    if (fileList.length === 0) {
      setUploadError("Please select an Excel file to upload");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/system/bulk-register-students",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        message.success(
          `${
            response.data.registeredCount || "Multiple"
          } students registered successfully!`
        );
        setFileList([]);
      } else {
        setUploadError(response.data.message || "Bulk registration failed");
        message.error(response.data.message || "Bulk registration failed");
      }
    } catch (error) {
      console.error("Bulk registration error:", error);
      setUploadError(
        error.response?.data?.message ||
          "Failed to process Excel file. Please check the file format and try again."
      );
      message.error(
        error.response?.data?.message ||
          "Failed to process Excel file. Please check the file format and try again."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  // Props for the file upload component
  const uploadProps = {
    name: "file",
    multiple: false,
    fileList: fileList,
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("You can only upload Excel files!");
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
      setUploadError(null);
    },
    onChange: (info) => {
      setFileList(info.fileList.slice(-1)); // Keep only the latest file
    },
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Bulk Upload Section - Only visible to admins */}
      {verifyUser === "admin" && (
        <Card
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          <Title level={2} style={{ textAlign: "center", color: "#59bf8f" }}>
            <UserAddOutlined /> Bulk Student Registration
          </Title>
          <Divider />

          <Text>
            Upload an Excel file (.xlsx or .xls) containing student information
            for bulk registration. The Excel file should have columns matching
            the student registration form fields.
          </Text>

          <div style={{ marginTop: "20px" }}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag Excel file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single Excel file upload. Please ensure your file
                has the correct format.
              </p>
            </Dragger>
          </div>

          {uploadError && (
            <Alert
              message="Upload Error"
              description={uploadError}
              type="error"
              showIcon
              style={{ marginTop: "16px" }}
            />
          )}

          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleBulkUpload}
              loading={uploadLoading}
              disabled={fileList.length === 0}
              style={{
                width: "100%",
                height: "40px",
                backgroundColor: "#59bf8f",
                borderColor: "#59bf8f",
              }}
            >
              Upload and Register Students
            </Button>
          </div>
        </Card>
      )}

      {/* Individual Student Registration Form */}
      <Card
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <Title level={2} style={{ textAlign: "center", color: "#59bf8f" }}>
          <UserAddOutlined /> Student Registration
        </Title>
        <Divider />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={8}>
              <div className="form-item">
                <label>Student ID</label>
                <Controller
                  name="studentId"
                  control={control}
                  rules={{ required: "Student ID is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter student ID"
                      status={errors.studentId ? "error" : ""}
                    />
                  )}
                />
                {errors.studentId && (
                  <div className="error-message">
                    {errors.studentId.message}
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div className="form-item">
                <label>First Name</label>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter first name"
                      status={errors.firstName ? "error" : ""}
                    />
                  )}
                />
                {errors.firstName && (
                  <div className="error-message">
                    {errors.firstName.message}
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <div className="form-item">
                <label>Last Name</label>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter last name"
                      status={errors.lastName ? "error" : ""}
                    />
                  )}
                />
                {errors.lastName && (
                  <div className="error-message">{errors.lastName.message}</div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={24} md={8}>
              <div className="form-item">
                <label>Middle Name</label>
                <Controller
                  name="middleName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter middle name" />
                  )}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="form-item">
                <label>Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select gender"
                      status={errors.gender ? "error" : ""}
                      style={{ width: "100%" }}
                    >
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <div className="error-message">{errors.gender.message}</div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="form-item">
                <label>Birth Date</label>
                <Controller
                  name="birthDate"
                  control={control}
                  rules={{ required: "Birth date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      style={{ width: "100%" }}
                      status={errors.birthDate ? "error" : ""}
                    />
                  )}
                />
                {errors.birthDate && (
                  <div className="error-message">
                    {errors.birthDate.message}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Divider orientation="left">Contact Information</Divider>

          <Row gutter={24}>
            <Col xs={24} sm={24} md={12}>
              <div className="form-item">
                <label>Email</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter email address"
                      status={errors.email ? "error" : ""}
                    />
                  )}
                />
                {errors.email && (
                  <div className="error-message">{errors.email.message}</div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div className="form-item">
                <label>Phone Number</label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{ required: "Phone number is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      status={errors.phoneNumber ? "error" : ""}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <div className="error-message">
                    {errors.phoneNumber.message}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <div className="form-item">
                <label>Address</label>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: "Address is required" }}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      rows={3}
                      placeholder="Enter complete address"
                      status={errors.address ? "error" : ""}
                    />
                  )}
                />
                {errors.address && (
                  <div className="error-message">{errors.address.message}</div>
                )}
              </div>
            </Col>
          </Row>

          <Divider orientation="left">Academic Information</Divider>

          <Row gutter={24}>
            <Col xs={24} sm={12} md={6}>
              <div className="form-item">
                <label>Course/Program</label>
                <Controller
                  name="course"
                  control={control}
                  rules={{ required: "Course is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select course/program"
                      status={errors.course ? "error" : ""}
                      style={{ width: "100%" }}
                    >
                      <Option value="Computer Science">Computer Science</Option>
                      <Option value="Information System">
                        Information System
                      </Option>
                    </Select>
                  )}
                />
                {errors.course && (
                  <div className="error-message">{errors.course.message}</div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="form-item">
                <label>Year Level</label>
                <Controller
                  name="yearLevel"
                  control={control}
                  rules={{ required: "Year level is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select year level"
                      status={errors.yearLevel ? "error" : ""}
                      style={{ width: "100%" }}
                    >
                      <Option value="1">1st Year</Option>
                      <Option value="2">2nd Year</Option>
                      <Option value="3">3rd Year</Option>
                      <Option value="4">4th Year</Option>
                      <Option value="5">5th Year</Option>
                    </Select>
                  )}
                />
                {errors.yearLevel && (
                  <div className="error-message">
                    {errors.yearLevel.message}
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="form-item">
                <label>Semester</label>
                <Controller
                  name="semester"
                  control={control}
                  rules={{ required: "Semester is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select semester"
                      status={errors.semester ? "error" : ""}
                      style={{ width: "100%" }}
                    >
                      <Option value="First">First Semester</Option>
                      <Option value="Second">Second Semester</Option>
                      <Option value="Summer">Summer</Option>
                    </Select>
                  )}
                />
                {errors.semester && (
                  <div className="error-message">{errors.semester.message}</div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="form-item">
                <label>Section</label>
                <Controller
                  name="section"
                  control={control}
                  rules={{ required: "Section is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter section"
                      status={errors.section ? "error" : ""}
                    />
                  )}
                />
                {errors.section && (
                  <div className="error-message">{errors.section.message}</div>
                )}
              </div>
            </Col>
          </Row>

          <Divider orientation="left">Emergency Contact</Divider>

          <Row gutter={24}>
            <Col xs={24} sm={24} md={12}>
              <div className="form-item">
                <label>Emergency Contact Name</label>
                <Controller
                  name="emergencyContactName"
                  control={control}
                  rules={{ required: "Emergency contact name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter emergency contact name"
                      status={errors.emergencyContactName ? "error" : ""}
                    />
                  )}
                />
                {errors.emergencyContactName && (
                  <div className="error-message">
                    {errors.emergencyContactName.message}
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div className="form-item">
                <label>Emergency Contact Number</label>
                <Controller
                  name="emergencyContactNumber"
                  control={control}
                  rules={{ required: "Emergency contact number is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter emergency contact number"
                      status={errors.emergencyContactNumber ? "error" : ""}
                    />
                  )}
                />
                {errors.emergencyContactNumber && (
                  <div className="error-message">
                    {errors.emergencyContactNumber.message}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div style={{ marginTop: "20px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: "100%",
                height: "40px",
                backgroundColor: "#59bf8f",
                borderColor: "#59bf8f",
              }}
            >
              Register Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Add some CSS for form styling
const styles = `
  .form-item {
    margin-bottom: 16px;
  }
  
  .form-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .error-message {
    color: #ff4d4f;
    font-size: 12px;
    margin-top: 4px;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default StudentRegistration;
