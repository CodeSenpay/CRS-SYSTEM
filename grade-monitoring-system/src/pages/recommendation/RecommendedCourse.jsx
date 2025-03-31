import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";

const { Title, Text } = Typography;
const { TextArea } = Input;

function RecommendedCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [verifyUser, setVerifyUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [form] = Form.useForm();

  const verifyToken = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/system/all-course-recommendations",
        {
          withCredentials: true,
        }
      );
      setRecommendations(response.data.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      message.error("Failed to fetch recommendations");
    }
  };

  useEffect(() => {
    verifyToken();
    if (verifyUser === "admin") {
      fetchRecommendations();
    }
  }, [verifyUser]);

  const showModal = (recommendation = null) => {
    if (recommendation) {
      setEditingRecommendation(recommendation);
      form.setFieldsValue({
        subject_code: recommendation.subject_code,
        alternative_course: recommendation.alternative_course,
        reason: recommendation.reason,
      });
    } else {
      setEditingRecommendation(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecommendation(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecommendation) {
        await axios.put(
          "http://localhost:3000/api/system/update-course-recommendation",
          values,
          {
            withCredentials: true,
          }
        );
        message.success("Recommendation updated successfully");
      } else {
        await axios.post(
          "http://localhost:3000/api/system/add-course-recommendation",
          values,
          {
            withCredentials: true,
          }
        );
        message.success("Recommendation added successfully");
      }
      setIsModalVisible(false);
      fetchRecommendations();
    } catch (error) {
      console.error("Error saving recommendation:", error);
      message.error("Failed to save recommendation");
    }
  };

  const handleDelete = async (subject_code) => {
    Modal.confirm({
      title: "Are you sure you want to delete this recommendation?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await axios.delete(
            "http://localhost:3000/api/system/delete-course-recommendation",
            {
              data: { subject_code },
              withCredentials: true,
            }
          );
          message.success("Recommendation deleted successfully");
          fetchRecommendations();
        } catch (error) {
          console.error("Error deleting recommendation:", error);
          message.error("Failed to delete recommendation");
        }
      },
    });
  };

  const columns = [
    {
      title: "Subject Code",
      dataIndex: "subject_code",
      key: "subject_code",
      width: 150,
    },
    {
      title: "Subject Name",
      dataIndex: "subject_name",
      key: "subject_name",
      width: 200,
    },
    {
      title: "Alternative Course",
      dataIndex: "alternative_course",
      key: "alternative_course",
      width: 200,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.subject_code)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {isLoading && <Loading />}

      {verifyUser !== "admin" && (
        <div className="text-center py-5" style={{ margin: "24px" }}>
          <Title level={2} style={{ color: "#ff4d4f" }}>
            Access Denied
          </Title>
          <Text style={{ fontSize: "16px" }}>
            Only administrators can access this page.
          </Text>
        </div>
      )}

      {verifyUser === "admin" && (
        <Card
          title={<Title level={3}>Course Recommendations Management</Title>}
          style={{ margin: "24px" }}
        >
          <div style={{ marginBottom: "16px", textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Add New Recommendation
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={recommendations}
            rowKey="subject_code"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            bordered
          />

          <Modal
            title={
              editingRecommendation
                ? "Edit Recommendation"
                : "Add New Recommendation"
            }
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="subject_code"
                label="Subject Code"
                rules={[
                  { required: true, message: "Please enter subject code" },
                ]}
              >
                <Input disabled={!!editingRecommendation} />
              </Form.Item>

              <Form.Item
                name="alternative_course"
                label="Alternative Course"
                rules={[
                  {
                    required: true,
                    message: "Please enter alternative course",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message: "Please enter reason" }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
                <Space>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    {editingRecommendation ? "Update" : "Add"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      )}
    </>
  );
}

export default RecommendedCourse;
