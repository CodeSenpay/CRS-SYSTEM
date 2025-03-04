import { yupResolver } from "@hookform/resolvers/yup";
import { Input, Modal } from "antd";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import React, { useContext, useState } from "react";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { authContext } from "../components/AuthContext";
import Loading from "../components/Loading";
import { notifyError, notifySucccess } from "../components/ToastUtils";
import VerifyOtp from "../components/VerifyOtp";
import "../css/login.css";

import { getUserLevel } from "../utils/authUtils";

const formSchema = Yup.object().shape({
  user_email: Yup.string()
    .email("Invalid Email")
    .required("Email is required!"),
  user_password: Yup.string()
    .min(8, "Wrong Password, Expected atleast 8 characters")
    .required("Password is required!"),
});

function Login() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [apiResponse, setApiResponse] = useState();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(authContext);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ resolver: yupResolver(formSchema) });

  const resendOtp = async (email) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/auth/resend-otp",
        { user_email: email },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);

      if (response.data["statuscode"] === 1) {
        modal.info({
          title: "OTP Updated",
          content: (
            <>
              <p>
                OTP has been updated, please check your email to get your
                updated OTP
              </p>
            </>
          ),
          onOk() {
            reset();
          },
        });
      } else {
        modal.info({
          title: `${response.data["response"]}`,
          onOk() {
            reset();
          },
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setUserEmail(data.user_email);

      console.log(response.data);

      if (response.data["statuscode"] === 400) {
        setApiResponse(response.data["response"]);
        setIsModalOpen(true);
        reset();
      }

      if (response.data["statuscode"] === 404) {
        notifyError(response.data["message"]);
        reset();
      }

      if (response.data["statuscode"] === 401) {
        modal.error({
          title: "OTP Expired!",
          content: (
            <>
              <p>{response.data["response"]}</p>
            </>
          ),
          okText: "Resend OTP",

          onOk() {
            resendOtp(data.user_email);
          },
        });
      }

      if (response.data["statuscode"] === 1) {
        login(data.user_email);

        notifySucccess(`${response.data["message"]}`);

        if (response.data["mfa"]) {
          navigate("/mfa-page");
        } else {
          const response = await getUserLevel({ email: data.user_email });
          console.log(response);
          if (response.user_level == "student" && response.success) {
            navigate("/student-dashboard");
          }

          if (response.user_level == "admin" && response.success) {
            navigate("/dashboard/home");
          }

          if (response.user_level == "employee" && response.success) {
            navigate("/dashboard/home");
          }
        }
      }

      if (response.data["statuscode"] === 0) {
        modal.info({
          title: "Wrong Password!",
          content: (
            <>
              <p>Wrong Password, Try Again!</p>
            </>
          ),
          onOk() {
            setValue("user_password", "");
          },
        });
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
        className="LoginPage"
        style={{
          opacity: loading ? 0.5 : 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "450px",
            width: "100%",
            padding: "30px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          <div className="login-form">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="white"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "24px",
                fontSize: "22px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              STUDENT GRADE MONITORING SYSTEM
            </h2>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="form-group">
                <Form.Floating className="mb-4">
                  <Form.Control
                    id="inputUserId"
                    type="text"
                    placeholder="User ID"
                    {...register("user_email")}
                    isInvalid={errors.user_email?.message}
                    style={{
                      padding: "12px 16px",
                      height: "50px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                  <label htmlFor="inputUserId" style={{ padding: "12px 16px" }}>
                    Email Address
                  </label>

                  <Form.Control.Feedback type="invalid">
                    {errors.user_email?.message}
                  </Form.Control.Feedback>
                </Form.Floating>
              </div>
              <div className="form-group">
                <Form.Floating className="mb-4">
                  <Form.Control
                    id="inputUserPassword"
                    type="password"
                    placeholder="Password"
                    {...register("user_password")}
                    isInvalid={errors.user_password?.message}
                    style={{
                      padding: "12px 16px",
                      height: "50px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                  <label
                    htmlFor="inputUserPassword"
                    style={{ padding: "12px 16px" }}
                  >
                    Password
                  </label>
                  <Form.Control.Feedback type="invalid">
                    {errors.user_password?.message}
                  </Form.Control.Feedback>
                </Form.Floating>
              </div>
              <button
                type="submit"
                className="loginBtn"
                style={{
                  width: "100%",
                  padding: "12px",
                  background:
                    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "16px",
                  fontWeight: "600",
                  fontSize: "16px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 10px rgba(37, 117, 252, 0.2)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 15px rgba(37, 117, 252, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(37, 117, 252, 0.2)";
                }}
              >
                Login
              </button>
            </form>
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "14px",
                color: "#555",
              }}
            >
              Not registered yet?{" "}
              <Link
                to="/signup"
                style={{
                  color: "#2575fc",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Sign Up Here
              </Link>
            </p>
            <div
              style={{
                textAlign: "center",
                marginTop: "30px",
                padding: "15px 0",
                borderTop: "1px solid #eee",
                color: "#777",
                fontSize: "13px",
              }}
            >
              Developed By: Robert Mayo Elumba
            </div>
          </div>
        </div>
        {contextHolder}
      </div>
    </>
  );
}

export default Login;
