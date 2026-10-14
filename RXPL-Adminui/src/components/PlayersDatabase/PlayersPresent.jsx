import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackGroundImg from "../../assets/bg.png";

const PlayersPresent = () => {
  const pageName = "All Players";
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [uploadData, setUploadData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [editData, setEditData] = useState({});

  const [userDetails, setUserDetails] = useState({
    userId: "",
    userName: "",
    HQ: "",
    Zone: "",
    Region: "",
    TeamName: "",
  });

  const BusinessUnit = sessionStorage.getItem("BusinessUnit");
  
  // ✅ Check if business unit is DIGI to show/hide columns
  const isDIGI = BusinessUnit === "DIGI";

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const [showMoreColumns, setShowMoreColumns] = useState(false);

  const handleToggleColumns = (index) => {
    setShowMoreColumns((prevIndex) => (prevIndex === index ? null : index));
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => setToDate(e.target.value);

  const filteredData = uploadData.filter((upload) => {
    const parsedCreationDate = parseDate(upload.startDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);
    const isWithinDateRange =
      (!from || parsedCreationDate >= from) &&
      (!to || parsedCreationDate <= to);

    return isWithinDateRange;
  });

  const removeFilter = () => {
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getAllUsersFromDatabase/${BusinessUnit}`
        );

        setUploadData(response?.data?.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const exportToExcel = () => {
    const today = new Date();
    const formattedToday = `${today.getDate().toString().padStart(2, "0")}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${today.getFullYear()}`;
    
    const data = filteredData.map((item, index) => {
      const baseData = {
        SrNo: filteredData.length - index,
        StartDate: item.startDate,
        EndDate: item.endDate,
        TeamA: item.teamA,
        TeamB: item.teamB,
        MatchType: item?.isTournament === true ? "Admin" : item.creatorRole,
        Cretor: item.creatorRole,
        TeamAScore: item?.MatchResult[0]?.teamAScore || "0",
        TeamBScore: item?.MatchResult[0]?.teamBScore || "0",
      };

      // Add DIGI-specific columns only if BusinessUnit is DIGI
      if (isDIGI) {
        baseData.MatchResult =
          formattedToday === item.startDate
            ? "Match is Live"
            : new Date(item.startDate.split("-").reverse().join("-")) > today
            ? "Upcoming Match"
            : item?.MatchResult[0]?.teamAScore || item?.MatchResult[0]?.teamBScore
            ? `${
                item?.MatchResult[0]?.Result === "Draw"
                  ? "Draw"
                  : `${item?.MatchResult[0]?.Result} won by ${Math.abs(
                      parseInt(item?.MatchResult[0]?.teamAScore || 0) -
                        parseInt(item?.MatchResult[0]?.teamBScore || 0)
                    )}`
              }`
            : "Draw";
      }

      return baseData;
    });
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "MatchData");
    XLSX.writeFile(workbook, "MatchReport.xlsx");
  };

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  const OpenModalForApproval = async (playerData) => {
    try {
      setShowModal(true);
      const response = await axios.get(
        `http://localhost:7501/api/getUserDataSingleUser/${playerData?._id}/${playerData?.Role}`
      );
      setEditData(response?.data?.User);
      setUserDetails({
        userId:
          response?.data?.User?.MRID ||
          response?.data?.User?.SLMEmpID ||
          response?.data?.User?.FLMEmpID ||
          response?.data?.User?.TLMEmpID,
        userName:
          response?.data?.User?.USERNAME ||
          response?.data?.User?.BDMName ||
          response?.data?.User?.SLMName ||
          response?.data?.User?.TLMName,
        HQ: response?.data?.User?.HQ,
        Region: response?.data?.User?.REGION,
        Zone: response?.data?.User?.ZONE,
        TeamName:
          response?.data?.User?.TEAMNAME || response?.data?.User?.TeamName,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submitApprovalReport = async (UserData) => {
    try {
      const res = await axios.put(
        `http://localhost:7501/api/updateUserDataSingleUser/${UserData?._id}/${UserData?.Role}`,
        {
          UserId: userDetails?.userId,
          Name: userDetails?.userName,
          HQ: userDetails?.HQ,
          Region: userDetails?.Region,
          Zone: userDetails?.Zone,
          TeamName: userDetails.TeamName,
        }
      );
      setTimeout(() => {
        window.location.reload();
      }, 1200);
      toast.success("User Updated Success", { duration: 2000 });
      setShowModal(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to Update UserData", { duration: 2000 });
    }
  };

  const handleTextField = (event) => {
    const { name, value } = event.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  return (
    <>
      <div className="grid grid-cols-2 absolute max-h-[120vh]">
        <Sidebar />

        <div
          className="sm:w-[85vw] w-[92vw] z-1 bg-white  absolute sm:left-[210px] left-[10px] h-[100vh] sm:overflow-hidden"
          style={{ borderRadius: "80px" }}
        >
          <div className="h-[100px] mb-[-20px]">
            <Header pageName={pageName} />
          </div>

          <div className="w-full h-auto ">
            <div
              style={{
                backgroundImage: `url(${BackGroundImg})`,
                backgroundBlendMode: "overlay",
              }}
              className="border-pink-500 border-2 bg-cover bg-no-repeat mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px] h-[90vh] sm:bottom-5"
            >
              <div className="overflow-y-auto max-h-screen sm:w-full w-full rounded-2xl shadow-md">
                <div className="overflow-x-auto">
                  {loading ? (
                    <h1 className="text-center text-7xl m-32">
                      <div
                        role="status"
                        className="flex justify-center align-center"
                      >
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
                      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2">
                        <div className="flex justify-center items-center gap-2">
                          {/* Commented out filters remain the same */}
                        </div>
                      </div>
                      <div className="sm:-mx-8 mt-2 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                        <div className="sm:h-[85vh] inline-block min-w-full shadow rounded-lg">
                          {/* DESKTOP TABLE */}
                          <table
                            className="min-w-full leading-normal hidden sm:block"
                            id="doctorTable"
                          >
                            <thead>
                              <tr>
                                <th className="px-6 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  SR.no
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  ID
                                </th>
                                <th className="px-40 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Role
                                </th>
                                <th className="px-20 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  HQ
                                </th>
                                <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  REGION
                                </th>
                                <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  ZONE
                                </th>
                                <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  TEAMNAME
                                </th>
                                
                                {/* CONDITIONAL: Only show DOC for DIGI */}
                                {isDIGI && (
                                  <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    DOC
                                  </th>
                                )}
                                
                                {/* CONDITIONAL: Only show ModifiedDate for DIGI */}
                                {isDIGI && (
                                  <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    ModifiedDate
                                  </th>
                                )}
                                
                                {/* CONDITIONAL: Only show Action for DIGI */}
                                {isDIGI && (
                                  <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Action
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {uploadData.map((player, index, arr) => {
                                const today = new Date();
                                const formattedToday = `${today
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")}-${(today.getMonth() + 1)
                                  .toString()
                                  .padStart(2, "0")}-${today.getFullYear()}`;

                                return (
                                  <tr
                                    key={index}
                                    className="border bg-pink-200 even:bg-pink-100"
                                  >
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {index + 1}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.MRID ||
                                        player.FLMEmpID ||
                                        player.SLMEmpID ||
                                        player.TLMEmpID ||
                                        "-"}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.USERNAME ||
                                        player.BDMName ||
                                        player.SLMName ||
                                        player.TLMName ||
                                        "-"}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.Role || "-"}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.HQ || "-"}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.REGION || "-"}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.ZONE || "-"}
                                    </td>
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {player.TEAMNAME ||
                                        player.TeamName ||
                                        "-"}
                                    </td>
                                    
                                    {/* CONDITIONAL: Only show DOC for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1 text-center text-sm text-black">
                                        {player.createdAt
                                          ? formatDateToDDMMYYYY(player.createdAt)
                                          : "-" || "-"}
                                      </td>
                                    )}
                                    
                                    {/* CONDITIONAL: Only show ModifiedDate for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1 text-center text-sm text-black">
                                        {player.updatedAt
                                          ? formatDateToDDMMYYYY(player.updatedAt)
                                          : "-" || "-"}
                                      </td>
                                    )}
                                    
                                    {/* CONDITIONAL: Only show Action for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1 text-center flex justify-center text-sm text-black">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          fill="currentColor"
                                          viewBox="0 0 16 16"
                                          onClick={() =>
                                            OpenModalForApproval(player)
                                          }
                                          className="cursor-pointer"
                                        >
                                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                          <path
                                            fillRule="evenodd"
                                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                          />
                                        </svg>
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* MOBILE TABLE */}
                          <table
                            className="min-w-full leading-normal sm:hidden text-xs"
                            id="doctorTable"
                          >
                            <thead>
                              <tr>
                                <th className="px-1 py-2 border-2 border-gray-500  text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                  SR.no
                                </th>
                                <th className="px-3 py-2 border-2 border-gray-500  text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                  Id
                                </th>
                                <th className="px-2 py-2 border-2 border-gray-500  text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                                  Role
                                </th>
                                <th className="px-2 py-2 border-2 border-gray-500  text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadData.map((player, index, arr) => (
                                <React.Fragment key={index}>
                                  <tr className="border bg-pink-200 even:bg-pink-100">
                                    <td className="px-1 py-1  text-left text-sm text-black">
                                      {index + 1}
                                    </td>
                                    <td className="px-2 py-1  text-left text-sm text-black">
                                      {player.MRID ||
                                        player.FLMEmpID ||
                                        player.SLMEmpID ||
                                        player.TLMEmpID ||
                                        "-"}
                                    </td>
                                    <td className="px-2 py-1  text-left text-sm text-black">
                                      {player.Role || "-"}
                                    </td>
                                    <td className="lg:hidden text-center border border-white px-1">
                                      <button
                                        className="text-blue-500 lg:hidden"
                                        onClick={() =>
                                          handleToggleColumns(index)
                                        }
                                      >
                                        {showMoreColumns === index ? (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-dash-circle"
                                            viewBox="0 0 16 16"
                                          >
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                            <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                                          </svg>
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-plus-circle"
                                            viewBox="0 0 16 16"
                                          >
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3H4.5a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                                          </svg>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                  {showMoreColumns === index && (
                                    <tr>
                                      <td
                                        colSpan={4}
                                        className=" px-1 py-2 text-[14px]"
                                      >
                                        <div className="flex flex-col gap-2">
                                          <div>
                                            <strong>Name:</strong>{" "}
                                            {player.USERNAME ||
                                              player.BDMName ||
                                              player.SLMName ||
                                              player.TLMName ||
                                              "-"}
                                          </div>
                                          <div>
                                            <strong>HQ:</strong>{" "}
                                            {player.HQ || "-"}
                                          </div>
                                          <div>
                                            <strong>Region:</strong>{" "}
                                            {player.REGION || "-"}
                                          </div>
                                          <div>
                                            <strong>Zone:</strong>{" "}
                                            {player.ZONE || "-"}
                                          </div>
                                          <div>
                                            <strong>TeamName:</strong>{" "}
                                            {player.TEAMNAME ||
                                              player.TeamName ||
                                              "-"}
                                          </div>
                                          
                                          {/* CONDITIONAL: Only show DOC for DIGI */}
                                          {isDIGI && (
                                            <div>
                                              <strong>CreatedAt:</strong>{" "}
                                              {player.createdAt
                                                ? formatDateToDDMMYYYY(
                                                    player.createdAt
                                                  )
                                                : "-" || "-"}
                                            </div>
                                          )}
                                          
                                          {/* CONDITIONAL: Only show ModifiedDate for DIGI */}
                                          {isDIGI && (
                                            <div>
                                              <strong>UpdatedAt:</strong>{" "}
                                              {player.updatedAt
                                                ? formatDateToDDMMYYYY(
                                                    player.updatedAt
                                                  )
                                                : "-" || "-"}
                                            </div>
                                          )}
                                          
                                          {/* CONDITIONAL: Only show Action for DIGI */}
                                          {isDIGI && (
                                            <div className="flex gap-2">
                                              <strong>Action:</strong>{" "}
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                fill="currentColor"
                                                viewBox="0 0 16 16"
                                                onClick={() =>
                                                  OpenModalForApproval(player)
                                                }
                                                className="cursor-pointer"
                                              >
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                <path
                                                  fillRule="evenodd"
                                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg text-center font-bold">Edit</h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="currentColor"
                className="bi bi-x cursor-pointer"
                viewBox="0 0 16 16"
                onClick={() => setShowModal(false)}
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
            </div>

            <div className="flex justify-center gap-10 mb-4">
              <div className="w-full">
                <label className="leading-loose text-black">
                  ID<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="userId"
                  onChange={handleTextField}
                  value={userDetails?.userId || ""}
                  className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                ></input>
              </div>
              <div className="w-full">
                <label className="leading-loose text-black">
                  Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  onChange={handleTextField}
                  value={userDetails?.userName || ""}
                  className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                ></input>
              </div>
            </div>

            <div className="flex justify-center gap-10 mb-4">
              <div className="w-full">
                <label className="leading-loose text-black">
                  HQ<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="HQ"
                  onChange={handleTextField}
                  value={userDetails?.HQ || ""}
                  className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                ></input>
              </div>

              {editData.Role === "TLM" ? (
                <div className="w-full">
                  <label className="leading-loose text-black">
                    Zone<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="Zone"
                    onChange={handleTextField}
                    value={userDetails?.Zone || ""}
                    className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                  ></input>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <div>
                      {editData.Role === "TLM" ? (
                        ""
                      ) : (
                        <>
                          <label className="leading-loose text-black">
                            Region<span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="Region"
                            onChange={handleTextField}
                            value={userDetails?.Region || ""}
                            className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                          ></input>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center gap-10 mb-4">
              {editData.Role === "TLM" ? (
                ""
              ) : (
                <div className="w-full">
                  <label className="leading-loose text-black">
                    Zone<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="Zone"
                    onChange={handleTextField}
                    value={userDetails?.Zone || ""}
                    className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                  ></input>
                </div>
              )}
              <div className="w-full">
                <label className="leading-loose text-black">
                  TeamName<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="TeamName"
                  onChange={handleTextField}
                  value={userDetails?.TeamName || ""}
                  className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
                ></input>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <button
                className={`px-4 py-2 mt-4 rounded text-white bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd`}
                onClick={() => submitApprovalReport(editData)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayersPresent;
