import {
    ClusterOutlined,
    HomeOutlined,
    LaptopOutlined,
    OrderedListOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import "../css/SideNavBar.css";
import Logo from "./Logo";
import User from "./User";

const MenuList = () => {
  const navigate = useNavigate();
  return (
    <Menu
      theme="dark"
      className="menu-bar"
      mode="inline"
      style={{
        height: "85vh",
        borderRight: 0,
        overflowY: "hidden",
        overflowX: "hidden",
      }}
    >
      <Menu.Item
        key="home"
        icon={<HomeOutlined />}
        onClick={() => navigate("home")}
        style={{ margin: "4px 0" }}
      >
        Home
      </Menu.Item>

      <Menu.SubMenu
        key="gradessection"
        icon={<LaptopOutlined />}
        title="Grades Section"
        style={{ margin: "4px 0" }}
      >
        <Menu.Item key="addgrades" onClick={() => navigate("input-grades")}>
          Add Grades
        </Menu.Item>
        <Menu.Item key="viewgrades" onClick={() => navigate("view-grades")}>
          View Grades
        </Menu.Item>
      </Menu.SubMenu>
      {/*--------------------------------------- */}
      <Menu.SubMenu
        key="clusteringsection"
        icon={<ClusterOutlined />}
        title="Clustering Section"
        style={{ margin: "4px 0" }}
      >
        <Menu.Item key="viewcluster" onClick={() => navigate("view-cluster")}>
          View Cluster
        </Menu.Item>
        <Menu.Item key="atrisk" onClick={() => navigate("at-risk")}>
          At Risk
        </Menu.Item>
      </Menu.SubMenu>
      {/*--------------------------------------- */}
      <Menu.SubMenu
        key="recommendation"
        icon={<OrderedListOutlined />}
        title="Recommendation Section"
        style={{ margin: "4px 0" }}
      >
        <Menu.Item
          key="recommendedcourse"
          onClick={() => navigate("recommended-courses")}
        >
          Recommended Course
        </Menu.Item>
        <Menu.Item
          key="shiftadvisory"
          onClick={() => navigate("shift-advisory")}
        >
          Shift Advisory
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

const SideNavBar = ({ collapse, setCollapse }) => {
  return (
    <>
      <Logo isCollapse={collapse} setCollapse={setCollapse} />
      <MenuList />
      <User />
    </>
  );
};

export default SideNavBar;
