import { UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError } from "./ToastUtils";
export default function User() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState();
  const verifyToken = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/auth/verify-jwt",
        {
          withCredentials: true,
        }
      );

      setUserEmail(response.data.user.userEmail);
    } catch (err) {
      console.log(err.message);
    }
  };

  const items = [
    {
      key: "1",
      label: (
        <Button
          type="text"
          block
          icon={<UserOutlined />}
          style={{
            textAlign: "left",
            height: "40px",
            color: "#59bf8f",
          }}
        >
          View Account
        </Button>
      ),
    },
    {
      key: "2",
      label: (
        <Button
          type="text"
          block
          danger
          style={{
            textAlign: "left",
            height: "40px",
          }}
          onClick={async () => {
            console.log(userEmail);
            const response = await axios.post(
              "http://localhost:3000/api/auth/logout",
              { email: userEmail },
              {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
              }
            );
            if (response.data.statuscode === 1) {
              navigate("/login");
            } else {
              console.log(response.data);
              notifyError("Can't Signout");
            }
          }}
        >
          Logout
        </Button>
      ),
    },
    {
      key: "3",
      label: (
        <Button
          type="text"
          block
          icon={<UserAddOutlined />}
          style={{
            textAlign: "left",
            height: "40px",
            color: "#1890ff",
          }}
          onClick={() => {
            navigate("register-student");
          }}
        >
          Register Student
        </Button>
      ),
    },
    {
      key: "4",
      label: (
        <Button
          type="text"
          block
          icon={<UserOutlined />}
          style={{
            textAlign: "left",
            height: "40px",
          }}
          onClick={() => {
            navigate("add-account");
          }}
        >
          Add Account
        </Button>
      ),
    },
  ];

  useEffect(() => {
    verifyToken();
  });

  return (
    <div
      className="userDropdown"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 1000,
      }}
    >
      <Dropdown
        menu={{ items }}
        placement="topLeft"
        trigger={["click"]}
        overlayStyle={{
          minWidth: "200px",
        }}
      >
        <Button
          type="primary"
          icon={<UserOutlined />}
          style={{
            borderRadius: "50%",
            width: "45px",
            height: "45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            backgroundColor: "#59bf8f",
          }}
        />
      </Dropdown>
    </div>
  );
}
