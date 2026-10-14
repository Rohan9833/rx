import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import React from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { RotatingLines } from "react-loader-spinner";
import BackGroundImg from "../../assets/bg.png";
import "react-tabs/style/react-tabs.css";
import "./style.css";
import { useLocation, useNavigate } from "react-router-dom";

const LiveUserCount = () => {
  const pageName = "RealTime Overview";
  const location = useLocation();
   const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState(location?.state?.data || "");

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value);
  };

  const handleFromDateChange = (e: any) => setFromDate(e.target.value);
  const handleToDateChange = (e: any) => setToDate(e.target.value);

  const removeFilter = () => {
    setFromDate(""); // Clear start date
    setToDate(""); // Clear end date
    window.location.reload(); // Reload the page
  };

  const handleLast30min = () => {
    setValue("last30min");
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleLast1hrs = () => {
    setValue("last1hour");
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleLast2hrs = () => {
    setValue("last2hour");
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleLast4hrs = () => {
    setValue("last4hour");
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleLive = () => {
    setValue("");
    navigate(location.pathname, { replace: true, state: {} });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:7501/api/getUserCountLiveAccordingToTime`
        );
        const { last30Minutes, last1Hour, last2Hours, last4Hours, LiveUser } = res.data;
        setLoading(false);
        if (value === "last30min") {
          const combinedArray = [...last30Minutes];
          setUsers(combinedArray);
        } else if (value === "last1hour") {
          const combinedArray = [...last1Hour];
          setUsers(combinedArray);
        } else if (value === "last2hour") {
          const combinedArray = [...last2Hours];
          setUsers(combinedArray);
        } else if (value === "last4hour") {
          const combinedArray = [...last4Hours];
          setUsers(combinedArray);
        } else {
          if (LiveUser !== 0) {
            setUsers(last30Minutes.slice(-LiveUser));
          } else {
            setUsers([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, [value]);

  return (
    <div>
      <Sidebar isSidebarOpen={undefined} toggleSidebar={undefined} />
      <div
        className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[100vh] sm:overflow-hidden"
        style={{
          borderTopLeftRadius: "80px",
        }}
      >
        <div className="h-[100px]  mb-[-20px]">
          <Header pageName={pageName} />
        </div>

        <div className="w-full h-auto ">
          <div
            style={{
              backgroundImage: `url(${BackGroundImg})`,
              backgroundBlendMode: "overlay",
            }}
            className="border-pink-500 border-2 bg-cover bg-no-repeat mx-auto max-w-screen h-[90vh] sm:w-[80vw] relative sm:left-[10px] sm:bottom-5"
          >
            <div className="overflow-y-auto max-h-screen sm:w-full w-full shadow-md">
              <div className="overflow-y-auto max-h-screen sm:w-full w-full shadow-md overflow-hidden">
                <div className="overflow-x-auto ">
                  <Tabs>
                    <TabList className="flex ">
                      <Tab
                        onClick={handleLive}
                        className={`flex-1 select-none text-center py-1 focus:outline-none cursor-pointer ${
                          value === "" ? "border-b-2 border-pink-500" : ""
                        }`}
                      >
                        Live
                      </Tab>
                      <Tab
                        onClick={handleLast30min}
                        className={`flex-1 select-none text-center py-1 focus:outline-none cursor-pointer ${
                          value === "last30min" ? "border-b-2 border-pink-500" : ""
                        }`}
                      >
                        last 30 min
                      </Tab>
                      <Tab
                        onClick={handleLast1hrs}
                        className={`flex-1 select-none text-center py-1 focus:outline-none cursor-pointer ${
                          value === "last1hour" ? "border-b-2 border-pink-500" : ""
                        }`}>
                        last 1hrs
                      </Tab>
                      <Tab
                        onClick={handleLast2hrs}
                        className={`flex-1 select-none text-center py-1 focus:outline-none cursor-pointer ${
                          value === "last2hour" ? "border-b-2 border-pink-500" : ""
                        }`}
                      >
                        last 2hrs
                      </Tab>
                      <Tab
                        onClick={handleLast4hrs}
                        className={`flex-1 select-none text-center py-1 focus:outline-none cursor-pointer ${
                          value === "last4hour" ? "border-b-2 border-pink-500" : ""
                        }`}
                      >
                        last 4hrs
                      </Tab>
                    </TabList>

                    <TabPanel>
                      {loading ? (
                        <h1 className="text-center text-7xl m-32">
                          <div
                            role="status"
                            className="flex justify-center align-center"
                          >
                            {/* <h1>Loading...</h1> */}
                            <RotatingLines
                              visible={true}
                              height="56"
                              width="56"
                              strokeColor="grey"
                              strokeWidth="5"
                              animationDuration="0.75"
                              ariaLabel="rotating-lines-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          </div>
                        </h1>
                      ) : (
                        <div className="overflow-hidden">
                          {/* <div className="flex justify-end">
                            <button
                              type="button"
                              // onClick={exportToExcel2}
                              className="text-white m-8 focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                            >
                              Download Excel
                            </button>
                          </div> */}
                          {/* {uniqueId === "D11700" ? (
                          <div className="flex justify-center items-center flex-row">
                            <div class="w-60 p-6 m-4 bg-blue-100  sm:w-62 rounded-lg shadow-md mx-auto text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalBillSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-green-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalEventPhotoSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-orange-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalBillSizeAdmin)}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-purple-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalEventPhotoSizeAdmin)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          ""
                        )} */}
                          {/* <div className="flex justify-end items-center gap-4 mt-4">
                              <div className="w-full max-w-md">
                                <input
                                  type="text"
                                  value={search}
                                  placeholder="Search SpeakerName,SCCode, Venue & Place"
                                  onChange={handleSearchChange}
                                  className="w-full px-4 py-2 border-2 rounded-full transition-all duration-300"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="from-date"
                                  className="block text-sm font-bold"
                                >
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  id="from-date"
                                  value={fromDate}
                                  onChange={handleFromDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="to-date"
                                  className="block text-sm font-bold"
                                >
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  id="to-date"
                                  value={toDate}
                                  onChange={handleToDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-1" title="Clear Filter">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="bi bi-arrow-clockwise w-8 h-8"
                                  style={{ color: "gray", cursor: "pointer" }}
                                  onClick={removeFilter}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  //   onClick={exportToExcel}
                                  className="text-white focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                                >
                                  Download Excel
                                </button>
                              </div>
                            </div> */}
                          <div className="sm:-mx-8 px-2 pl-0 sm:px-8 py-0 overflow-auto ">
                            <div className="2xl:h-[75vh] inline-block min-w-full shadow rounded-lg">
                              <table
                                className="min-w-full leading-normal"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Sr.No
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRID
                                    </th>
                                    <th className="px-[120px] py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TeamName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UserType
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      HQ
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Region
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Zone
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TimeOfLive
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DateOfLive
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {users.reverse().map((item, index) => (
                                    <tr
                                      key={index}
                                      className="border bg-pink-200 even:bg-pink-100"
                                    >
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {users.length - index}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRID}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TeamName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.userType}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.HQ}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Region}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Zone}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TimeOfLive}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.DateOfLive}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabPanel>

                    <TabPanel>
                      {loading ? (
                        <h1 className="text-center text-7xl m-32">
                          <div
                            role="status"
                            className="flex justify-center align-center"
                          >
                            {/* <h1>Loading...</h1> */}
                            <RotatingLines
                              visible={true}
                              height="56"
                              width="56"
                              strokeColor="grey"
                              strokeWidth="5"
                              animationDuration="0.75"
                              ariaLabel="rotating-lines-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          </div>
                        </h1>
                      ) : (
                        <div className="overflow-hidden">
                          {/* <div className="flex justify-end">
                            <button
                              type="button"
                              // onClick={exportToExcel2}
                              className="text-white m-8 focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                            >
                              Download Excel
                            </button>
                          </div> */}
                          {/* {uniqueId === "D11700" ? (
                          <div className="flex justify-center items-center flex-row">
                            <div class="w-60 p-6 m-4 bg-blue-100  sm:w-62 rounded-lg shadow-md mx-auto text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalBillSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-green-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalEventPhotoSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-orange-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalBillSizeAdmin)}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-purple-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalEventPhotoSizeAdmin)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          ""
                        )} */}
                          {/* <div className="flex justify-end items-center gap-4 mt-4">
                              <div className="w-full max-w-md">
                                <input
                                  type="text"
                                  value={search}
                                  placeholder="Search SpeakerName,SCCode, Venue & Place"
                                  onChange={handleSearchChange}
                                  className="w-full px-4 py-2 border-2 rounded-full transition-all duration-300"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="from-date"
                                  className="block text-sm font-bold"
                                >
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  id="from-date"
                                  value={fromDate}
                                  onChange={handleFromDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="to-date"
                                  className="block text-sm font-bold"
                                >
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  id="to-date"
                                  value={toDate}
                                  onChange={handleToDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-1" title="Clear Filter">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="bi bi-arrow-clockwise w-8 h-8"
                                  style={{ color: "gray", cursor: "pointer" }}
                                  onClick={removeFilter}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  //   onClick={exportToExcel}
                                  className="text-white focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                                >
                                  Download Excel
                                </button>
                              </div>
                            </div> */}
                          <div className="sm:-mx-8 px-2 pl-0 sm:px-8 py-0 overflow-auto  h-[85vh]">
                            <div className="2xl:h-[75vh] inline-block min-w-full shadow rounded-lg">
                              <table
                                className="min-w-full leading-normal"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Sr.No
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRID
                                    </th>
                                    <th className="px-[120px] py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TeamName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UserType
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      HQ
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Region
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Zone
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TimeOfLive
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DateOfLive
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {users.reverse().map((item, index) => (
                                    <tr
                                      key={index}
                                      className="border bg-pink-200 even:bg-pink-100"
                                    >
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {users.length - index}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRID}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TeamName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.userType}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.HQ}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Region}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Zone}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TimeOfLive}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.DateOfLive}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabPanel>

                    <TabPanel>
                      {loading ? (
                        <h1 className="text-center text-7xl m-32">
                          <div
                            role="status"
                            className="flex justify-center align-center"
                          >
                            {/* <h1>Loading...</h1> */}
                            <RotatingLines
                              visible={true}
                              height="56"
                              width="56"
                              strokeColor="grey"
                              strokeWidth="5"
                              animationDuration="0.75"
                              ariaLabel="rotating-lines-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          </div>
                        </h1>
                      ) : (
                        <div className="overflow-hidden">
                          {/* <div className="flex justify-end">
                            <button
                              type="button"
                              // onClick={exportToExcel2}
                              className="text-white m-8 focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                            >
                              Download Excel
                            </button>
                          </div> */}
                          {/* {uniqueId === "D11700" ? (
                          <div className="flex justify-center items-center flex-row">
                            <div class="w-60 p-6 m-4 bg-blue-100  sm:w-62 rounded-lg shadow-md mx-auto text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalBillSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-green-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalEventPhotoSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-orange-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalBillSizeAdmin)}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-purple-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalEventPhotoSizeAdmin)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          ""
                        )} */}
                          {/* <div className="flex justify-end items-center gap-4 mt-4">
                              <div className="w-full max-w-md">
                                <input
                                  type="text"
                                  value={search}
                                  placeholder="Search SpeakerName,SCCode, Venue & Place"
                                  onChange={handleSearchChange}
                                  className="w-full px-4 py-2 border-2 rounded-full transition-all duration-300"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="from-date"
                                  className="block text-sm font-bold"
                                >
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  id="from-date"
                                  value={fromDate}
                                  onChange={handleFromDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="to-date"
                                  className="block text-sm font-bold"
                                >
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  id="to-date"
                                  value={toDate}
                                  onChange={handleToDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-1" title="Clear Filter">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="bi bi-arrow-clockwise w-8 h-8"
                                  style={{ color: "gray", cursor: "pointer" }}
                                  onClick={removeFilter}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  //   onClick={exportToExcel}
                                  className="text-white focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                                >
                                  Download Excel
                                </button>
                              </div>
                            </div> */}
                          <div className="sm:-mx-8 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                            <div className="2xl:h-[75vh] inline-block min-w-full shadow rounded-lg">
                              <table
                                className="min-w-full leading-normal"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Sr.No
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRID
                                    </th>
                                    <th className="px-[120px] py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TeamName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UserType
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      HQ
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Region
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Zone
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TimeOfLive
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DateOfLive
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {users.reverse().map((item, index) => (
                                    <tr
                                      key={index}
                                      className="border bg-pink-200 even:bg-pink-100"
                                    >
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {users.length - index}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRID}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TeamName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.userType}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.HQ}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Region}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Zone}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TimeOfLive}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.DateOfLive}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabPanel>

                    <TabPanel>
                      {loading ? (
                        <h1 className="text-center text-7xl m-32">
                          <div
                            role="status"
                            className="flex justify-center align-center"
                          >
                            {/* <h1>Loading...</h1> */}
                            <RotatingLines
                              visible={true}
                              height="56"
                              width="56"
                              strokeColor="grey"
                              strokeWidth="5"
                              animationDuration="0.75"
                              ariaLabel="rotating-lines-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          </div>
                        </h1>
                      ) : (
                        <div className="overflow-hidden">
                          {/* <div className="flex justify-end">
                            <button
                              type="button"
                              // onClick={exportToExcel2}
                              className="text-white m-8 focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                            >
                              Download Excel
                            </button>
                          </div> */}
                          {/* {uniqueId === "D11700" ? (
                          <div className="flex justify-center items-center flex-row">
                            <div class="w-60 p-6 m-4 bg-blue-100  sm:w-62 rounded-lg shadow-md mx-auto text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalBillSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-green-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalEventPhotoSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-orange-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalBillSizeAdmin)}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-purple-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalEventPhotoSizeAdmin)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          ""
                        )} */}
                          {/* <div className="flex justify-end items-center gap-4 mt-4">
                              <div className="w-full max-w-md">
                                <input
                                  type="text"
                                  value={search}
                                  placeholder="Search SpeakerName,SCCode, Venue & Place"
                                  onChange={handleSearchChange}
                                  className="w-full px-4 py-2 border-2 rounded-full transition-all duration-300"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="from-date"
                                  className="block text-sm font-bold"
                                >
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  id="from-date"
                                  value={fromDate}
                                  onChange={handleFromDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="to-date"
                                  className="block text-sm font-bold"
                                >
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  id="to-date"
                                  value={toDate}
                                  onChange={handleToDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-1" title="Clear Filter">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="bi bi-arrow-clockwise w-8 h-8"
                                  style={{ color: "gray", cursor: "pointer" }}
                                  onClick={removeFilter}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  //   onClick={exportToExcel}
                                  className="text-white focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                                >
                                  Download Excel
                                </button>
                              </div>
                            </div> */}
                          <div className="sm:-mx-8 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                            <div className="2xl:h-[75vh] inline-block min-w-full shadow rounded-lg">
                              <table
                                className="min-w-full leading-normal"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Sr.No
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRID
                                    </th>
                                    <th className="px-[120px] py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TeamName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UserType
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      HQ
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Region
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Zone
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TimeOfLive
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DateOfLive
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {users.reverse().map((item, index) => (
                                    <tr
                                      key={index}
                                      className="border bg-pink-200 even:bg-pink-100"
                                    >
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {users.length - index}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRID}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TeamName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.userType}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.HQ}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Region}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Zone}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TimeOfLive}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.DateOfLive}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabPanel>

                    <TabPanel>
                      {loading ? (
                        <h1 className="text-center text-7xl m-32">
                          <div
                            role="status"
                            className="flex justify-center align-center"
                          >
                            {/* <h1>Loading...</h1> */}
                            <RotatingLines
                              visible={true}
                              height="56"
                              width="56"
                              strokeColor="grey"
                              strokeWidth="5"
                              animationDuration="0.75"
                              ariaLabel="rotating-lines-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                            />
                          </div>
                        </h1>
                      ) : (
                        <div className="overflow-hidden">
                          {/* <div className="flex justify-end">
                            <button
                              type="button"
                              // onClick={exportToExcel2}
                              className="text-white m-8 focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                            >
                              Download Excel
                            </button>
                          </div> */}
                          {/* {uniqueId === "D11700" ? (
                          <div className="flex justify-center items-center flex-row">
                            <div class="w-60 p-6 m-4 bg-blue-100  sm:w-62 rounded-lg shadow-md mx-auto text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalBillSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-green-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total FLM EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {totalEventPhotoSizeFlm}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-orange-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin Bill Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalBillSizeAdmin)}
                              </p>
                            </div>
                            <div class="w-60 p-6 m-4 bg-purple-100  sm:w-62 mx-auto shadow-md rounded-lg text-center">
                              <h1 class="sm:text-[13px] text-sm font-medium">
                                Total Admin EventPhoto Size(MB)
                              </h1>
                              <p class="text-xl font-bold">
                                {bytesToMB(totalEventPhotoSizeAdmin)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          ""
                        )} */}
                          {/* <div className="flex justify-end items-center gap-4 mt-4">
                              <div className="w-full max-w-md">
                                <input
                                  type="text"
                                  value={search}
                                  placeholder="Search SpeakerName,SCCode, Venue & Place"
                                  onChange={handleSearchChange}
                                  className="w-full px-4 py-2 border-2 rounded-full transition-all duration-300"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="from-date"
                                  className="block text-sm font-bold"
                                >
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  id="from-date"
                                  value={fromDate}
                                  onChange={handleFromDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-4 mb-4">
                                <label
                                  htmlFor="to-date"
                                  className="block text-sm font-bold"
                                >
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  id="to-date"
                                  value={toDate}
                                  onChange={handleToDateChange}
                                  className="mt-1 block w-[10vw] pr-4 py-1 text-base border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md"
                                />
                              </div>
                              <div className="mr-1" title="Clear Filter">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="bi bi-arrow-clockwise w-8 h-8"
                                  style={{ color: "gray", cursor: "pointer" }}
                                  onClick={removeFilter}
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  //   onClick={exportToExcel}
                                  className="text-white focus:ring-4 bg-orange-600 font-medium rounded-full text-sm px-5 py-2.5 me-2  focus:outline-none "
                                >
                                  Download Excel
                                </button>
                              </div>
                            </div> */}
                          <div className="sm:-mx-8 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                            <div className="2xl:h-[75vh] inline-block min-w-full shadow rounded-lg">
                              <table
                                className="min-w-full leading-normal"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Sr.No
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRID
                                    </th>
                                    <th className="px-[120px] py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TeamName
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UserType
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      HQ
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Region
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Zone
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TimeOfLive
                                    </th>
                                    <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DateOfLive
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {users.reverse().map((item, index) => (
                                    <tr
                                      key={index}
                                      className="border bg-pink-200 even:bg-pink-100"
                                    >
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {users.length - index}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRID}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                        {item.MRName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TeamName}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.userType}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.HQ}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Region}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.Zone}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.TimeOfLive}
                                      </td>
                                      <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                        {item.DateOfLive}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabPanel>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUserCount;
