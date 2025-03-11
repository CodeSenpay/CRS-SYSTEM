import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
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
    <div className="w-100">
      {isLoading && <Loading />}
      {verifyUser != "admin" && (
        <h1>Only for Admins, not accessible to employee</h1>
      )}
      {verifyUser === "admin" && (
        <>
          <h1>Add Account Page</h1>
          <form
            onSubmit={handleSubmit(handleAddAccount)}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            <div className="form-group p-5 d-flex flex-column w-100 h-100 justify-content-center gap-3">
              <Form.Floating>
                <Form.Control
                  id="fullname"
                  type="text"
                  placeholder="Fullname"
                  {...register("user_name")}
                  isInvalid={errors.user_name?.message}
                />
                <label htmlFor="fullname">Fullname</label>
                <Form.Control.Feedback type="invalid">
                  {errors.user_name?.message}
                </Form.Control.Feedback>
              </Form.Floating>

              <Form.Floating>
                <Form.Control
                  id="emailAddress"
                  type="text"
                  placeholder="Email Address"
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
                  type="text"
                  placeholder="Mobile Number"
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
                  {...register("user_password")}
                  isInvalid={errors.user_password?.message}
                />
                <label htmlFor="userPassword">Password</label>
                <Form.Control.Feedback type="invalid">
                  {errors.user_password?.message}
                </Form.Control.Feedback>
              </Form.Floating>
              <Button type="submit" variant="primary">
                Add Employee
              </Button>
            </div>
            <div className="form-group"></div>
          </form>
        </>
      )}
    </div>
  );
}

export default AddAccount;
