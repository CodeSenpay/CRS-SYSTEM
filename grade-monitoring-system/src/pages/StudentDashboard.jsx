import { BookOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Layout,
  Row,
  Statistic,
  Typography,
} from "antd";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../components/AuthContext";
import Loading from "../components/Loading";
import { notifyError, notifySucccess } from "../components/ToastUtils";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function StudentDashboard() {
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const { user, logout } = useContext(authContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if no user is authenticated
    if (!user) {
      navigate("/login");
      return;
    }

    fetchStudentData();
    fetchStudentGrades();
  }, [user, navigate]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/system/get-student-info",
        { email: user },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setStudentData(response.data.data);
      } else {
        notifyError("Failed to fetch student information");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      notifyError("Error fetching student information");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentGrades = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/system/get-student-grades",
        { email: user },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setGrades(response.data.grades || []);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/logout",
        { email: user },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.statuscode === 1) {
        logout();
        notifySucccess("Logged out successfully");
        navigate("/login");
      } else {
        notifyError("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      notifyError("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {loading && <Loading />}

      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="../../assets/images/LogoPNG.png"
            alt="Logo"
            style={{ height: "40px", marginRight: "16px" }}
          />
          <Title level={4} style={{ margin: 0, color: "#003366" }}>
            Student Portal
          </Title>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Text style={{ marginRight: "16px" }}>
            {studentData?.firstName} {studentData?.lastName}
          </Text>
          <Avatar icon={<UserOutlined />} />
          <Button
            type="link"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ marginLeft: "8px" }}
          >
            Logout
          </Button>
        </div>
      </Header>

      <Content style={{ padding: "24px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Student Information Card */}
          <Card
            title="Student Information"
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {studentData ? (
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text type="secondary">Student ID</Text>
                    <div>{studentData.studentId}</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text type="secondary">Name</Text>
                    <div>
                      {studentData.firstName}{" "}
                      {studentData.middleName
                        ? studentData.middleName + " "
                        : ""}
                      {studentData.lastName}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text type="secondary">Email</Text>
                    <div>{studentData.email}</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text type="secondary">Course/Program</Text>
                    <div>{studentData.course}</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text type="secondary">Year Level</Text>
                    <div>{studentData.yearLevel}</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div>
                    <Text type="secondary">Section</Text>
                    <div>{studentData.section}</div>
                  </div>
                </Col>
              </Row>
            ) : (
              <div>Loading student information...</div>
            )}
          </Card>

          {/* Academic Summary */}
          <Row gutter={24} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: "8px" }}>
                <Statistic
                  title="Current Semester"
                  value={studentData?.semester || "N/A"}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: "8px" }}>
                <Statistic
                  title="Courses Enrolled"
                  value={grades.length}
                  suffix="courses"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: "8px" }}>
                <Statistic
                  title="Average Grade"
                  value={
                    grades.length > 0
                      ? (
                          grades.reduce(
                            (sum, grade) =>
                              sum + parseFloat(grade.finalGrade || 0),
                            0
                          ) / grades.length
                        ).toFixed(2)
                      : "N/A"
                  }
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          {/* Grades Table */}
          <Card
            title="Current Grades"
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          >
            {grades.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={tableHeaderStyle}>Course Code</th>
                      <th style={tableHeaderStyle}>Course Name</th>
                      <th style={tableHeaderStyle}>Midterm</th>
                      <th style={tableHeaderStyle}>Finals</th>
                      <th style={tableHeaderStyle}>Final Grade</th>
                      <th style={tableHeaderStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #f0f0f0" }}
                      >
                        <td style={tableCellStyle}>{grade.courseCode}</td>
                        <td style={tableCellStyle}>{grade.courseName}</td>
                        <td style={tableCellStyle}>{grade.midterm || "N/A"}</td>
                        <td style={tableCellStyle}>{grade.finals || "N/A"}</td>
                        <td style={tableCellStyle}>
                          {grade.finalGrade || "N/A"}
                        </td>
                        <td style={tableCellStyle}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              backgroundColor:
                                parseFloat(grade.finalGrade) >= 75
                                  ? "#d4f7d4"
                                  : "#ffe0e0",
                              color:
                                parseFloat(grade.finalGrade) >= 75
                                  ? "#52c41a"
                                  : "#f5222d",
                            }}
                          >
                            {parseFloat(grade.finalGrade) >= 75
                              ? "Passed"
                              : "Failed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No grades available</div>
            )}
          </Card>
        </div>
      </Content>

      <Footer style={{ textAlign: "center", background: "#fff" }}>
        Student Grade Monitoring System ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

// Table styles
const tableHeaderStyle = {
  padding: "12px 16px",
  textAlign: "left",
  borderBottom: "1px solid #f0f0f0",
};

const tableCellStyle = {
  padding: "12px 16px",
};

export default StudentDashboard;
