import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../schema/authSchema";
import type { SignupData } from "../types/types";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Footer from "../components/Footer";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loggedInUser = Cookies.get("loggedInUser");
    if (loggedInUser) {
      navigate("/home");
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, {
        displayName: data.name
      });
      
      const userData = {
        name: data.name,
        email: user.email,
        uid: user.uid
      };
      
      Cookies.set("loggedInUser", JSON.stringify(userData), { expires: 1 });
      navigate("/home");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        alert("User already exists!");
      } else {
        alert(error.message || "Signup failed");
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        name: user.displayName || user.email?.split('@')[0],
        email: user.email,
        uid: user.uid
      };
      
      Cookies.set("loggedInUser", JSON.stringify(userData), { expires: 1 });
      navigate("/home");
    } catch (error: any) {
      console.error("Google signup error:", error);
      alert(error.message || "Google sign-up failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow flex justify-center items-center px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-5"
        >
          {/* Logo */}
          <img
            src="/ats.png"
            alt="Aaja Ta Suree Logo"
            className="w-24 mx-auto mb-4 animate-fadeInScale transition-transform transform hover:scale-105"
          />

          <h2 className="text-3xl font-bold text-center text-indigo-600">
            Sign Up
          </h2>

          {/* Name */}
          <div>
            <input
              {...register("name")}
              placeholder="Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="min-h-[20px] mt-1">
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              {...register("email")}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="min-h-[20px] mt-1">
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

 {/* Password */}
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    {...register("password")}
    placeholder="Password"
    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/3 transform -translate-y-1/2 text-gray-500 focus:outline-none"
  >
    {showPassword ? (
      <FiEyeOff className="text-xl" />
    ) : (
      <FiEye className="text-xl" />
    )}
  </button>

  <div className="min-h-[20px] mt-1">
    {errors.password && (
      <p className="text-sm text-red-600">{errors.password.message}</p>
    )}
  </div>
</div>


          {/* Confirm Password */}
          <div>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition duration-300 cursor-pointer"
          >
            Register
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-3 text-sm text-gray-500">OR</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <FcGoogle className="text-2xl" />
            Sign up with Google
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 text-indigo-600 font-semibold py-3 rounded-lg hover:bg-gray-300 transition duration-300 cursor-pointer"
          >
            Back to Login
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
