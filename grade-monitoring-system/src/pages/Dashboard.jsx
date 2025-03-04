import { Layout } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import SideNavBar from "../components/SideNavBar";
import "../css/dashboard.css";
const { Content, Sider } = Layout;
function Dashboard() {
  const [isloading, setLoading] = useState(false);
  const [collapse, setCollapse] = useState(false);

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

      setVerifyUser(response.data.user.userEmail);
      console.log(response.data.user.userEmail);
    } catch (err) {
      setVerifyUser(undefined);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Hello");
    verifyToken();
  }, []);
  return (
    <>
      {isloading && <Loading />}
      {verifyUser === undefined && <Navigate to="/login" replace />}
      {verifyUser && (
        <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
          <Sider
            className="sidebar"
            collapsed={collapse}
            collapsible
            trigger={null}
            breakpoint="lg"
            collapsedWidth="80"
            width="250"
            onBreakpoint={(broken) => {
              setCollapse(broken);
            }}
            onCollapse={(collapsed) => {
              setCollapse(collapsed);
            }}
            style={{
              height: "100%",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            <SideNavBar collapse={collapse} setCollapse={setCollapse} />
          </Sider>
          <Layout
            style={{
              marginLeft: collapse ? "80px" : "250px",
              transition: "margin-left 0.2s",
            }}
          >
            <Content
              style={{
                padding: "16px",
                minHeight: "100vh",
                backgroundColor: "#e6f7ff",
                overflow: "auto",
              }}
            >
              <div
                className="content-wrapper"
                style={{
                  maxWidth: "1400px",
                  margin: "0 auto",
                  padding: "0",
                  height: "100%",
                }}
              >
                <Outlet />
              </div>
            </Content>
          </Layout>
        </Layout>
      )}
    </>
  );
}

export default Dashboard;
