import React, { useEffect } from 'react'
import { useForm } from "react-hook-form"
import googleIcon from '../assets/images/google_icon.svg'
import loaderIcon from '../assets/images/loader_icon2.svg'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/axiosInstance'

const Signup = () => {

  const {register, handleSubmit, watch, formState: { errors, isSubmitting }} = useForm({mode: "onChange"})

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      console.log(data);
        const response = await axiosInstance.post("/api/auth/register", data);
        console.log(response.data); 
        navigate("/login");

    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="bg-stone-300 w-full h-screen flex items-center">
      <div className="bg-white mx-auto flex rounded-xl shadow-lg overflow-hidden md:w-[55rem]">
        <div className="bg-gradient-to-r from-purple-400 via-blue-500 to-blue-600 w-[45%] p-12 hidden md:flex md:flex-col md:justify-center">
          <h1 className="text-[2rem] font-rejouice font-semibold tracking-wide text-white">Codexa.io</h1>
          <h2 className="text-[1.7rem] tracking-tight font-['sora'] text-stone-200 leading-[2rem] mb-4">Digital platform for developers to showcase their work</h2>
          <p className="text-white opacity-75">For the developers, by the developers</p>
        </div>
        
        <div className="w-full md:w-[55%] relative flex items-center font-neue">
          
          {isSubmitting && <div className='absolute w-full h-full flex justify-center items-center'>
            <img className="w-[4rem] h-[4rem] animate-spin" src={loaderIcon}/>
            <div className='absolute w-full h-full bg-black opacity-5'/>
          </div>}

          <div className="px-12 py-10 flex flex-col justify-center space-y-4 w-full">
            {/* header */}
            <div className="mb-0">
              <h2 className="text-[1.6rem] font-semibold font-neue text-gray-800">Welcome to Codexa 👋</h2>
            </div>

            <form action="" className='space-y-3' onSubmit={handleSubmit(onSubmit)} noValidate>
              
              {/* Name */}
              <div className="w-full">
                <label className="block text-gray-600" htmlFor="name">Name</label>
                <input 
                  className="w-full p-[5px] border border-gray-300 rounded" 
                  type="text" 
                  id="name" 
                  {...register("name", { 
                    required: {value: true, message: "Name is required"}, 
                    maxLength: {value: 50, message: "Name is too long"} 
                  })}
                />
                {errors.name && <div className='text-[14px] text-red-600'>{errors.name.message}</div>}
              </div>

              {/* Role Selection */}
              <div className="w-full">
                <label className="block text-gray-600" htmlFor="role">Sign up as</label>
                <select 
                  className="w-full p-[5px] border border-gray-300 rounded bg-white" 
                  id="role"
                  {...register("role", { 
                    required: {value: true, message: "Please select a role"} 
                  })}
                >
                  <option value="">Select a role</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="employer">Employer</option>
                </select>
                {errors.role && <div className='text-[14px] text-red-600'>{errors.role.message}</div>}
              </div>

              {/* Email */}
              <div className="">
                <label className="block text-gray-600" htmlFor="email">Email</label>
                <input  
                  className="w-full p-[5px] border border-gray-300 rounded" 
                  type="email" 
                  id="email"  
                  {...register("email", {
                    required: { value: true, message: "Email is required" },
                    maxLength: { value: 254, message: "Email is too long" },
                    minLength: { value: 4, message: "Email is too short" },
                    pattern: { 
                      value: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 
                      message: "Email is invalid" 
                    }
                  })}
                />
                {errors.email && <div className='text-[14px] text-red-600'>{errors.email.message}</div>}
              </div>

              {/* Password */}
              <div className="">
                <label className="block text-gray-600" htmlFor="password">Password</label>
                <input
                  className="w-full p-[5px] border border-gray-300 rounded" 
                  type="password" 
                  id="password"
                  {...register("password", { 
                    required: {value: true, message: "Password is required"}, 
                    maxLength: {value: 64, message: "Max length is 64"}, 
                    minLength: {value: 6, message: "Password must be at least 6 characters"}
                  })}
                />
                {errors.password && <div className='text-red-600 text-[14px]'>{errors.password.message}</div>}
              </div>
            
              <p className="text-center mt-5 text-stone-800">
                Already have an account?&nbsp; 
                <Link to="/login" className="text-blue-600">Log in</Link>
              </p>

              <button 
                disabled={isSubmitting} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 mt-3 px-4 rounded mb-4" 
                type="submit"
              >
                Sign Up
              </button>
              
              <button 
                disabled={isSubmitting} 
                className="w-full flex items-center hover:border-gray-400 justify-center border border-gray-300 py-2 px-4 rounded"
              >
                <img className='w-5 h-5 mr-2' src={googleIcon} alt="Google icon" /> 
                Continue with Google
              </button> 
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup