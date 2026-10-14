import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackGroundImg from "../../assets/bg.png";

const Reports = () => {
  const pageName = "Reports";
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

  const [searchQuery, setSearchQuery] = useState("");

  const BusinessUnit = sessionStorage.getItem("BusinessUnit");

  // NEW: Check if business unit is DIGI to show/hide columns
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

    const filteredChallenger = upload.MRUploadedData.filter((data) => {
      const isRoleMatch =
        !selectedChallenger || data.role === selectedChallenger;

      const isPreviousTeamMatch =
        !selectedPreviousTeam ||
        (data.role === "Initiator" && selectedPreviousTeam === data.teamA) ||
        (data.role === "Acceptor" && selectedPreviousTeam === data.teamB);

      const isOpponentTeamMatch =
        !selectedOpponentTeam ||
        (data.role === "Initiator" && selectedOpponentTeam === data.teamB) ||
        (data.role === "Acceptor" && selectedOpponentTeam === data.teamA);

      return isRoleMatch && isPreviousTeamMatch && isOpponentTeamMatch;
    });

    if (!filteredChallenger.length) return [];

    const filteredUploads = filteredChallenger.filter((data) => {
      // UPDATED: Enhanced search to include MRID and MR Name
      const isDrNameMatch =
        !searchQuery ||
        data.DrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.ScCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upload.TEAMNAME?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upload.MRID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upload.USERNAME?.toLowerCase().includes(searchQuery.toLowerCase());

      const isSpecialityMatch =
        !selectedSpeciality || data.Specility === selectedSpeciality;
      const isBrandNameMatch =
        !selectedBrandName || data.BrandName === selectedBrandName;
      const isPointsMatch = !selectedPoints || data.Points === selectedPoints;

      const parsedCreationDate = parseDate(data.DateOfCreation);

      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from) from.setHours(0, 0, 0, 0);
      if (to) to.setHours(23, 59, 59, 999);

      const isWithinDateRange =
        (!from || parsedCreationDate >= from) &&
        (!to || parsedCreationDate <= to);

      return (
        isSpecialityMatch &&
        isBrandNameMatch &&
        isDrNameMatch &&
        isWithinDateRange &&
        isPointsMatch
      );
    });

    return filteredUploads.length
      ? [{ ...upload, MRUploadedData: filteredUploads }]
      : [];
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
          `http://localhost:7501/api/getUploadData/${Id}`
        );

        setUploadData(response.data);
        const uniqueUsernames = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.USERNAME;
              }
            })
          ),
        ].filter(Boolean);
        setUsernameOptions(uniqueUsernames);
        const uniqueHQs = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.HQ;
              }
            })
          ),
        ].filter(Boolean);
        setHqOptions(uniqueHQs);
        const uniqueZones = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.ZONE;
              }
            })
          ),
        ].filter(Boolean);
        setZONEOptions(uniqueZones);
        const uniqueRegions = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.REGION;
              }
            })
          ),
        ].filter(Boolean);
        setRegionOptions(uniqueRegions);
        const uniqueTeamNames = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.TEAMNAME;
              }
            })
          ),
        ].filter(Boolean);
        setTeamNameOptions(uniqueTeamNames);
        const uniqueSpecialities = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.Specility)
            )
          ),
        ].filter(Boolean);
        setSpecialityOptions(uniqueSpecialities);
        const uniqueBrandNames = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.BrandName)
            )
          ),
        ].filter(Boolean);
        setBrandNameOptions(uniqueBrandNames);
        const uniquePoints = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.Points)
            )
          ),
        ].filter(Boolean);
        setPointsOptions(uniquePoints);
        const uniqueChallenger = [
          ...new Set(
            (response?.data || []).flatMap((mr) =>
              (mr?.MRUploadedData || []).flatMap((u) => u.role)
            )
          ),
        ].filter(Boolean);

        setSelectChallengerOption(uniqueChallenger);

        const uniquePreviousTeam = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap((u) =>
                u.role === "Initiator" ? [u.teamA] : [u.teamB]
              )
            )
          ),
        ].filter(Boolean);
        setSelectPreviousTeam(uniquePreviousTeam);
        const uniqueOpponentTeam = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap((u) =>
                u.role === "Initiator" ? [u.teamB] : [u.teamA]
              )
            )
          ),
        ].filter(Boolean);
        setSelectOpponentTeam(uniqueOpponentTeam);
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
    const data = filteredData.flatMap((item) =>
      item.MRUploadedData.map((upload) => {
        const baseData = {
          MRID: item.MRID || "N/A",
          MRName: item.USERNAME || "N/A",
          HQ: item.HQ || "N/A",
          Region: item.REGION || "N/A",
          Zone: item.ZONE || "N/A",
          Current_Team: item.TEAMNAME || "N/A",
          DrName: upload.DrName || "N/A",
          ScCode: upload.ScCode || "N/A",
          BrandName: upload.BrandName || "N/A",
          NoRxns: upload.NoRxns || "N/A",
          RxnDuration: upload.RxnDuration || "N/A",
          Score_Count:
            parseInt(upload.Points) *
              parseInt(upload.RxnDuration) *
              parseInt(upload.NoRxns) || "N/A",
          DateOfUpload: upload.DateOfUpload || "N/A",
        };

        // Add DIGI-specific columns only if BusinessUnit is DIGI
        if (isDIGI) {
          baseData.Specility = upload.Specility || "N/A";
          baseData.MOBNO = upload.MOBNO || "N/A";
          baseData.Points = upload.Points || "0";
          baseData.Previous_Team =
            upload.role === "Initiator" ? upload.teamA : upload.teamB;
          baseData.Challenger = upload.role;
        }

        return baseData;
      })
    );
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "UploadData");
    XLSX.writeFile(workbook, "UploadData-Report.xlsx");
  };

