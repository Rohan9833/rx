import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackGroundImg from "../../assets/bg.png";

const UserScreenTime = () => {
  const pageName = "TimeSpent";
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [uploadData, setUploadData] = useState([]);

  const [usernameOptions, setUsernameOptions] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [hqOptions, setHqOptions] = useState([]);
  const [selectedHQ, setSelectedHQ] = useState("");
  const [selectedChallenger, setSelectedChallenger] = useState("");
  const [selectChallengerOption, setSelectChallengerOption] = useState([]);
  const [zoneOptions, setZONEOptions] = useState([]);
  const [selectedZONE, setSelectedZONE] = useState("");
  const [regionOptions, setRegionOptions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [teamNameOptions, setTeamNameOptions] = useState([]);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [specialityOptions, setSpecialityOptions] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [brandNameOptions, setBrandNameOptions] = useState([]);
  const [selectedBrandName, setSelectedBrandName] = useState("");
  const [pointsOptions, setPointsOptions] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState("");
  const [selectedPreviousTeam, setSelectedPrevTeam] = useState("");
  const [selectPreviousTeam, setSelectPreviousTeam] = useState([]);

  const [selectedOpponentTeam, setSelectedOppTeam] = useState("");
  const [selectOpponentTeam, setSelectOpponentTeam] = useState([]);

  const Id = sessionStorage.getItem("UserId");
  const BusinessUnit = sessionStorage.getItem("BusinessUnit")

  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredData = uploadData.flatMap((upload) => {
    const isUsernameMatch =
      !selectedUsername || upload.USERNAME === selectedUsername;
    const isHQMatch = !selectedHQ || upload.HQ === selectedHQ;
    const isZONEMatch = !selectedZONE || upload.ZONE === selectedZONE;
    const isRegionMatch = !selectedRegion || upload.REGION === selectedRegion;
    const isTeamNameMatch =
      !selectedTeamName || upload.TEAMNAME === selectedTeamName;

    if (
      !isUsernameMatch ||
      !isHQMatch ||
      !isZONEMatch ||
      !isRegionMatch ||
      !isTeamNameMatch
    ) {
      return [];
    }

    // const filteredChallenger = upload.UserTrackSummary.filter((data) => {
    //   const isRoleMatch =
    //     !selectedChallenger || data.role === selectedChallenger;

    //   // Strict team matching based on role
    //   const isPreviousTeamMatch =
    //     !selectedPreviousTeam ||
    //     (data.role === "Initiator" && selectedPreviousTeam === data.teamA) ||
    //     (data.role === "Acceptor" && selectedPreviousTeam === data.teamB);

    //   const isOpponentTeamMatch =
    //     !selectedOpponentTeam ||
    //     (data.role === "Initiator" && selectedOpponentTeam === data.teamB) ||
    //     (data.role === "Acceptor" && selectedOpponentTeam === data.teamA);

    //   return isRoleMatch && isPreviousTeamMatch && isOpponentTeamMatch;
    // });

    // if (!filteredChallenger.length) return [];

    // const filteredUploads = filteredChallenger.filter((data) => {
    //   const isDrNameMatch =
    //     !searchQuery ||
    //     data.DrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     data.ScCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //     upload.TEAMNAME?.toLowerCase().includes(searchQuery.toLowerCase());
    //   const isSpecialityMatch =
    //     !selectedSpeciality || data.Specility === selectedSpeciality;
    //   const isBrandNameMatch =
    //     !selectedBrandName || data.BrandName === selectedBrandName;
    //   const isPointsMatch = !selectedPoints || data.Points === selectedPoints;

    //   const parsedCreationDate = parseDate(data.DateOfCreation);

    //   const from = fromDate ? new Date(fromDate) : null;
    //   const to = toDate ? new Date(toDate) : null;

    //   if (from) from.setHours(0, 0, 0, 0); // Start of the day
    //   if (to) to.setHours(23, 59, 59, 999); // End of the day

    //   const isWithinDateRange =
    //     (!from || parsedCreationDate >= from) &&
    //     (!to || parsedCreationDate <= to);

    //   return (
    //     isSpecialityMatch &&
    //     isBrandNameMatch &&
    //     isDrNameMatch &&
    //     isWithinDateRange &&
    //     isPointsMatch
    //   );
    // });

    // return filteredUploads.length
    //   ? [{ ...upload, MRUploadedData: filteredUploads }]
    //   : [];
  });

  const removeFilter = () => {
    setFromDate("");
    setToDate("");
    setSelectedUsername("");
    setSelectedHQ("");
    setSelectedZONE("");
    setSelectedRegion("");
    setSelectedTeamName("");
    setSelectedSpeciality("");
    setSelectedBrandName("");
    setSelectedPoints("");
    setSearchQuery("");
    setSelectedChallenger("");
    setSelectedPrevTeam("");
    setSelectedOppTeam("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getUsersScreenTime/${Id}/${BusinessUnit}`
        );
        setUploadData(response?.data?.data);
        // const uniqueUsernames = [
        //   ...new Set(
        //     response.data.map((mr) => {
        //       if (mr.MRUploadedData.length > 0) {
        //         return mr.USERNAME;
        //       }
        //     })
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setUsernameOptions(uniqueUsernames);
        // const uniqueHQs = [
        //   ...new Set(
        //     response.data.map((mr) => {
        //       if (mr.MRUploadedData.length > 0) {
        //         return mr.HQ;
        //       }
        //     })
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setHqOptions(uniqueHQs);
        // const uniqueZones = [
        //   ...new Set(
        //     response.data.map((mr) => {
        //       if (mr.MRUploadedData.length > 0) {
        //         return mr.ZONE;
        //       }
        //     })
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setZONEOptions(uniqueZones);
        // const uniqueRegions = [
        //   ...new Set(
        //     response.data.map((mr) => {
        //       if (mr.MRUploadedData.length > 0) {
        //         return mr.REGION;
        //       }
        //     })
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setRegionOptions(uniqueRegions);
        // const uniqueTeamNames = [
        //   ...new Set(
        //     response.data.map((mr) => {
        //       if (mr.MRUploadedData.length > 0) {
        //         return mr.TEAMNAME;
        //       }
        //     })
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setTeamNameOptions(uniqueTeamNames);
        // const uniqueSpecialities = [
        //   ...new Set(
        //     response.data.flatMap((mr) =>
        //       mr.MRUploadedData.map((u) => u.Specility)
        //     )
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setSpecialityOptions(uniqueSpecialities);
        // const uniqueBrandNames = [
        //   ...new Set(
        //     response.data.flatMap((mr) =>
        //       mr.MRUploadedData.map((u) => u.BrandName)
        //     )
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        // setBrandNameOptions(uniqueBrandNames);
        // const uniquePoints = [
        //   ...new Set(
        //     response.data.flatMap((mr) =>
        //       mr.MRUploadedData.map((u) => u.Points)
        //     )
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty
        // setPointsOptions(uniquePoints);
        // const uniqueChallenger = [
        //   ...new Set(
        //     (response?.data || []).flatMap((mr) =>
        //       (mr?.MRUploadedData || []).flatMap((u) => u.role)
        //     )
        //   ),
        // ].filter(Boolean); // Exclude undefined or empty

        // setSelectChallengerOption(uniqueChallenger);

        // const uniquePreviousTeam = [
        //   ...new Set(
        //     response.data.flatMap((mr) =>
        //       mr.MRUploadedData.flatMap(
        //         (u) =>
        //           u.role === "Initiator"
        //             ? [u.teamA] // Add u.role and "Tournament" if isTournament is true
        //             : [u.teamB] // Add only u.role otherwise
        //       )
        //     )
        //   ),
        // ].filter(Boolean);
        // setSelectPreviousTeam(uniquePreviousTeam);
        // const uniqueOpponentTeam = [
        //   ...new Set(
        //     response.data.flatMap((mr) =>
        //       mr.MRUploadedData.flatMap(
        //         (u) =>
        //           u.role === "Initiator"
        //             ? [u.teamB] // Add u.role and "Tournament" if isTournament is true
        //             : [u.teamA] // Add only u.role otherwise
        //       )
        //     )
        //   ),
        // ].filter(Boolean);
        // setSelectOpponentTeam(uniqueOpponentTeam);
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
    // const data = filteredData.flatMap((item) =>
    //   item.MRUploadedData.map((upload) => ({
    //     MRID: item.MRID || "N/A",
    //     MRName: item.USERNAME || "N/A",
    //     HQ: item.HQ || "N/A",
    //     Region: item.REGION || "N/A",
    //     Zone: item.ZONE || "N/A",
    //     Current_Team: item.TEAMNAME || "N/A",
    //     DrName: upload.DrName || "N/A",
    //     Specility: upload.Specility || "N/A",
    //     MOBNO: upload.MOBNO || "N/A",
    //     ScCode: upload.ScCode || "N/A",
    //     BrandName: upload.BrandName || "N/A",
    //     Points: upload.Points || "0",
    //     NoRxns: upload.NoRxns || "N/A",
    //     RxnDuration: upload.RxnDuration || "N/A",
    //     Score_Count:
    //       parseInt(upload.Points) *
    //         parseInt(upload.RxnDuration) *
    //         parseInt(upload.NoRxns) || "N/A",
    //     Previous_Team:
    //       upload.role === "Initiator" ? upload.teamA : upload.teamB,
    //     Challenger: upload.role,
    //     // PrescriptionImage: upload.PrescriptionImage || "N/A",
    //     DateOfUpload: upload.DateOfUpload || "N/A",
    //     // DateOfCreation: upload.DateOfCreation || "N/A",
    //   }))
    // );
    // const workbook = XLSX.utils.book_new();
    // const worksheet = XLSX.utils.json_to_sheet(data);
    // XLSX.utils.book_append_sheet(workbook, worksheet, "UploadData");
    // XLSX.writeFile(workbook, "UploadData-Report.xlsx");
  };

  const downloadInvoiceImage = async (imageUrl) => {
    try {
      await axios.post(
        `http://localhost:7501/api/getBillCount/${Id}`
      );
      const data = await axios.get(
        `https://somprazquiz.digilateral.com/downloadObjectrx/${imageUrl}`
      );
      await axios.post(
        `http://localhost:7501/api/calculateBillSizeCount/${Id}`,
        {
          count: data.data.downloadUrl.size,
        }
      );
      const link = document.createElement("a");
      link.href = data.data.downloadUrl.url;
      link.setAttribute("download", imageUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download the image:", error);
    }
  };

  const safeMultiply = (...args) => {
    const numbers = args.map(v => parseInt(v) || 0).filter(n => n > 0);
    return numbers.length === 0 ? 0 : numbers.reduce((a, b) => a * b, 1);
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
                      {/* <div className="flex flex-col sm:flex-row justify-center sm:justify-around items-center gap-2">
                        <div className="flex justify-center items-center gap-2">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search Doctor Name, CustomerCode & TeamName"
                            className="sm:ml-5 px-4 py-2 w-[240px] sm:w-[420px] border-2 border-gray-500 text-sm sm:text-base"
                          />
                          <div className="mr-4 sm:mt-0" title="Clear Filter">
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
                        <div className="flex justify-center items-center">
                          <div className="flex justify-center items-center mr-4 sm:ml-16 ">
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
                          <div className="flex justify-center items-center mr-4 ">
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
                      <div className="sm:-mx-8 mt-2 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                        <div className="sm:h-[70vh] inline-block min-w-full shadow rounded-lg">
                          <table
                            className="min-w-full leading-normal hidden sm:block"
                            id="doctorTable"
                          >
                            <thead>
                              <tr>
                                {/* Table Headers */}
                                <th className="px-6 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  SR.no
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  UserId
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  UserName
                                  {/* <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedUsername}
                                    onChange={(e) =>
                                      setSelectedUsername(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {usernameOptions.map((username) => (
                                      <option key={username} value={username}>
                                        {username}
                                      </option>
                                    ))}
                                  </select> */}
                                </th>
                                <th className="px-20 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                StartTime
                                  {/* <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedHQ}
                                    onChange={(e) =>
                                      setSelectedHQ(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {hqOptions.map((hq) => (
                                      <option key={hq} value={hq}>
                                        {hq}
                                      </option>
                                    ))}
                                  </select> */}
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  EndTime
                                  {/* <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedRegion}
                                    onChange={(e) =>
                                      setSelectedRegion(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {regionOptions.map((region) => (
                                      <option key={region} value={region}>
                                        {region}
                                      </option>
                                    ))}
                                  </select> */}
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Date
                                  {/* <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedZONE}
                                    onChange={(e) =>
                                      setSelectedZONE(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {zoneOptions.map((zone) => (
                                      <option key={zone} value={zone}>
                                        {zone}
                                      </option>
                                    ))}
                                  </select> */}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadData
                                .sort((a, b) => {
                                  // Ensure there is valid MRUploadedData
                                  {/* const aDate =
                                    a.MRUploadedData.length > 0
                                      ? parseDate(
                                          a.MRUploadedData[0].DateOfCreation
                                        )
                                      : new Date(0);
                                  const bDate =
                                    b.MRUploadedData.length > 0
                                      ? parseDate(
                                          b.MRUploadedData[0].DateOfCreation
                                        )
                                      : new Date(0); // Sort by the most recent date first (newest at the top)
                                  return bDate - aDate; */}
                                })
                                .map((User, index, arr) => (
                                  <tr
                                    key={index}
                                    className="border bg-pink-200 even:bg-pink-100"
                                  >
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {arr.length - index}
                                      {/* Calculate reverse Sr. No. */}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {User.UserTrackSummary.mrId}
                                    </td>
                                    <td className="px-40 py-1  text-center text-sm text-black">
                                      {User.UserTrackSummary.mrName}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {User.UserTrackSummary.startTime}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {User.UserTrackSummary.endTime}
                                    </td>
                                    <td className="px-[40px] py-1  text-center text-sm text-black">
                                      {User.UserTrackSummary.today}
                                    </td>
                                   
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <table
                            className="min-w-full leading-normal sm:hidden text-xs"
                            id="doctorTable"
                          >
                            <thead>
                              <tr>
                                {/* <th className="w-[4px] py-1 border-2 border-gray-500 bg-gray-100 text-center text-[7px] text-gray-600 uppercase tracking-wider font-semibold">
                                  SR.no
                                </th> */}
                                <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-left text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                  MrName
                                </th>
                                <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-left text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                  DrName
                                </th>
                                <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                  Points
                                </th>
                                <th className="w-[70px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                  Upload Date
                                </th>
                                <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                  Upload Time
                                </th>
                                <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold"></th>
                                {/* <th className="w-[30px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                  Download
                                </th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {/* {uploadData
                                .sort((a, b) => {
                                })
                                .flatMap((item) =>
                                  item.MRUploadedData.map((upload) => {
                                    const match = item.MrScoreEachMatch?.find(
                                      (score) =>
                                        score.MatchDate === upload.DateOfUpload
                                    );
                                    return {
                                      ...upload,
                                      MRID: item.MRID,
                                      USERNAME: item.USERNAME,
                                      HQ: item.HQ,
                                      REGION: item.REGION,
                                      ZONE: item.ZONE,
                                      TeamName: item.TEAMNAME,
                                    };
                                  })
                                )
                                .reverse()
                                .map((upload, index, arr) => (
                                  <React.Fragment key={index}>
                                    <tr className="border bg-pink-200 even:bg-pink-100">
                                     
                                      <td className="px-1 py-1  text-left text-[9px] text-black">
                                        {upload.USERNAME || "-"}
                                      </td>
                                      <td className="px-1 py-1  text-left text-[9px] text-black">
                                        {upload.DrName || "-"}
                                      </td>
                                      <td className="px-1 py-1  text-center text-[9px] text-black">
                                        {upload.Points || "-"}
                                      </td>
                                      <td className="px-1 py-1  text-center text-[9px] text-black">
                                        {upload.DateOfUpload || "-"}
                                      </td>
                                      <td className="px-1 py-1  text-center text-[9px] text-black">
                                        {upload.TimeOfUpload || "-"}
                                      </td>
                                      
                                      <td className="lg:hidden border border-white px-1">
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
                                          className=" px-1 py-2 text-[9px]"
                                        >
                                          <div className="flex flex-col gap-2">
                                            <div>
                                              <strong>Current_Team:</strong>{" "}
                                              {upload.TeamName || "-"}
                                            </div>
                                            
                                            <div>
                                              <strong>Speciality:</strong>{" "}
                                              {upload.Specility || "-"}
                                            </div>
                                            <div>
                                              <strong>Brand Name:</strong>{" "}
                                              {upload.BrandName || "-"}
                                            </div>
                                            <div>
                                              <strong>Points:</strong>{" "}
                                              {upload.Points || "-"}
                                            </div>
                                            <div>
                                              <strong>No Rxns:</strong>{" "}
                                              {upload.NoRxns || "-"}
                                            </div>
                                            <div>
                                              <strong>Rxn Duration:</strong>{" "}
                                              {upload.RxnDuration || "-"}
                                            </div>
                                            <div>
                                              <strong>Score:</strong>{" "}
                                              {parseInt(upload.RxnDuration) *
                                                parseInt(upload.Points) *
                                                parseInt(upload.NoRxns)}
                                            </div>
                                            <div>
                                              <strong>Total Score:</strong>{" "}
                                              {upload.Status === "Rejected"
                                                ? "0"
                                                : parseInt(upload.RxnDuration) *
                                                  parseInt(upload.Points) *
                                                  parseInt(upload.NoRxns)}
                                            </div>
                                            <div>
                                              <strong>Challenger:</strong>{" "}
                                              {upload.isTournament === true
                                                ? "Tournament"
                                                : upload.role || "-"}
                                            </div>
                                            <div>
                                              <strong>PREVIOUS_TEAM:</strong>{" "}
                                              {upload.role === "Initiator"
                                                ? upload.teamA
                                                : upload.teamB}
                                            </div>
                                            <div>
                                              <strong>OPPONENT_TEAM:</strong>{" "}
                                              {upload.role === "Initiator"
                                                ? upload.teamB
                                                : upload.teamA}
                                            </div>
                                            <div>
                                              <strong>ScCode:</strong>{" "}
                                              {upload.ScCode || "-"}
                                            </div>
                                            <div>
                                              <strong>MRID:</strong>{" "}
                                              {upload.MRID || "-"}
                                            </div>
                                            <div>
                                              <strong>MR Name:</strong>{" "}
                                              {upload.USERNAME || "-"}
                                            </div>
                                            <div>
                                              <strong>HQ:</strong>{" "}
                                              {upload.HQ || "-"}
                                            </div>
                                            <div>
                                              <strong>ZONE:</strong>{" "}
                                              {upload.ZONE || "-"}
                                            </div>
                                            <div>
                                              <strong>REGION:</strong>{" "}
                                              {upload.REGION || "-"}
                                            </div>
                                            <div>
                                              <strong>Date of Creation:</strong>{" "}
                                              {upload.TimeOfUpload || "-"}
                                            </div>
                                            <div className="flex">
                                              <strong>Download:</strong>
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="h-4 w-4 cursor-pointer"
                                                onClick={() =>
                                                  downloadInvoiceImage(
                                                    upload.PrescriptionImage
                                                  )
                                                }
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                                />
                                              </svg>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))} */}
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
    </>
  );
};

export default UserScreenTime;
