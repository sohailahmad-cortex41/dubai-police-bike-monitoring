import React, { useState } from "react";
import logo from "../../assets/logo.jpg";
import "./Login.css";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import Loader from "../../components/loader/Loader";
import { postData } from "../../api/axios";


const initialState = {
  name: "",
  email: "",
  password: "",
};

export default function Login() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.username) errs.username = "Username is required";
    if (!formData.password)
      errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setIsLoading(true);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const { username, password } = formData;

    toast.loading("Logging in...");

    const response = await postData('/auth/login', { username, password }, 'form').catch((err) => {
      console.log("Login error:", err);
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Login failed");
      setIsLoading(false);
    });

    console.log("Login response:", response);

    if (response && response.user) {
      const { user } = response;
      if (user.role === 'admin') {
        toast.dismiss();
        toast.success("Login successful!");
        navigate("/bikers");
        setIsLoading(false);
        return;
      } else {
        toast.dismiss();
        toast.error("Access denied: Admins only");
        setIsLoading(false);
        return;
      }
    }
    toast.dismiss();
    toast.error("Login failed");
    setIsLoading(false);
    return;
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-logo-container">
          <div className="auth-logo-circle">
            <img src={logo} alt="Fashion Fast Logo" />
          </div>
        </div>
        <div className="main-content">
          <h2 className="heading1 text-center mb-3">Dubai Police Motorbike Monitoring System</h2>

          {/* <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          /> */}

          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showToggle
          />

          {/* <p className="my-5 text-center">
            Forgot your password?
            <strong
              className="cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              {" "}
              Reset your password
            </strong>
          </p> */}

          <Button
            onClick={handleSubmit}
            label={
              isLoading ? (
                <span className="button-spinner flex items-center gap-2">
                  <ImSpinner2 className="spin" /> Logging in...
                </span>
              ) : (
                "Login"
              )
            }
          />

        </div>
      </div>
      {isLoading && <Loader loading={isLoading} />}
    </div>
  );
}
