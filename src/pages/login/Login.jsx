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
  username: "",
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
    if (!formData.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ⬅ important to prevent default form refresh
    setIsLoading(true);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const { username, password } = formData;

    toast.loading("Logging in...");
    try {
      const response = await postData("/auth/login", { username, password }, "form");
      console.log("Login response:", response);

      if (response && response.user) {
        if (response.user.role === "admin") {
          toast.dismiss();
          toast.success("Login successful!");
          navigate("/bikers");
        } else {
          toast.dismiss();
          toast.error("Access denied: Admins only");
        }
      } else {
        toast.dismiss();
        toast.error("Login failed");
      }
    } catch (err) {
      console.log("Login error:", err);
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="heading1 text-center mb-3">
            Dubai Police Motorbike Monitoring System
          </h2>

          {/* 👇 Wrap inputs & button inside a form */}
          <form onSubmit={handleSubmit}>
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

            <Button
              type="submit" // 👈 make sure Button allows this prop
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
          </form>
        </div>
      </div>
      {isLoading && <Loader loading={isLoading} />}
    </div>
  );
}