const downloadInvoiceImage = async (imageUrl) => {
  try {
    const downloadUrl = `http://localhost:7501/uploads/${imageUrl}`;
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", imageUrl);
    link.setAttribute("target", "_blank"); // Optional: opens in new tab if download fails
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download the image:", error);
  }
};


  const safeMultiply = (...args) => {
    const numbers = args.map((v) => parseInt(v) || 0).filter((n) => n > 0);
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
              <div className="overflow-y-auto max-h-screen sm:w-full w-full rounded-2xl shadow-md h-[90vh]">
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
                      <div className="flex flex-col sm:flex-row justify-center sm:justify-around items-center gap-2">
                        <div className="flex justify-center items-center gap-2">
                          {/* UPDATED: Search placeholder with MRID and MR Name */}
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search MRID, MR Name, Doctor Name, Customer Code, Team"
                            className="sm:ml-5 px-4 py-2 w-[240px] sm:w-[480px] border-2 border-gray-500 text-sm sm:text-base"
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
                      </div>
                      <div className="sm:-mx-8 mt-2 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                        <div className="sm:h-[80vh] inline-block min-w-full shadow rounded-lg">
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
                                  MRID
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  MRName
                                  <select
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
                                  </select>
                                </th>
                                <th className="px-20 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  HQ
                                  <select
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
                                  </select>
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Region
                                  <select
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
                                  </select>
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Zone
                                  <select
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
                                  </select>
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Current Team
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedTeamName}
                                    onChange={(e) =>
                                      setSelectedTeamName(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {teamNameOptions.map((teamName) => (
                                      <option key={teamName} value={teamName}>
                                        {teamName}
                                      </option>
                                    ))}
                                  </select>
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  DrName
                                </th>

                                {/* CONDITIONAL: Only show Speciality for DIGI */}
                                {isDIGI && (
                                  <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Speciality
                                    <select
                                      className="px-2 py-1 border rounded text-sm"
                                      value={selectedSpeciality}
                                      onChange={(e) =>
                                        setSelectedSpeciality(e.target.value)
                                      }
                                    >
                                      <option value="">All</option>
                                      {specialityOptions.map((speciality) => (
                                        <option
                                          key={speciality}
                                          value={speciality}
                                        >
                                          {speciality}
                                        </option>
                                      ))}
                                    </select>
                                  </th>
                                )}

                                {/* CONDITIONAL: Only show Mobile.No for DIGI */}
                                {isDIGI && (
                                  <th className="px-12 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Mobile.No
                                  </th>
                                )}

                                <th className="min-w-[200px] px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Customer Code
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  BrandName
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedBrandName}
                                    onChange={(e) =>
                                      setSelectedBrandName(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {brandNameOptions.map((brandName) => (
                                      <option key={brandName} value={brandName}>
                                        {brandName}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                {/* CONDITIONAL: Only show Points for DIGI */}
                                {isDIGI && (
                                  <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Points
                                    <select
                                      className="px-2 py-1 border rounded text-sm"
                                      value={selectedPoints}
                                      onChange={(e) =>
                                        setSelectedPoints(e.target.value)
                                      }
                                    >
                                      <option value="">All</option>
                                      {pointsOptions.map((points) => (
                                        <option key={points} value={points}>
                                          {points}
                                        </option>
                                      ))}
                                    </select>
                                  </th>
                                )}

                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  No.Rxns
                                </th>
                                <th className="min-w-[200px] px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                  {"Rxn Duration (Default Factor)"}
                                </th>

                                <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Score
                                </th>
                                <th className="min-w-[200px] px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Total Score
                                </th>

                                {/* CONDITIONAL: Only show Challenger for DIGI */}
                                {isDIGI && (
                                  <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Challenger
                                    <select
                                      className="px-2 py-1 border rounded text-sm"
                                      value={selectedChallenger}
                                      onChange={(e) =>
                                        setSelectedChallenger(e.target.value)
                                      }
                                    >
                                      <option value="">All</option>
                                      {selectChallengerOption.map(
                                        (challenge) => (
                                          <option
                                            key={challenge}
                                            value={challenge}
                                          >
                                            {challenge}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </th>
                                )}

                                {/* CONDITIONAL: Only show PREVIOUS TEAM for DIGI */}
                                {isDIGI && (
                                  <th className="min-w-[200px] px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    PREVIOUS TEAM
                                    <select
                                      className="px-2 py-1 border rounded text-sm"
                                      value={selectedPreviousTeam}
                                      onChange={(e) =>
                                        setSelectedPrevTeam(e.target.value)
                                      }
                                    >
                                      <option value="">All</option>
                                      {selectPreviousTeam.map((prevTeam) => (
                                        <option key={prevTeam} value={prevTeam}>
                                          {prevTeam}
                                        </option>
                                      ))}
                                    </select>
                                  </th>
                                )}


                              
                               {isDIGI && (<th className="min-w-[200px] px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  OPPONENT TEAM
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedOpponentTeam}
                                    onChange={(e) =>
                                      setSelectedOppTeam(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {selectOpponentTeam.map((oppTeam) => (
                                      <option key={oppTeam} value={oppTeam}>
                                        {oppTeam}
                                      </option>
                                    ))}
                                  </select>
                                </th>)}
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  UploadDate
                                </th>
                                <th className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  UploadTime
                                </th>

                                {/* CONDITIONAL: Only show Download Proof for DIGI */}
                                
                                  <th className="min-w-[300px] px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Download Proof
                                  </th>
                                
                              </tr>
                            </thead>
                            <tbody>
                              {filteredData
                                .flatMap((item) =>
                                  item.MRUploadedData.map((upload) => ({
                                    ...upload,
                                    MRID: item.MRID,
                                    USERNAME: item.USERNAME,
                                    HQ: item.HQ,
                                    REGION: item.REGION,
                                    ZONE: item.ZONE,
                                    TeamName: item.TEAMNAME,
                                  }))
                                )
                                .sort((a, b) => {
                                  // Parse date (DD-MM-YYYY) and time (HH:MM)
                                  const parseDateTime = (dateStr, timeStr) => {
                                    if (!dateStr) return new Date(0);

                                    const [day, month, year] = dateStr
                                      .split("-")
                                      .map(Number);
                                    let hours = 0,
                                      minutes = 0;

                                    // Parse time if available (HH:MM format)
                                    if (timeStr) {
                                      const timeParts = timeStr
                                        .split(":")
                                        .map(Number);
                                      hours = timeParts[0] || 0;
                                      minutes = timeParts[1] || 0;
                                    }

                                    return new Date(
                                      year,
                                      month - 1,
                                      day,
                                      hours,
                                      minutes
                                    );
                                  };

                                  const aDateTime = parseDateTime(
                                    a.DateOfUpload,
                                    a.TimeOfUpload
                                  );
                                  const bDateTime = parseDateTime(
                                    b.DateOfUpload,
                                    b.TimeOfUpload
                                  );

                                  // Sort descending (newest first)
                                  return bDateTime - aDateTime;
                                })

                                .map((upload, index, arr) => (
                                  <tr
                                    key={index}
                                    className="border bg-pink-200 even:bg-pink-100"
                                  >
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {arr.length - index}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.MRID || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.USERNAME || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.HQ || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.REGION || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.ZONE || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.TeamName || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.DrName || "-"}
                                    </td>

                                    {/* CONDITIONAL: Only show Speciality for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black">
                                        {upload.Specility || "-"}
                                      </td>
                                    )}

                                    {/* CONDITIONAL: Only show Mobile.No for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black">
                                        {upload.MOBNO || "-"}
                                      </td>
                                    )}

                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.ScCode || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.BrandName || "-"}
                                    </td>

                                    {/* CONDITIONAL: Only show Points for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black">
                                        {upload.Points || "-"}
                                      </td>
                                    )}

                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.NoRxns || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.RxnDuration || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {safeMultiply(
                                        upload.RxnDuration,
                                        upload.Points,
                                        upload.NoRxns
                                      )}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.Status === "Rejected"
                                        ? "0"
                                        : safeMultiply(
                                            upload.RxnDuration,
                                            upload.Points,
                                            upload.NoRxns
                                          )}
                                    </td>

                                    {/* CONDITIONAL: Only show Challenger for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black">
                                        {upload.role}
                                      </td>
                                    )}

                                    {/* CONDITIONAL: Only show PREVIOUS TEAM for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black">
                                        {upload.role === "Initiator"
                                          ? upload.teamA
                                          : upload.teamB}
                                      </td>
                                    )}

                                    {isDIGI &&(<td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.role === "Initiator"
                                        ? upload.teamB
                                        : upload.teamA}
                                    </td>)}

                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.DateOfUpload || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.TimeOfUpload || "-"}
                                    </td>

                                    {/* CONDITIONAL: Only show Download Proof for DIGI */}
                                    
                                      <td className="px-18 py-1  flex justify-center items-center text-sm text-black">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.5}
                                          stroke="currentColor"
                                          className="size-6 cursor-pointer"
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
                                      </td>
                                  
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          {/* Mobile View Table - Keep as is, add same conditional logic if needed */}
                          <table
                            className="min-w-full leading-normal sm:hidden text-xs"
                            id="doctorTable"
                          >
                            {/* Keep your existing mobile table code */}
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

export default Reports;

