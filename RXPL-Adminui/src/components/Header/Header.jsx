import React, { useEffect, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import Sidebar from "../Sidebar/Sidebar";
import Profile from "../../assets/profile.png";
import { useNavigate, useParams } from "react-router-dom";
import Bell from "../../assets/notification (2).png";
import axios from "axios";

const Header = ({ pageName }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id: adminId } = useParams();
  const [adminName, setAdminName] = useState("");
  const [Id, setId] = useState("");
  const [count, setCount] = useState(0);

  const userType = sessionStorage.getItem("UserType");

  useEffect(() => {
    const storedAdminName = sessionStorage.getItem("UserName");
    const storedId = sessionStorage.getItem("Id");

    if (storedAdminName) {
      setAdminName(storedAdminName);
    }

    if (storedId) {
      setId(storedId);
    }
  }, []); // Empty dependency array means this runs once on mount


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleOpenProfile = () => {
    userType === "Admin" ? "" : navigate(`/profile/${adminId}`);
  };

  const handleOpenNotification = () => {
    navigate(`/Readnotification/${adminId}`);
  };
  // console.log("isSidebarOpen", isSidebarOpen);
  return (
    <>
      {/* <div className="relative top-[0px] sm:top-[11px] sm:left-[170px] sm:w-[78vw] w-full left-0"> */}
      <div className={`relative flex ${userType === "Admin" ? "sm:left-[210px]" : "sm:left-[130px]"} justify-between items-center`}>
        <nav className="h-[58px] w-full">
          <div className={`flex header ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <div className="sm:w-[20vw] w-[90vw] flex">
              <div
                className="text-[40px] relative top-[10px] md:hidden"
                style={{ color: "gray", cursor: "pointer" }}
                onClick={toggleSidebar}
              >
                <IoMdMenu />
              </div>
              <h1 className="text-customGradientButtonStart relative sm:text-[18px] sm:left-[-80px] left-[10px] font-extrabold top-[20px]">
                {pageName}
              </h1>
            </div>

            {/* <div className="px-[15%]"></div> */}
            <div className="flex justify-end items-center w-full">
              <div className="sm:w-[24vw] flex relative space-x-1">
                <div
                  className="relative justify-center items-center flex top-[9px] sm:h-12 sm:border-2 sm:w-56 w-auto sm:shadow-sm sm:rounded-full cursor-pointer p-2"
                  onClick={handleOpenProfile}
                >
                  <img
                    src={Profile}
                    alt="avatar"
                    className="bg-gradient-to-r from-customGradientStart to-customGradientEnd p-1 rounded-full relative mr-[10px] sm:w-[30px] sm:top-0 w-[9vw]"
                  />

                  <div className="hidden md:block">
                    <h3 className="text-xs align-middle">{adminName}</h3>
                    {/* <p className="text-[10px] align-middle">{Id}</p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div>
          {isSidebarOpen && (
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
