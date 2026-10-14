import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import Image from "../../assets/mainLogo.gif";

const Login = () => {
  const navigate = useNavigate();
  const [EMPID, setEMPID] = useState("");
  const [Password, setPassword] = useState("");

  const handleUserData = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post(
        "http://localhost:7501/api/admin-login",
        {
          ID: EMPID,
          PASSWORD: Password,
        }
      );

      if (response.data.success) {
        const userId = response.data.user._id;

        const token = response.data.token; // Assume the response includes a token
        const userType = response.data.userType;
        const userName =
          response.data.user.Name ||
          response.data.user.TLMName ||
          response.data.user.SLMName ||
          response.data.user.BDMName;
        const Id =
          response.data.user.AdminId ||
          response.data.user.TLMEmpID ||
          response.data.user.SLMEmpID ||
          response.data.user.FLMEmpID;

        const ZONE = response.data.user.ZONE;
        const HQ = response.data.user.HQ;
        const TeamName = response.data.user.TeamName;
        const BusinessUnit = response.data.user.BusinessUnit;
        // Store the token in local storage
        sessionStorage.setItem("AuthToken", token);
        sessionStorage.setItem("UserId", userId);
        sessionStorage.setItem("UserName", userName);
        sessionStorage.setItem("Id", Id);
        sessionStorage.setItem("UserType", userType);
        sessionStorage.setItem("ZONE", ZONE);
        sessionStorage.setItem("HQ", HQ);
        sessionStorage.setItem("TeamName", TeamName);
        sessionStorage.setItem("BusinessUnit", BusinessUnit);

        // Navigate to the dashboard with the user ID
        toast.success("Login Success", { duration: 2000 });
        navigate(`/weeklyLeaderboard/${userId}`);
      } else {
        // Show an error toast message
        toast.error(response.data.message || "Login failed", {
          duration: 2000,
        });
      }
    } catch (error) {
      // Show an error toast message
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      {/* // new UI  */}

      <div class="h-screen flex">
        <div
          class="hidden lg:flex w-full lg:w-1/2 login_img_section
          justify-around items-center"
        >
          <div
            class=" 
                  bg-black 
                  opacity-20 
                  inset-0 
                  z-0"
          ></div>
          <div class="w-full mx-auto px-20 flex-col items-center space-y-6 bg-gradient-to-l from-customGradientStart to-customGradientEnd h-screen">
            <div class="flex justify-center lg:justify-start mt-6"></div>
          </div>
        </div>
        <div class="flex w-full lg:w-1/2 justify-center items-center bg-white space-y-8">
          <div class="w-full px-8 md:px-32 lg:px-24">
            <div className="flex justify-center items-center flex-col mt-[-110px]  ">
              {/* <h1 class="text-gray-800 font-bold text-2xl mb-1 text-center">Selecta Digital Prescription Tracker</h1> */}
            </div>

            <form class=" rounded-md p-5">
              <div className="flex justify-center items-center flex-col  ">
                <img src={Image} alt="" width="220" className="mb-10 mt-10" />
                {/* <h1 class="text-gray-800 font-bold text-2xl mb-4">Login</h1> */}
                {/* <p class="text-lg font-bold text-gray-600 mb-8 text-center">
                  Welcome back! Please login to your account.
                </p> */}
              </div>

              <label htmlFor="" className="font-bold ml-3">
                {" "}
                User Id
              </label>
              <div class="flex items-center border-2 mb-8 py-2 px-3 rounded-full">
                <input
                  id="email"
                  value={EMPID}
                  onChange={(e) => setEMPID(e.target.value)}
                  class=" pl-2 w-full outline-none border-none"
                  type="email"
                  name="email"
                  placeholder=""
                />
              </div>

              <label htmlFor="" className="font-bold ml-3">
                Password
              </label>
              <div class="flex items-center border-2 sm:mb-0 py-2 px-3 rounded-full ">
                <input
                  class="pl-2 w-full outline-none border-none"
                  type="password"
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  id="password"
                  placeholder=""
                />
                <img src="/src/assets/padlock.png" alt="" />
              </div>

              {/* <div class="flex justify-end mt-2">
                <span class="text-sm ml-2 text-gray-400 hover:text-blue-500 cursor-pointer hover:-translate-y-1 duration-500 transition-all">
                  Forgot Password ?
                </span>
              </div> */}

              <div className="flex justify-center items-center">
                <button
                  type="submit"
                  onClick={handleUserData}
                  class="block w-[200px] bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd mt-10  py-2 rounded-full  hover:-translate-y-1 transition-all duration-500 text-white text-[18px] mb-2"
                >
                  Login
                </button>
              </div>
              {/* <div className="flex justify-center items-start mt-10">
                <img
                  src="https://digilateral.com/images/digilogo.png"
                  alt="POB"
                  className="w-[220px]"
                />
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
