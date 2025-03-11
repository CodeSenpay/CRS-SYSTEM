import { LockOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Typography } from "antd";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../components/AuthContext";
import Loading from "../components/Loading";
import { getUserLevel } from "../utils/authUtils";

const { Title, Text } = Typography;

function MFAPage() {
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const { user } = useContext(authContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if no user is authenticated
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) {
      message.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/verify-mfa",
        {
          email: user,
          otp: otpValue,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        message.success("MFA verification successful!");

        // Get user level and redirect accordingly
        const userLevelResponse = await getUserLevel({ email: user });

        if (
          userLevelResponse.user_level === "admin" &&
          userLevelResponse.success
        ) {
          navigate("/dashboard/home");
        } else if (
          userLevelResponse.user_level === "instructor" &&
          userLevelResponse.success
        ) {
          navigate("/dashboard/home");
        } else if (
          userLevelResponse.user_level === "student" &&
          userLevelResponse.success
        ) {
          navigate("/student-dashboard");
        } else {
          message.error("Unknown user role. Please contact administrator.");
        }
      } else {
        message.error(
          response.data.message || "Invalid OTP code. Please try again."
        );
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        padding: "20px",
      }}
    >
      {loading && <Loading />}

      <Card
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <LockOutlined
            style={{
              fontSize: "48px",
              color: "#2575fc",
              marginBottom: "16px",
            }}
          />
          <Title level={3} style={{ marginBottom: "8px" }}>
            Two-Factor Authentication
          </Title>
          <Text type="secondary">
            Please enter the 6-digit code from your authenticator app
          </Text>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <Input.OTP
            length={6}
            autoFocus
            value={otpValue}
            onChange={setOtpValue}
            inputType="numeric"
            inputStyle={{ width: "40px", height: "40px" }}
            containerStyle={{ justifyContent: "center", gap: "8px" }}
          />
        </div>

        <Button
          type="primary"
          size="large"
          block
          onClick={handleVerifyOTP}
          loading={loading}
          style={{
            height: "45px",
            fontSize: "16px",
            backgroundColor: "#2575fc",
            borderColor: "#2575fc",
          }}
        >
          Verify
        </Button>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Button
            type="link"
            onClick={() => navigate("/login")}
            style={{ color: "#2575fc" }}
          >
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default MFAPage;
