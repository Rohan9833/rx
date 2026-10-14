import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackGroundImg from "../../assets/bg.png";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import { io } from "socket.io-client";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

const ReplyPage = () => {
  const pageName = "QueryDetails";
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [queryData, setQueryData] = useState([]);
  const [caseDetails, setCaseDetails] = useState({});
  const [messageValue, setMessageValue] = useState("");

  const [selectedCase, setSelectedCase] = useState("");

  const Id = sessionStorage.getItem("UserId");

  const { id: userId } = useParams();

  const [searchQuery, setSearchQuery] = useState("");
  const socketServerURL = "http://localhost:7501";

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
    date.setHours(0, 0, 0, 0); // Normalize the date to midnight
    return date;
  };

  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => setToDate(e.target.value);

  // const filteredData = queryData
  //   .filter((item) => {
  //     const isSearchMatch =
  //       !searchQuery ||
  //       item?.MrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       item?.FlmName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       item?.SlmName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       item?.TlmName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       item?.Mobile?.toLowerCase().includes(searchQuery.toLowerCase());

  //     const parsedCreationDate = parseDate(item.DateOfCreation);
  //     const from = fromDate ? new Date(fromDate) : null;
  //     const to = toDate ? new Date(toDate) : null;
  //     if (from) from.setHours(0, 0, 0, 0); // Start of the day
  //     if (to) to.setHours(23, 59, 59, 999); // End of the day
  //     const isWithinDateRange =
  //       (!from || parsedCreationDate >= from) &&
  //       (!to || parsedCreationDate <= to);

  //     const isUnread = item.isRead === false;

  //     return isWithinDateRange && isSearchMatch && isUnread;
  //   })
  //   .sort((a, b) => {
  //     // Convert dd-mm-yyyy to Date for sorting
  //     const parseDate = (dateStr) => {
  //       const [day, month, year] = dateStr.split("-").map(Number);
  //       return new Date(year, month - 1, day); // Month is zero-based in JS Dates
  //     };

  //     // Prioritize unread items
  //     if (a.isRead === false && b.isRead !== false) return -1;
  //     if (a.isRead !== false && b.isRead === false) return 1;

  //     // If both are unread or both are read, sort by ModifiedDate (latest first)
  //     return parseDate(b.ModifiedDate) - parseDate(a.ModifiedDate);
  //   });
  const filteredData = queryData
    .filter((item) => {
      const lowerCaseSearchQuery = searchQuery?.toLowerCase() || "";

      // Ensure all values are strings before calling `toLowerCase()`
      const isSearchMatch =
        !searchQuery ||
        item?.MrName?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.FlmName?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.SlmName?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.TlmName?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.Mobile?.toLowerCase()?.includes(lowerCaseSearchQuery) ||
        item?.caseNo?.toLowerCase()?.includes(lowerCaseSearchQuery);

      const parsedCreationDate = parseDate(item.DateOfCreation);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from) from.setHours(0, 0, 0, 0); // Start of the day
      if (to) to.setHours(23, 59, 59, 999); // End of the day
      const isWithinDateRange =
        (!from || parsedCreationDate >= from) &&
        (!to || parsedCreationDate <= to);

      return isWithinDateRange && isSearchMatch;
    })
    .sort((a, b) => {
      // Convert dd-mm-yyyy to Date for sorting
      const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day); // Month is zero-based in JS Dates
      };

      // Prioritize unread items
      if (a.isRead === false && b.isRead !== false) return -1;
      if (a.isRead !== false && b.isRead === false) return 1;

      // If both are unread or both are read, sort by ModifiedDate (latest first)
      return parseDate(b.ModifiedDate) - parseDate(a.ModifiedDate);
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
          `http://localhost:7501/api/getAllQueryByAdmin/${userId}`
        );

        setQueryData(response.data.data);

        setLoading(false);
        const socket = io("http://localhost:7501");

        socket.on("AllqueryData", (data) => {
          setQueryData(data);
        });

        // Cleanup on component unmount
        return () => {
          socket.disconnect();
        };
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:7501");

    socket.on("queryReply_Updated_Admin", (data) => {
      setCaseDetails(data);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const exportToExcel = () => {
    const today = new Date();
    const formattedToday = `${today.getDate().toString().padStart(2, "0")}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${today.getFullYear()}`;
    const data = filteredData.map((item, index) => ({
      SrNo: filteredData.length - index,
      StartDate: item.startDate,
      EndDate: item.endDate,
      TeamA: item.teamA,
      TeamB: item.teamB,
      MatchType: item?.isTournament === true ? "Admin" : item.creatorRole,
      Cretor: item.creatorRole,
      TeamAScore: item?.MatchResult[0]?.teamAScore || "0",
      TeamBScore: item?.MatchResult[0]?.teamBScore || "0",
      MatchResult:
        formattedToday === item.startDate
          ? "Match is Live"
          : new Date(item.startDate.split("-").reverse().join("-")) > today // Convert `match.startDate` to a Date object for comparison
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
          : "Draw",
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "MatchData");
    XLSX.writeFile(workbook, "MatchReport.xlsx");
  };

  const handleGetCaseNo = async (cNo) => {
    const id = cNo.substring(1);
    const response = await axios.get(
      `http://localhost:7501/api/getQueryByCaseNo/${id}`
    );
    setSelectedCase(cNo);
    setCaseDetails(response.data.data);
  };

  const handleGetMsg = async (e) => {
    e.preventDefault();
    setMessageValue(e.target.value);
  };

  const handleSendMessage = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:7501/api/queryReplyAdmin/${userId}`,
        {
          caseNo: caseDetails?.caseNo,
          replyText: messageValue,
        }
      );
      await axios.patch(
        `http://localhost:7501/api/updateReadStatus/${userId}`,
        { caseNo: caseDetails?.caseNo }
      );
      toast.success("Message sent successfully");
      setMessageValue("");
    } catch (error) {
      console.log(error);
    }
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

          <div className="w-full h-auto">
            <div
              style={{
                backgroundImage: `url(${BackGroundImg})`,
                backgroundBlendMode: "overlay",
              }}
              className="border-pink-500 border-2 bg-cover bg-no-repeat mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px] sm:bottom-5"
            >
              <div className="overflow-y-auto max-h-screen sm:w-full w-full rounded-2xl shadow-md">
                <div className="overflow-x-auto">
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
                      {/* <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2">
                        <div className="flex justify-center items-center gap-2"></div>
                        <div className="flex justify-center items-center">
                          <div className="flex justify-center items-center sm:ml-16 ">
                            <label
                              htmlFor="from-date"
                              className="block mt-2 text-xs sm:text-base font-bold text-center"
                            >
                              From
                            </label>
                            <input
                              type="date"
                              id="from-date"
                              value={fromDate}
                              onChange={handleFromDateChange}
                              className="mt-1 sm:h-[5vh] block w-[20vw] sm:w-[10vw] px-2 py-1 text-xs border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-center items-center ml-2">
                            <label
                              htmlFor="to-date"
                              className="mt-2 block text-xs sm:text-base font-bold text-center"
                            >
                              To
                            </label>
                            <input
                              type="date"
                              id="to-date"
                              value={toDate}
                              onChange={handleToDateChange}
                              className="mt-1 sm:h-[5vh] block w-[20vw] sm:w-[10vw] px-2 py-1 text-xs border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md cursor-pointer"
                            />
                            <div
                              className="ml-2 mt-2 sm:mt-0"
                              title="Clear Filter"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="bi bi-arrow-clockwise w-6 sm:w-8 h-6 sm:h-8"
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
                          </div>
                          <div className="sm:hidden w-20 visible flex justify-center items-center">
                            <button
                              type="button"
                              onClick={exportToExcel}
                              className="text-white px-2  focus:ring-4 bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd font-medium rounded-full text-[10px] sm:text-sm py-2 sm:mr-16 sm:py-2 focus:outline-none border-2"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                        <div className="sm:visible hidden sm:flex sm:justify-center sm:items-center mr-4">
                          <button
                            type="button"
                            onClick={exportToExcel}
                            className="text-white  focus:ring-4 bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd font-medium rounded-full text-xs sm:text-sm px-3 py-2 m-2 sm:mr-16 sm:px-5 sm:py-2 focus:outline-none border-2"
                          >
                            Download Excel
                          </button>
                        </div>
                      </div> */}
                      <div className="sm:-mx-8 mt-0 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                        <div className="sm:h-[85vh] inline-block min-w-full shadow rounded-lg sm:flex">
                          <div className="border-pink-400 sm:w-[20%] sm:h-[85vh] border-1 overflow-auto border-b-2">
                            <div className="flex justify-center items-center">
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search Name,CaseNo & Mobile"
                                className="sm:ml-5 px-2 py-1 mt-2 mb-2 w-[210px] border-2 border-gray-500 text-sm sm:text-base"
                              />
                            </div>
                            {filteredData.map((item, index) => {
                              return (
                                <div
                                  onClick={() => handleGetCaseNo(item.caseNo)}
                                  key={index}
                                  className={`${
                                    selectedCase === item.caseNo
                                      ? "text-red-500"
                                      : "text-black"
                                  }  flex flex-col justify-start items-start ml-10  mb-4 cursor-pointer w-30 h-auto overflow-auto`}
                                >
                                  <div className="flex justify-between w-full pr-2">
                                    <p className="text-[10px]">
                                      {item?.caseNo}
                                    </p>
                                    <p className="text-[10px]">
                                      {item?.ModifiedDate}
                                    </p>
                                  </div>

                                  <div className="flex justify-between w-full pr-2">
                                  <p className="text-[10px]">
                                    {item?.MrName ||
                                      item?.FlmName ||
                                      item?.SlmName ||
                                      item?.TlmName}
                                  </p>
                                  <p className="">
                                    {item?.isRead ? (
                                      <IoCheckmarkDoneSharp color="blue" />
                                    ) : (
                                      <IoCheckmarkDoneSharp color="gray" />
                                    )}
                                  </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {Object.keys(caseDetails).length > 0 && (
                            <div className="sm:w-[78%] sm:h-[85vh] flex flex-col border-pink-400">
                              <div className="flex-1 overflow-auto p-2">
                                <>
                                  <div className="flex p-2 justify-between items-center gap-x-4 gap-y-1 bg-pink-200">
                                    <div className="flex flex-col gap-2">
                                      <p className="text-[12px]">
                                        MR Name:{" "}
                                        <span className="font-bold">
                                          {caseDetails.MrName || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Flm Name:{" "}
                                        <span className="font-bold">
                                          {caseDetails.FlmName || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Slm Name:{" "}
                                        <span className="font-bold">
                                          {caseDetails.SlmName || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Tlm Name:{" "}
                                        <span className="font-bold">
                                          {caseDetails.TlmName || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Date Of Query:{" "}
                                        <span className="font-bold">
                                          {caseDetails.DateOfCreation || "-"}
                                        </span>
                                      </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <p className="text-[12px]">
                                        Mr HQ:{" "}
                                        <span className="font-bold">
                                          {caseDetails.HQ || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Flm HQ:{" "}
                                        <span className="font-bold">
                                          {caseDetails.FlmHQ || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Slm HQ:{" "}
                                        <span className="font-bold">
                                          {caseDetails.SlmHQ || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Tlm HQ:{" "}
                                        <span className="font-bold">
                                          {caseDetails.TlmHQ || "-"}
                                        </span>
                                      </p>
                                      <p className="text-[12px]">
                                        Mobile:{" "}
                                        <span className="font-bold">
                                          {caseDetails.Mobile || "-"}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col w-full p-2">
                                    {Array.from({
                                      length: Math.max(
                                        caseDetails?.Query?.length || 0,
                                        caseDetails?.Reply?.length || 0
                                      ),
                                    }).map((_, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-start w-full mb-2"
                                      >
                                        {/* Query (Left) */}
                                        {caseDetails?.Query?.[index] ? (
                                          <div className="bg-green-200 p-2 rounded-md">
                                            <p>{caseDetails.Query[index]}</p>
                                          </div>
                                        ) : (
                                          <div className="w-1/2"></div> // Empty space for alignment
                                        )}

                                        {/* Reply (Right) */}
                                        {caseDetails?.Reply?.[index] && (
                                          <div className="bg-blue-200 p-2 rounded-md ml-auto">
                                            <p>{caseDetails.Reply[index]}</p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              </div>

                              <div className="border-t border-pink-300 p-2 bg-white">
                                <div className="relative w-full sm:w-auto ml-1">
                                  <textarea
                                    value={messageValue}
                                    onChange={handleGetMsg}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                      }
                                    }}
                                    placeholder="Type a Message"
                                    className="px-4 py-2 w-full border-2 focus:outline-pink-400 border-pink-200 text-sm sm:text-base rounded-md pr-10 resize-none overflow-y-auto max-h-[150px] min-h-[60px]"
                                  />
                                  {messageValue && (
                                    <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer">
                                      <IoSend
                                        color="black"
                                        onClick={handleSendMessage}
                                      />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
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
    </>
  );
};

export default ReplyPage;
