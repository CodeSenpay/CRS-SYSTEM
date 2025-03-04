import {
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  NumberOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import VerifyOtp from "../components/VerifyOtp";
import "../css/SignUp.css";

function SignUp() {
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState();
  const [apiResponse, setApiResponse] = useState();
  const [userEmail, setUserEmail] = useState();
  const navigate = useNavigate();

  const onChange = async (otp) => {
    console.log("OTP Input:", otp);
    console.log(userEmail);

    try {
      setLoading(true);
      setIsModalOpen(false);
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify-email",
        { user_email: userEmail, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      modal.info({
        title: "OTP info",
        content: (
          <>
            <p>{response.data["response"]}</p>
          </>
        ),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const sharedProps = {
    onChange,
  };

  const signin = async (values) => {
    const newData = { ...values, user_level: "student" };
    setUserEmail(values.user_email);

    const jsonData = JSON.stringify(newData);
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        jsonData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data["statuscode"] === 0) {
        const config = {
          title: "Invalid Data Input",
          content: (
            <>
              <p>{response.data["response"]}</p>
            </>
          ),
          onOk() {
            console.log("Hey");
          },
        };
        modal.error(config);
      }

      if (response.data["statuscode"] === 1) {
        setApiResponse(response.data["response"]);
        const config = {
          title: "Register Success",
          content: (
            <>
              <p>{response.data["response"]}</p>
            </>
          ),
          onOk() {
            setIsModalOpen(true);
          },
        };
        modal.success(config);
        form.resetFields();
      }

      if (response.data["statuscode"] === 3) {
        setApiResponse(response.data["response"]);
        const config = {
          title: "Email need to be verify",
          content: (
            <>
              <p>{response.data["response"]}</p>
            </>
          ),
          onOk() {
            setIsModalOpen(true);
          },
        };
        modal.warning(config);
        form.resetFields();
      }

      if (response.data["statuscode"] === 4) {
        const config = {
          title: "User Verified Already",
          content: (
            <>
              <p>{response.data["response"]}</p>
            </>
          ),
          onOk() {
            console.log(response.data["response"]);
          },
        };
        modal.success(config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loading />}
      {isModalOpen && (
        <VerifyOtp isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
          {apiResponse}
          <Input.OTP length={6} {...sharedProps} />
        </VerifyOtp>
      )}
      <div
        style={{
          opacity: loading ? 0.5 : 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          padding: "1rem",
          backgroundImage: "url('../../assets/images/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#003366",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(0, 51, 102, 0.1))",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              marginBottom: "2rem",
              width: "100%",
              maxWidth: "200px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="../../assets/images/LogoPNG.png"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
              alt="JRMSU Logo"
            />
          </div>

          {/* Form */}
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={signin}
              className="signup-form"
              style={{
                padding: "1.5rem",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  color: "#003366",
                  margin: "0 0 0.5rem 0",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Create Your Account
              </h1>
              <p
                style={{
                  color: "#4a4a4a",
                  margin: "0 0 1.5rem 0",
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                Please fill in the information below to register
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "0.8rem",
                }}
              >
                <Form.Item
                  label="Student ID"
                  name="user_id"
                  rules={[
                    { required: true, message: "Student ID is required!" },
                  ]}
                >
                  <Input
                    size="middle"
                    placeholder="Enter Student ID"
                    prefix={<IdcardOutlined />}
                    maxLength={20}
                  />
                </Form.Item>

                <Form.Item
                  label="Full Name"
                  name="user_name"
                  rules={[
                    { required: true, message: "Full name is required!" },
                    { min: 2, message: "Name must be at least 2 characters" },
                  ]}
                >
                  <Input
                    size="middle"
                    placeholder="Enter Full Name"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "0.8rem",
                }}
              >
                <Form.Item
                  label="Email Address"
                  name="user_email"
                  rules={[
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                    { required: true, message: "Email address is required!" },
                  ]}
                >
                  <Input
                    size="middle"
                    placeholder="Enter Email Address"
                    prefix={<MailOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="Mobile Number"
                  name="user_number"
                  rules={[
                    { required: true, message: "Mobile number is required!" },
                    {
                      pattern: /^(09|\+639)\d{9}$/,
                      message: "Please enter a valid Philippine mobile number",
                    },
                  ]}
                >
                  <Input
                    size="middle"
                    placeholder="09XXXXXXXXX"
                    prefix={<NumberOutlined />}
                    maxLength={11}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Password"
                name="user_password"
                rules={[
                  { required: true, message: "Password is required!" },
                  { min: 8, message: "Password must be at least 8 characters" },
                  {
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  size="middle"
                  placeholder="Enter Password"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirm_password"
                dependencies={["user_password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("user_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The passwords do not match!")
                      );
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password
                  size="middle"
                  placeholder="Confirm Password"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: "0.8rem" }}>
                <Button
                  type="primary"
                  size="middle"
                  htmlType="submit"
                  block
                  style={{
                    height: "40px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    backgroundColor: "#003366",
                    borderColor: "#003366",
                  }}
                >
                  Create Account
                </Button>
              </Form.Item>

              <div
                style={{
                  textAlign: "center",
                  borderTop: "1px solid #eee",
                  paddingTop: "0.8rem",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{ color: "#003366", fontWeight: "500" }}
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </div>
      </div>
      {contextHolder}
    </>
  );
}

export default SignUp;
