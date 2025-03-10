import { Button, Card, Select, Space, Table, Typography } from "antd";
import { useState } from "react";

const { Title } = Typography;
const { Option } = Select;

function AddGrades() {
  const [semester, setSemester] = useState("1st Semester - 2024-2025");

  // Sample teaching load data based on the image
  const teachingLoadData = [
    {
      key: "1",
      code: "CC 106",
      title: "Application Development & Emerging Technology",
      type: "LAB",
      days: "F",
      time: "4:00 PM-7:00 PM",
      schedule: "F [entire period]",
      room: "4 IN 1 LAB",
      status: "PRINTED",
    },
    {
      key: "2",
      code: "CS Prof Elect 10",
      title: "Android Application Development",
      type: "LAB",
      days: "F",
      time: "1:00 PM-4:00 PM",
      schedule: "F [entire period]",
      room: "COMP LAB 2",
      status: "PRINTED",
    },
    {
      key: "3",
      code: "CC 101",
      title: "INTRODUCTION TO COMPUTING",
      type: "LEC",
      days: "F",
      time: "8:00 AM-10:00 AM",
      schedule: "F [entire period]",
      room: "PHYS LAB (CAS)",
      status: "PRINTED",
    },
    {
      key: "4",
      code: "CC 106",
      title: "Application Development & Emerging Technology",
      type: "LEC",
      days: "M-W",
      time: "5:30 PM-6:30 PM",
      schedule: "W [entire period]",
      room: "GS ER 1",
      status: "PRINTED",
    },
    {
      key: "5",
      code: "CS Prof Elect 10",
      title: "Android Application Development",
      type: "LEC",
      days: "M-W",
      time: "9:00 AM-10:00 AM",
      schedule: "M [entire period]",
      room: "-",
      status: "PRINTED",
    },
    {
      key: "6",
      code: "IS 313",
      title: "System Analysis & Design",
      type: "LEC",
      days: "M-W",
      time: "2:30 PM-4:00 PM",
      schedule: "M [entire period]",
      room: "GS ER 3",
      status: "PRINTED",
    },
    {
      key: "7",
      code: "ProE 2",
      title: "Enterprise System",
      type: "LEC",
      days: "M-W",
      time: "1:00 PM-2:30 PM",
      schedule: "W [entire period]",
      room: "BIO LAB (CAS)",
      status: "PRINTED",
    },
    // Add more rows as needed to match the image
  ];

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Descriptive Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Face to Face Schedule",
      dataIndex: "schedule",
      key: "schedule",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" className="bg-blue-500">
            <span className="text-xs">VIEW STUDENTS</span>
          </Button>
          <Button type="primary" size="small" className="bg-green-500">
            <span className="text-xs">EXPORT</span>
          </Button>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <span className="text-gray-500">{status}</span>,
    },
    {
      title: "Progress",
      key: "progress",
      render: () => (
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            0%
          </div>
        </div>
      ),
    },
  ];

  const handleSemesterChange = (value) => {
    setSemester(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-6">
      <div className="w-full">
        <Card
          className="hover:shadow-xl transition-all duration-300"
          title={
            <div className="text-left">
              <Title level={4} style={{ margin: 0 }}>
                TEACHING LOAD
              </Title>
            </div>
          }
        >
          <div className="mb-4">
            <Select
              value={semester}
              onChange={handleSemesterChange}
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="1st Semester - 2024-2025">
                1st Semester - 2024-2025
              </Option>
              <Option value="2nd Semester - 2024-2025">
                2nd Semester - 2024-2025
              </Option>
              <Option value="Summer - 2025">Summer - 2025</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={teachingLoadData}
            pagination={false}
            size="middle"
            bordered
            className="teaching-load-table"
          />
        </Card>
      </div>
    </div>
  );
}

export default AddGrades;
