import axios from "axios";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Loading from "../../components/Loading";
import { notifyError, notifySucccess } from "../../components/ToastUtils";

function RecommendedCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [verifyUser, setVerifyUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [formData, setFormData] = useState({
    subject_code: "",
    alternative_course: "",
    reason: "",
  });

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
      notifyError("Failed to fetch recommendations");
    }
  };

  useEffect(() => {
    verifyToken();
    if (verifyUser === "admin") {
      fetchRecommendations();
    }
  }, [verifyUser]);

  const handleShowModal = (recommendation = null) => {
    if (recommendation) {
      setEditingRecommendation(recommendation);
      setFormData({
        subject_code: recommendation.subject_code,
        alternative_course: recommendation.alternative_course,
        reason: recommendation.reason,
      });
    } else {
      setEditingRecommendation(null);
      setFormData({
        subject_code: "",
        alternative_course: "",
        reason: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecommendation(null);
    setFormData({
      subject_code: "",
      alternative_course: "",
      reason: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecommendation) {
        await axios.put(
          "http://localhost:3000/api/system/update-course-recommendation",
          formData,
          {
            withCredentials: true,
          }
        );
        notifySucccess("Recommendation updated successfully");
      } else {
        await axios.post(
          "http://localhost:3000/api/system/add-course-recommendation",
          formData,
          {
            withCredentials: true,
          }
        );
        notifySucccess("Recommendation added successfully");
      }
      handleCloseModal();
      fetchRecommendations();
    } catch (error) {
      console.error("Error saving recommendation:", error);
      notifyError("Failed to save recommendation");
    }
  };

  const handleDelete = async (subject_code) => {
    if (
      window.confirm("Are you sure you want to delete this recommendation?")
    ) {
      try {
        await axios.delete(
          "http://localhost:3000/api/system/delete-course-recommendation",
          {
            data: { subject_code },
            withCredentials: true,
          }
        );
        notifySucccess("Recommendation deleted successfully");
        fetchRecommendations();
      } catch (error) {
        console.error("Error deleting recommendation:", error);
        notifyError("Failed to delete recommendation");
      }
    }
  };

  return (
    <div className="w-100 p-4">
      {isLoading && <Loading />}
      {verifyUser != "admin" && (
        <h1>Only for Admins, not accessible to employee</h1>
      )}
      {verifyUser === "admin" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Course Recommendations Management</h1>
            <Button variant="primary" onClick={() => handleShowModal()}>
              Add New Recommendation
            </Button>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Alternative Course</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr key={rec.subject_code}>
                  <td>{rec.subject_code}</td>
                  <td>{rec.subject_name}</td>
                  <td>{rec.alternative_course}</td>
                  <td>{rec.reason}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(rec)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(rec.subject_code)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {editingRecommendation
                  ? "Edit Recommendation"
                  : "Add New Recommendation"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject_code"
                    value={formData.subject_code}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingRecommendation}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Alternative Course</Form.Label>
                  <Form.Control
                    type="text"
                    name="alternative_course"
                    value={formData.alternative_course}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    {editingRecommendation ? "Update" : "Add"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default RecommendedCourse;
