import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Loading from "../components/Loading";
import { notifyError, notifySucccess } from "../components/ToastUtils";

//--------------------------------------------------------
const schema = yup
  .object({
    user_name: yup.string().required("Employee Name is required"),
    user_email: yup
      .string()
      .email("Invalid Email Address")
      .required("Email Address is highly required"),
    user_number: yup.string().required("Number is required"),
    user_password: yup
      .string()
      .min(8, "Password must atleast 8 characters")
      .required("Password required"),
  })
  .required();
//----------------------------------------------------------------
function AddAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [verifyUser, setVerifyUser] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

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

  const handleAddAccount = async (data) => {
    setIsLoading(true);
    const newDataWithUserLevel = {
      ...data,
      user_level: "instructor",
    };
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        newDataWithUserLevel,
        { headers: { "Content-Type": "application/json" } }
      );

      response.data.statuscode === 5 && notifyError(response.data.response);
      response.data.statuscode === 4 && notifyError(response.data["response"]);
      response.data.statuscode === 1 && notifySucccess(response.data.response);
      reset();
    } catch (err) {
      console.log(err.mesage);
    } finally {
      setIsLoading(false);
    }
    console.log(data);
  };

  // const getUserRole = async () => {
  //   const response = await getUserLevel({ email: user });
  //   setUserRole(response["user_level"]);
  //   console.log(response);
  // };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <Container fluid className="py-5">
      {isLoading && <Loading />}
      {verifyUser != "admin" && (
        <div className="text-center py-5">
          <h1 className="text-danger">Access Denied</h1>
          <p className="lead">Only administrators can access this page.</p>
        </div>
      )}
      {verifyUser === "admin" && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">Add New Employee Account</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <form
                  onSubmit={handleSubmit(handleAddAccount)}
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                >
                  <div className="d-flex flex-column gap-4">
                    <Form.Floating>
                      <Form.Control
                        id="fullname"
                        type="text"
                        placeholder="Fullname"
                        className="border-2"
                        {...register("user_name")}
                        isInvalid={errors.user_name?.message}
                      />
                      <label htmlFor="fullname">Full Name</label>
                      <Form.Control.Feedback type="invalid">
                        {errors.user_name?.message}
                      </Form.Control.Feedback>
                    </Form.Floating>

                    <Form.Floating>
                      <Form.Control
                        id="emailAddress"
                        type="email"
                        placeholder="Email Address"
                        className="border-2"
                        {...register("user_email")}
                        isInvalid={errors.user_email?.message}
                      />
                      <label htmlFor="emailAddress">Email Address</label>
                      <Form.Control.Feedback type="invalid">
                        {errors.user_email?.message}
                      </Form.Control.Feedback>
                    </Form.Floating>

                    <Form.Floating>
                      <Form.Control
                        id="mobileNumber"
                        type="tel"
                        placeholder="Mobile Number"
                        className="border-2"
                        {...register("user_number")}
                        isInvalid={errors.user_number?.message}
                      />
                      <label htmlFor="mobileNumber">Mobile Number</label>
                      <Form.Control.Feedback type="invalid">
                        {errors.user_number?.message}
                      </Form.Control.Feedback>
                    </Form.Floating>

                    <Form.Floating>
                      <Form.Control
                        id="userPassword"
                        type="password"
                        placeholder="Password"
                        className="border-2"
                        {...register("user_password")}
                        isInvalid={errors.user_password?.message}
                      />
                      <label htmlFor="userPassword">Password</label>
                      <Form.Control.Feedback type="invalid">
                        {errors.user_password?.message}
                      </Form.Control.Feedback>
                    </Form.Floating>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 py-3 mt-3"
                    >
                      Add Employee
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default AddAccount;
