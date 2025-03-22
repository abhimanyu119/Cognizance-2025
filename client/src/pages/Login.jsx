import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import googleIcon from "../assets/images/google_icon.svg";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
  });
  const { setIsLoggedIn } = useAuth();

  const navigate = useNavigate();
  const [focused, setFocused] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", data, {showToast: true, toastMessage: "Successfully logged in!"});
      console.log(response.data);
      // Store authentication token
      localStorage.setItem("authToken", response.data.token,{showToast: true, toastMessage: "Successfully logged in!"});

        localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setIsLoggedIn(true);
      navigate("/home");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
      console.error(error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    try {
      const response = await axiosInstance.post("/api/auth/google-login", {
        token: credentialResponse.credential,
      });

      // Store authentication token
      localStorage.setItem("authToken", response.data.token);

      toast.success("Successfully logged in with Google!");

      if (response.data.needsAdditionalInfo) {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      // Handle different error scenarios
      if (error.response?.status === 404) {
        // User not found, suggest signup
        toast.error("No account found. Please sign up first.");
      } else {
        toast.error(
          error.response?.data?.message || "Google authentication failed"
        );
      }
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google authentication failed");
    setIsGoogleLoading(false);
  };

  const handleFocus = (field) => setFocused(field);
  const handleBlur = () => setFocused(null);

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3EDBD3] opacity-5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4A7BF7] opacity-5 rounded-tr-full"></div>
      <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-[#FF6EC7] opacity-10 rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-[#3EDBD3] opacity-10 rounded-full"></div>

      <div className="w-full max-w-6xl bg-[#1E293B] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#283548]">
        {/* Left panel with branding */}
        <div className="bg-gradient-to-br from-[#0B1120] to-[#1E293B] md:w-2/5 p-10 hidden md:flex md:flex-col md:justify-between relative">
          {/* Existing branding content */}
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-wider text-[#F8FAFC] mb-2 font-sans">
              PayCraftq<span className="text-[#3EDBD3]">.io</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] mb-6"></div>
            <h2 className="text-2xl font-light text-[#F8FAFC] leading-relaxed mb-6">
              Digital platform for developers to showcase their work
            </h2>
            <p className="text-[#94A3B8] text-lg">
              For the developers, by the developers
            </p>
          </div>
        </div>

        {/* Right panel with form */}
        <div className="w-full md:w-3/5 py-12 px-6 md:px-16 relative">
          {/* Loading overlay */}
          {(isSubmitting || isGoogleLoading) && (
            <div className="absolute inset-0 bg-[#0F172A] bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-[#3EDBD3] border-r-[#4A7BF7] animate-spin"></div>
                <p className="mt-4 text-[#F8FAFC] font-medium">
                  {isSubmitting ? "Logging in..." : "Signing in with Google..."}
                </p>
              </div>
            </div>
          )}

          <div className="max-w-md mx-auto">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-bold text-[#F8FAFC] mb-2">
                Welcome Back! 👋
              </h2>
              <p className="text-[#94A3B8]">Log in to continue to Codexa</p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Email Input */}
              <div className="space-y-1">
                <label
                  className="block text-sm font-medium text-[#F8FAFC]"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div
                  className={`relative rounded-lg border ${
                    errors.email
                      ? "border-red-500 bg-red-900 bg-opacity-10"
                      : focused === "email"
                      ? "border-[#3EDBD3] bg-[#3EDBD3] bg-opacity-5"
                      : "border-[#283548] bg-[#0F172A] bg-opacity-50"
                  } overflow-hidden transition-all duration-200`}
                >
                  <input
                    className="w-full bg-transparent px-4 py-3 outline-none text-[#F8FAFC] placeholder-[#94A3B8]"
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    onFocus={() => handleFocus("email")}
                    onBlur={handleBlur}
                    {...register("email", {
                      required: { value: true, message: "Email is required" },
                      pattern: {
                        value: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center mt-1">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label
                  className="block text-sm font-medium text-[#F8FAFC]"
                  htmlFor="password"
                >
                  Password
                </label>
                <div
                  className={`relative rounded-lg border ${
                    errors.password
                      ? "border-red-500 bg-red-900 bg-opacity-10"
                      : focused === "password"
                      ? "border-[#FF6EC7] bg-[#FF6EC7] bg-opacity-5"
                      : "border-[#283548] bg-[#0F172A] bg-opacity-50"
                  } overflow-hidden transition-all duration-200`}
                >
                  <input
                    className="w-full bg-transparent px-4 py-3 outline-none text-[#F8FAFC] placeholder-[#94A3B8]"
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    onFocus={() => handleFocus("password")}
                    onBlur={handleBlur}
                    {...register("password", {
                      required: {
                        value: true,
                        message: "Password is required",
                      },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center mt-1">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password.message}
                  </p>
                )}

                {/* Forgot Password Link */}
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#3EDBD3] hover:text-[#4A7BF7] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <button
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  !isSubmitting
                    ? "bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] text-[#0F172A] hover:shadow-lg hover:shadow-[#3EDBD3]/20 transform hover:-translate-y-1"
                    : "bg-[#283548] text-[#94A3B8] cursor-not-allowed"
                }`}
                type="submit"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0F172A]"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute border-t border-[#283548] w-full"></div>
                <div className="relative bg-[#1E293B] px-4 text-sm text-[#94A3B8]">
                  or continue with
                </div>
              </div>

              {/* Google Login */}
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  type="standard"
                  theme="filled_black"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>

              {/* Signup Link */}
              <p className="mt-6 text-center text-[#94A3B8]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#3EDBD3] hover:text-[#4A7BF7] font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
