import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import toast from "react-hot-toast";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import Reports from "../../assets/reports.png";
import DashBoardImg from "../../assets/dashboard.png";
import Logout from "../../assets/logout.png";
import logo from "../../assets/mainLogo.gif";
import { FaUsers, FaWpforms } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { LiaUserEditSolid } from "react-icons/lia";
import Dashboard from "./../Dashboard/Dashboard";
import { MdOutlineLeaderboard } from "react-icons/md";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this line to get the current location

  const [MenuItem, setMenuItem] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState("");
  const [dropdownOpenFeed, setDropdownOpenFeed] = useState("");

  const adminId = sessionStorage.getItem("UserId");
  const userType = sessionStorage.getItem("UserType");
  const digiAdminId = sessionStorage.getItem("Id");
  const BusinessUnit = sessionStorage.getItem("BusinessUnit");

  const gotoReports = () => {
    navigate(`/reports/${adminId}`);
  };

  const gotohome = () => {
    navigate(`/dashboard/${adminId}`);
  };

  const gotoPlayersComparePage = () => {
    navigate(`/PlayersComprare/${adminId}`);
  };

  const gotoTeamWiseStats = () => {
    navigate(`/TeamWiseStats/${adminId}`);
  };

  const gotoApproval = () => {
    navigate(`/approvals/${adminId}`);
  };
  const gotoSettings = () => {
    navigate(`/settings/${adminId}`);
  };
  const gotoUsersPage = () => {
    navigate(`/LiveUser/${adminId}`);
  };
  const gotoUserManagement = () => {
    navigate(`/UserManagement/${adminId}`);
  };

  const handleNavigateMatchSummary = () => {
    navigate(`/MatchDetails/${adminId}`);
  };

  const handleNavigatePlayersData = () => {
    navigate(`/PlayersData/${adminId}`);
  };

  const handleNavigateWeeklyLeaderboard = () => {
    navigate(`/weeklyLeaderboard/${adminId}`);
  };
  const handleNavigateTimeSpent = () => {
    navigate(`/UserScreenTime/${adminId}`);
  };
  const goToQueryPage = () => {
    navigate(`/QueryDetails/${adminId}`);
  };
  const goToInsightPage = () => {
    navigate(`/Insight/${adminId}`);
  };
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("doctorId");
    sessionStorage.removeItem("length,");
    toast.success("Logout Success...");
    navigate("/");
  };

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === `/reports/${adminId}`) {
      setMenuItem(`reports`);
    } else if (pathname === `/dashboard/${adminId}`) {
      setMenuItem(`dashboard`);
    } else if (pathname === `/approvals/${adminId}`) {
      setMenuItem(`approvals`);
    } else if (pathname === `/settings/${adminId}`) {
      setMenuItem(`settings`);
    } else if (pathname === `/LiveUser/${adminId}`) {
      setMenuItem(`liveUsers`);
    } else if (pathname === `/MatchDetails/${adminId}`) {
      setMenuItem(`matchSummary`);
    } else if (pathname === `/QueryDetails/${adminId}`) {
      setMenuItem(`queryDetails`);
    } else if (pathname === `/PlayersData/${adminId}`) {
      setMenuItem(`playersData`);
    } else if (pathname === `/UserScreenTime/${adminId}`) {
      setMenuItem(`TimeSpent`);
    } else if (pathname === `/weeklyLeaderboard/${adminId}`) {
      setMenuItem(`weekly`);
    } else if (pathname === `/TeamWiseStats/${adminId}`) {
      setMenuItem(`TeamWise`);
    } else if (pathname === `/Insight/${adminId}`) {
      setMenuItem(`insights`);
    } else if (pathname === `/UserManagement/${adminId}`) {
      setMenuItem("userManagement");
    } else {
      setMenuItem("");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
    toast.success("Logout success", { duration: 2000 });
  };

  //   return (
  //     <>
  //       <aside
  //         id="logo-sidebar"
  //         // className={`fixed top-0 left-0 z-0 w-80 h-screen pt-2 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-[#F58420] text-white border-r border-gray-200`}
  //         className={`fixed top-0 left-0 z-1 w-80 h-screen pt-2 transition-transform transform -translate-x-full bg-gradient-to-b from-customGradientButtonStart sm:from-customGradientStart to-customGradientButtonEnd sm:to-customGradientEnd text-white border-r border-gray-200 sm:translate-x-0 ${
  //           isSidebarOpen ? "translate-x-0 z-[1] w-[250px]" : " "
  //         }`}
  //         aria-label="Sidebar"
  //       >
  //         <div className="flex justify-end items-center w-[250px] ">
  //           <button
  //             onClick={toggleSidebar}
  //             className="lg:hidden text-white focus:outline-none"
  //           >
  //             {isSidebarOpen ? (
  //               <IoMdClose className="text-3xl" />
  //             ) : (
  //               <IoMdMenu className="text-[3xl]" />
  //             )}
  //           </button>
  //         </div>

  //         <div>
  //           <div className="flex py-6 px-4 text-white relative">
  //             <h1 class="text-xl font-bold uppercase  ">
  //               <img src={logo} alt="PPM" className="w-[150px]" />{" "}
  //             </h1>
  //           </div>
  //           <div className="h-full px-3 pb-2 overflow-y-auto text-white">
  //             <ul class="mt-1 ml-[-35px] space-y-2">
  //               {BusinessUnit === "DIGI" && dropdownOpen && (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "dashboard" ? "bg-[#fe9bf6] text-black" : ""
  //                   }`}
  //                 >
  //                   <span>
  //                     <img
  //                       src={DashBoardImg}
  //                       className="w-[20px] relative right-[10px]"
  //                       alt=""
  //                     />
  //                   </span>

  //                   <div className="relative inline-block text-left">
  //                     <h4
  //                       className={`font-bold ${
  //                         MenuItem === "dashboard" ? "text-white" : "text-white"
  //                       }`}
  //                       onClick={gotohome}
  //                     >
  //                       Dashboard
  //                       {/* 👇 Show arrow only if DIGI */}
  //                       {BusinessUnit === "DIGI" && (
  //                         <i
  //                           className="pl-2 text-[15px] text-xs fas fa-chevron-down"
  //                           onClick={() => setDropdownOpen(!dropdownOpen)}
  //                         ></i>
  //                       )}
  //                     </h4>

  //                     {/* 👇 Render dropdown ONLY if DIGI */}
  //                     {BusinessUnit === "DIGI" && dropdownOpen && (
  //                       <ul className="relative w-full list-disc mt-2 rounded-md z-10 pl-5 pr-5 p-2 right-6">
  //                         <li
  //                           className="text-pink-600 w-full text-[16px]"
  //                           onClick={gotoPlayersComparePage}
  //                         >
  //                           Players Compare
  //                         </li>

  //                         <li
  //                           className="text-pink-600 w-full text-[16px]"
  //                           onClick={gotoTeamWiseStats}
  //                         >
  //                           TeamWise Stats
  //                         </li>
  //                       </ul>
  //                     )}
  //                   </div>
  //                 </li>
  //               )}

  //               <li
  //                 className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                   MenuItem === "weekly" ? "bg-[#fe9bf6]   text-black" : ""
  //                 }`}
  //               >
  //                 <span className="w-[22px] relative right-[7px]">
  //                   <MdOutlineLeaderboard />
  //                 </span>
  //                 <h4
  //                   className={`font-bold
  // ${MenuItem === "weekly" ? "text-white" : "text-white"}
  // `}
  //                   onClick={handleNavigateWeeklyLeaderboard}
  //                 >
  //                   MPL Dashboard
  //                 </h4>
  //               </li>

  //               {BusinessUnit === "DIGI" && dropdownOpen && (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "TeamWise" ? "bg-[#fe9bf6]   text-black" : ""
  //                   }`}
  //                 >
  //                   <span>
  //                     <img
  //                       src={Reports}
  //                       className="w-[20px] relative right-[10px]"
  //                       alt=""
  //                     />
  //                   </span>
  //                   <h4
  //                     className={`font-bold
  // ${MenuItem === "TeamWise" ? "text-white" : "text-white"}
  // `}
  //                     onClick={gotoTeamWiseStats}
  //                   >
  //                     TeamWise Stats
  //                   </h4>
  //                 </li>
  //               )}

  //               {/* {userType === "Admin" ? (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "liveUsers" ? "bg-[#fe9bf6]   text-black" : ""
  //                   }`}
  //                 >
  //                   <span className="w-[20px] relative right-[7px]">
  //                     <FaUsers />
  //                   </span>
  //                   <h4
  //                     className={`font-bold
  // ${MenuItem === "liveUsers" ? "text-white" : "text-white"}
  // `}
  //                     onClick={gotoUsersPage}
  //                   >
  //                     RealTime Overview
  //                   </h4>
  //                 </li>
  //               )

  //               : (
  //                 ""
  //               )} */}

  //               <li
  //                 className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                   MenuItem === "reports" ? "bg-[#fe9bf6]   text-black" : ""
  //                 }`}
  //               >
  //                 <span>
  //                   <img
  //                     src={Reports}
  //                     className="w-[20px] relative right-[10px]"
  //                     alt=""
  //                   />
  //                 </span>
  //                 <h4
  //                   className={`font-bold
  // ${MenuItem === "reports" ? "text-white" : "text-white"}
  // `}
  //                   onClick={gotoReports}
  //                 >
  //                   Reports
  //                 </h4>
  //               </li>

  //               <li
  //                 className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                   MenuItem === "matchSummary" ? "bg-[#fe9bf6]   text-black" : ""
  //                 }`}
  //               >
  //                 <span className="w-[22px] relative right-[7px]">
  //                   <FaWpforms />
  //                 </span>
  //                 <h4
  //                   className={`font-bold
  // ${MenuItem === "matchSummary" ? "text-white" : "text-white"}
  // `}
  //                   onClick={handleNavigateMatchSummary}
  //                 >
  //                   Match Schedule
  //                 </h4>
  //               </li>

  //               <li
  //                 className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                   MenuItem === "playersData" ? "bg-[#fe9bf6]   text-black" : ""
  //                 }`}
  //               >
  //                 <span className="w-[22px] relative right-[7px]">
  //                   <FaWpforms />
  //                 </span>
  //                 <h4
  //                   className={`font-bold
  // ${MenuItem === "playersData" ? "text-white" : "text-white"}
  // `}
  //                   onClick={handleNavigatePlayersData}
  //                 >
  //                   All Players
  //                 </h4>
  //               </li>

  //               <li
  //                 className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                   MenuItem === "insights" ? "bg-[#fe9bf6]   text-black" : ""
  //                 }`}
  //               >
  //                 <span className="w-[22px] relative right-[7px]">
  //                   <FaWpforms />
  //                 </span>
  //                 <h4
  //                   className={`font-bold
  // ${MenuItem === "insights" ? "text-white" : "text-white"}
  // `}
  //                   onClick={goToInsightPage}
  //                 >
  //                   Insights
  //                 </h4>
  //               </li>

  //               {BusinessUnit === "DIGI" && (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "TimeSpent" ? "bg-[#fe9bf6]   text-black" : ""
  //                   }`}
  //                 >
  //                   <span className="w-[22px] relative right-[7px]">
  //                     <FaWpforms />
  //                   </span>
  //                   <h4
  //                     className={`font-bold
  // ${MenuItem === "TimeSpent" ? "text-white" : "text-white"}
  // `}
  //                     onClick={handleNavigateTimeSpent}
  //                   >
  //                     TimeSpent
  //                   </h4>
  //                 </li>
  //               )}

  //               {userType === "Admin" ? (
  //                 ""
  //               ) : (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "approvals" ? "bg-[#fe9bf6]   text-black" : ""
  //                   }`}
  //                 >
  //                   <span className="w-[20px] relative right-[7px]">
  //                     <FaWpforms />
  //                   </span>
  //                   <h4
  //                     className={`font-bold
  // ${MenuItem === "approvals" ? "text-white" : "text-white"}
  // `}
  //                     onClick={gotoApproval}
  //                   >
  //                     Approvals
  //                   </h4>
  //                 </li>
  //               )}

  //               {BusinessUnit?.toLowerCase() !== "emcurecv" && (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "settings" ? "bg-[#fe9bf6] text-black" : ""
  //                   }`}
  //                 >
  //                   <span className="w-[20px] relative right-[7px]">
  //                     <IoSettings />
  //                   </span>
  //                   <h4 className="font-bold text-white" onClick={gotoSettings}>
  //                     Spotlight
  //                   </h4>
  //                 </li>
  //               )}

  //               {digiAdminId !== "DG1101" ? (
  //                 ""
  //               ) : (
  //                 <li
  //                   className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
  //                     MenuItem === "queryDetails"
  //                       ? "bg-[#fe9bf6]   text-black"
  //                       : ""
  //                   }`}
  //                 >
  //                   <span className="w-[20px] relative right-[7px]">
  //                     <FaWpforms />
  //                   </span>
  //                   <h4
  //                     className={`font-bold
  // ${MenuItem === "queryDetails" ? "text-white" : "text-white"}
  // `}
  //                     onClick={goToQueryPage}
  //                   >
  //                     QueryDetails
  //                   </h4>
  //                 </li>
  //               )}

  //               {/* {userType === "Admin" ? (
  //                 <li className="relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white">
  //                   <span className="w-[20px] relative right-[7px]">
  //                     <LiaUserEditSolid size={20} />
  //                   </span>
  //                   <h4
  //                     className={`font-bold
  // ${MenuItem === "notification" ? "text-white" : "text-white"}
  // `}
  //                     onClick={gotoEdit}
  //                   >
  //                     Edit
  //                   </h4>
  //                 </li>
  //               ) : (
  //                 ""
  //               )} */}

  //               <div className="justify-center ">
  //                 <li className="relative flex cursor-pointer space-x-2 rounded-md py-3 px-10  mt-[4vh] text-white ">
  //                   <span>
  //                     <img
  //                       src={Logout}
  //                       className="w-[20px] relative right-[10px]"
  //                       alt=""
  //                     />
  //                   </span>
  //                   <h4 className="font-bold" onClick={handleLogout}>
  //                     Logout
  //                   </h4>
  //                 </li>
  //               </div>
  //             </ul>
  //           </div>
  //         </div>
  //       </aside>
  //     </>
  //   );

  return (
    <>
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-1 w-80 h-screen pt-2 transition-transform transform -translate-x-full bg-gradient-to-b from-customGradientButtonStart sm:from-customGradientStart to-customGradientButtonEnd sm:to-customGradientEnd text-white border-r border-gray-200 sm:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 z-[1] w-[250px]" : " "
        }`}
        aria-label="Sidebar"
      >
        <div className="flex justify-end items-center w-[250px]">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white focus:outline-none"
            type="button"
          >
            {isSidebarOpen ? (
              <IoMdClose className="text-3xl" />
            ) : (
              <IoMdMenu className="text-[3xl]" />
            )}
          </button>
        </div>

        <div>
          <div className="flex py-6 px-4 text-white relative">
            <h1 className="text-xl font-bold uppercase">
              <img src={logo} alt="PPM" className="w-[150px]" />
            </h1>
          </div>

          <div className="h-full px-3 pb-2 overflow-y-auto text-white">
            <ul className="mt-1 ml-[-35px] space-y-2">
              {BusinessUnit === "DIGI" && dropdownOpen && (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "dashboard" ? "bg-[#fe9bf6] text-black" : ""
                  }`}
                >
                  <span>
                    <img
                      src={DashBoardImg}
                      className="w-[20px] relative right-[10px]"
                      alt=""
                    />
                  </span>

                  <div className="relative inline-block text-left">
                    <h4
                      className={`font-bold ${
                        MenuItem === "dashboard" ? "text-white" : "text-white"
                      }`}
                      onClick={gotohome}
                    >
                      Dashboard
                      {BusinessUnit === "DIGI" && (
                        <i
                          className="pl-2 text-[15px] text-xs fas fa-chevron-down"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                      )}
                    </h4>

                    {BusinessUnit === "DIGI" && dropdownOpen && (
                      <ul className="relative w-full list-disc mt-2 rounded-md z-10 pl-5 pr-5 p-2 right-6">
                        <li
                          className="text-pink-600 w-full text-[16px]"
                          onClick={gotoPlayersComparePage}
                        >
                          Players Compare
                        </li>

                        <li
                          className="text-pink-600 w-full text-[16px]"
                          onClick={gotoTeamWiseStats}
                        >
                          TeamWise Stats
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}

              <li
                className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                  MenuItem === "weekly" ? "bg-[#fe9bf6]   text-black" : ""
                }`}
              >
                <span className="w-[22px] relative right-[7px]">
                  <MdOutlineLeaderboard />
                </span>

                <h4
                  className={`font-bold ${
                    MenuItem === "weekly" ? "text-white" : "text-white"
                  }`}
                  onClick={handleNavigateWeeklyLeaderboard}
                >
                  MPL Dashboard
                </h4>
              </li>

              {BusinessUnit === "DIGI" && dropdownOpen && (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "TeamWise" ? "bg-[#fe9bf6]   text-black" : ""
                  }`}
                >
                  <span>
                    <img
                      src={Reports}
                      className="w-[20px] relative right-[10px]"
                      alt=""
                    />
                  </span>

                  <h4
                    className={`font-bold ${
                      MenuItem === "TeamWise" ? "text-white" : "text-white"
                    }`}
                    onClick={gotoTeamWiseStats}
                  >
                    TeamWise Stats
                  </h4>
                </li>
              )}

              {/*
              {userType === "Admin" ? (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "liveUsers" ? "bg-[#fe9bf6] text-black" : ""
                  }`}
                >
                  <span className="w-[20px] relative right-[7px]">
                    <FaUsers />
                  </span>

                  <h4
                    className={`font-bold ${
                      MenuItem === "liveUsers" ? "text-white" : "text-white"
                    }`}
                    onClick={gotoUsersPage}
                  >
                    RealTime Overview
                  </h4>
                </li>
              ) : ""}
            */}

              <li
                className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                  MenuItem === "reports" ? "bg-[#fe9bf6]   text-black" : ""
                }`}
              >
                <span>
                  <img
                    src={Reports}
                    className="w-[20px] relative right-[10px]"
                    alt=""
                  />
                </span>

                <h4
                  className={`font-bold ${
                    MenuItem === "reports" ? "text-white" : "text-white"
                  }`}
                  onClick={gotoReports}
                >
                  Reports
                </h4>
              </li>

              {/* Only addition: User Management */}
              <li
                className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                  MenuItem === "userManagement" ? "bg-[#fe9bf6] text-black" : ""
                }`}
              >
                <span className="w-[20px] relative right-[7px]">
                  <FaUsers />
                </span>

                <h4
                  className="font-bold text-white"
                  onClick={gotoUserManagement}
                >
                  User Management
                </h4>
              </li>

              <li
                className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                  MenuItem === "matchSummary" ? "bg-[#fe9bf6]   text-black" : ""
                }`}
              >
                <span className="w-[22px] relative right-[7px]">
                  <FaWpforms />
                </span>

                <h4
                  className={`font-bold ${
                    MenuItem === "matchSummary" ? "text-white" : "text-white"
                  }`}
                  onClick={handleNavigateMatchSummary}
                >
                  Match Schedule
                </h4>
              </li>

              <li
                className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                  MenuItem === "playersData" ? "bg-[#fe9bf6]   text-black" : ""
                }`}
              >
                <span className="w-[22px] relative right-[7px]">
                  <FaWpforms />
                </span>

                <h4
                  className={`font-bold ${
                    MenuItem === "playersData" ? "text-white" : "text-white"
                  }`}
                  onClick={handleNavigatePlayersData}
                >
                  All Players
                </h4>
              </li>

              <li
                className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                  MenuItem === "insights" ? "bg-[#fe9bf6]   text-black" : ""
                }`}
              >
                <span className="w-[22px] relative right-[7px]">
                  <FaWpforms />
                </span>

                <h4
                  className={`font-bold ${
                    MenuItem === "insights" ? "text-white" : "text-white"
                  }`}
                  onClick={goToInsightPage}
                >
                  Insights
                </h4>
              </li>

              {BusinessUnit === "DIGI" && (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "TimeSpent" ? "bg-[#fe9bf6]   text-black" : ""
                  }`}
                >
                  <span className="w-[22px] relative right-[7px]">
                    <FaWpforms />
                  </span>

                  <h4
                    className={`font-bold ${
                      MenuItem === "TimeSpent" ? "text-white" : "text-white"
                    }`}
                    onClick={handleNavigateTimeSpent}
                  >
                    TimeSpent
                  </h4>
                </li>
              )}

              {userType === "Admin" ? (
                ""
              ) : (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "approvals" ? "bg-[#fe9bf6]   text-black" : ""
                  }`}
                >
                  <span className="w-[20px] relative right-[7px]">
                    <FaWpforms />
                  </span>

                  <h4
                    className={`font-bold ${
                      MenuItem === "approvals" ? "text-white" : "text-white"
                    }`}
                    onClick={gotoApproval}
                  >
                    Approvals
                  </h4>
                </li>
              )}

              {BusinessUnit?.toLowerCase() !== "emcurecv" && (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "settings" ? "bg-[#fe9bf6] text-black" : ""
                  }`}
                >
                  <span className="w-[20px] relative right-[7px]">
                    <IoSettings />
                  </span>

                  <h4 className="font-bold text-white" onClick={gotoSettings}>
                    Spotlight
                  </h4>
                </li>
              )}

              {digiAdminId !== "DG1101" ? (
                ""
              ) : (
                <li
                  className={`relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white ${
                    MenuItem === "queryDetails"
                      ? "bg-[#fe9bf6]   text-black"
                      : ""
                  }`}
                >
                  <span className="w-[20px] relative right-[7px]">
                    <FaWpforms />
                  </span>

                  <h4
                    className={`font-bold ${
                      MenuItem === "queryDetails" ? "text-white" : "text-white"
                    }`}
                    onClick={goToQueryPage}
                  >
                    QueryDetails
                  </h4>
                </li>
              )}

              {/*
              {userType === "Admin" ? (
                <li className="relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 text-white">
                  <span className="w-[20px] relative right-[7px]">
                    <LiaUserEditSolid size={20} />
                  </span>
                  <h4 className="font-bold">Edit</h4>
                </li>
              ) : ""}
            */}

              <div className="justify-center">
                <li className="relative flex cursor-pointer space-x-2 rounded-md py-3 px-10 mt-[4vh] text-white">
                  <span>
                    <img
                      src={Logout}
                      className="w-[20px] relative right-[10px]"
                      alt=""
                    />
                  </span>

                  <h4 className="font-bold" onClick={handleLogout}>
                    Logout
                  </h4>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );

};

export default Sidebar;
