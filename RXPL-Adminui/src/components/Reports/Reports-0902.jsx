import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackGroundImg from "../../assets/bg.png";
import { RiFileExcel2Fill } from "react-icons/ri";

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

  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthOptions, setMonthOptions] = useState([]);

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

      const isMonthMatch =
        !selectedMonth || getMonthYY(data.DateOfUpload) === selectedMonth;

      return (
        isSpecialityMatch &&
        isBrandNameMatch &&
        isDrNameMatch &&
        isWithinDateRange &&
        isPointsMatch &&
        isMonthMatch
      );
    });

    return filteredUploads.length
      ? [{ ...upload, MRUploadedData: filteredUploads }]
      : [];
  });


    
   const stats = filteredData.reduce(
  (acc, mr) => {
    mr.MRUploadedData.forEach((u) => {
      // -------- 1B / 2B / 3B --------
      if (u.NumberOfBrands === 1) acc.oneB++;
      if (u.NumberOfBrands === 2) acc.twoB++;
      if (u.NumberOfBrands === 3) acc.threeB++;

      // -------- BRAND COUNTS --------
      if (u.SelectedBrands?.length) {
        u.SelectedBrands.forEach((b) => {
          const name = b.brandName.trim().toLowerCase();
          if (acc.brands[name] !== undefined) {
            acc.brands[name]++;
          }
        });
      }
    });

    return acc;
  },
  {
    oneB: 0,
    twoB: 0,
    threeB: 0,
    brands: {
      vysov: 0,
      triexer: 0,
      rdl: 0,
      "re-xite forte": 0,
      "metis g": 0,
      tordura: 0,
    },
  }
);

  const removeFilter = () => {
    setFromDate("");
    setToDate("");
    setSelectedUsername("");
    setSelectedHQ("");
    setSelectedZONE("");
    setSelectedRegion("");
    setSelectedTeamName("");
    setSelectedSpeciality("");
    // setSelectedBrandName("");
    setSelectedPoints("");
    setSearchQuery("");
    setSelectedChallenger("");
    setSelectedPrevTeam("");
    setSelectedOppTeam("");
    setSelectedMonth("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getUploadData/${Id}`,
          //`http://192.168.1.6:7501/api/getUploadData/${Id}`,
        );

        setUploadData(response.data);
        const uniqueUsernames = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.USERNAME;
              }
            }),
          ),
        ].filter(Boolean);
        setUsernameOptions(uniqueUsernames);
        const uniqueHQs = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.HQ;
              }
            }),
          ),
        ].filter(Boolean);
        setHqOptions(uniqueHQs);
        const uniqueZones = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.ZONE;
              }
            }),
          ),
        ].filter(Boolean);
        setZONEOptions(uniqueZones);
        const uniqueRegions = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.REGION;
              }
            }),
          ),
        ].filter(Boolean);
        setRegionOptions(uniqueRegions);
        const uniqueTeamNames = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.TEAMNAME;
              }
            }),
          ),
        ].filter(Boolean);
        setTeamNameOptions(uniqueTeamNames);
        const uniqueSpecialities = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.Specility),
            ),
          ),
        ].filter(Boolean);
        setSpecialityOptions(uniqueSpecialities);
        const uniqueBrandNames = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.BrandName),
            ),
          ),
        ].filter(Boolean);
        setBrandNameOptions(uniqueBrandNames);
        const uniquePoints = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.Points),
            ),
          ),
        ].filter(Boolean);
        setPointsOptions(uniquePoints);
        const uniqueChallenger = [
          ...new Set(
            (response?.data || []).flatMap((mr) =>
              (mr?.MRUploadedData || []).flatMap((u) => u.role),
            ),
          ),
        ].filter(Boolean);

        setSelectChallengerOption(uniqueChallenger);

        const uniquePreviousTeam = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap((u) =>
                u.role === "Initiator" ? [u.teamA] : [u.teamB],
              ),
            ),
          ),
        ].filter(Boolean);
        setSelectPreviousTeam(uniquePreviousTeam);
        const uniqueOpponentTeam = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap((u) =>
                u.role === "Initiator" ? [u.teamB] : [u.teamA],
              ),
            ),
          ),
        ].filter(Boolean);
        setSelectOpponentTeam(uniqueOpponentTeam);
        const uniqueMonths = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => getMonthYY(u.DateOfUpload)),
            ),
          ),
        ].filter(Boolean);

        setMonthOptions(uniqueMonths);

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

  const getMonthYY = (dateStr) => {
    if (!dateStr) return "-";

    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.toLocaleString("en-US", {
        month: "short",
      }) +
      "-" +
      String(year).slice(-2)
    );
  };

  const exportToExcel = () => {
    const data = filteredData.flatMap((item) =>
      item.MRUploadedData.map((upload) => {
        const selectedBrandSet = getSelectedBrandSet(upload);
        const baseData = {
          MRID: item.MRID || "N/A",
          MRName: item.USERNAME || "N/A",
          HQ: item.HQ || "N/A",
          Region: item.REGION || "N/A",
          Zone: item.ZONE || "N/A",
          Current_Team: item.TEAMNAME || "N/A",
          DrName: upload.DrName || "N/A",
          Speciality: upload.Specility || "N/A",
          // ScCode: upload.ScCode || "N/A",
          // BrandName: upload.BrandName || "N/A",

          // ✅ 1B / 2B / 3B
          "1B": upload.NumberOfBrands === 1 ? 1 : "-",
          "2B": upload.NumberOfBrands === 2 ? 1 : "-",
          "3B": upload.NumberOfBrands === 3 ? 1 : "-",

          // ✅ BRAND SPLIT COLUMNS
          Vysov: selectedBrandSet.has("vysov") ? 1 : "-",
          Triexer: selectedBrandSet.has("triexer") ? 1 : "-",
          RDL: selectedBrandSet.has("rdl") ? 1 : "-",
          "Re-xite Forte": selectedBrandSet.has("re-xite forte") ? 1 : "-",
          "Metis G": selectedBrandSet.has("metis g") ? 1 : "-",
          Tordura: selectedBrandSet.has("tordura") ? 1 : "-",

          Month: getMonthYY(upload.DateOfUpload),
          NoRxns: upload.NoRxns || "N/A",
          RxnDuration: upload.RxnDuration || "N/A",
          Total:
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
      }),
    );
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "UploadData");
    XLSX.writeFile(workbook, "UploadData-Report.xlsx");
  };

  const BRAND_COLUMNS = [
    "Vysov",
    "Triexer",
    "RDL",
    "Re-xite Forte",
    "Metis G",
    "Tordura",
  ];

  const getSelectedBrandSet = (upload) => {
    if (!upload?.SelectedBrands?.length) return new Set();

    return new Set(
      upload.SelectedBrands.map((b) => b.brandName.trim().toLowerCase()),
    );
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
              <div className="rounded-2xl shadow-md h-[90vh] flex flex-col">
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
                  <>
                    {/* Search/Filter Section - Fixed at top */}
                    <div className="flex-shrink-0 overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-center sm:justify-around items-center gap-2 py-2">
                        <div className="flex justify-center items-center gap-2">
                          {/* UPDATED: Search placeholder with MRID and MR Name */}
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search MRID, MR Name, Doctor Name, Team"
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
                            {/* Download Excel */}
                            <RiFileExcel2Fill className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards - Sticky */}
                    <div className="flex-shrink-0 sticky top-0 z-10 py-0">
                      <div className="px-4">
                        <div className="flex flex-wrap gap-6 w-full">
                          {/* ===== CARD 1: 1B / 2B / 3B / Total ===== */}
                          <div className="bg-white rounded-xl shadow-md px-4 py-2 flex-[0.4] min-w-[380px]">
                            <p className="text-base font-semibold text-gray-500 text-center mb-2">
                              Brand Count Summary
                            </p>

                            <div className="flex justify-around text-center">
                              <div>
                                <p className="text-sm font-bold text-gray-500">1B</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.oneB}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-500">2B</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.twoB}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-500">3B</p>
                                <p className="text-2xl font-semibold text-purple-600">{stats.threeB}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.oneB + stats.twoB + stats.threeB}</p>
                              </div>
                            </div>
                          </div>

                          {/* ===== CARD 2: BRAND-WISE ===== */}
                          <div className="bg-white rounded-xl shadow-md px-4 py-2 flex-[1.6] min-w-[600px]">
                            <p className="text-base font-semibold text-gray-500 text-center mb-2">
                              Brand Wise Summary
                            </p>

                            <div className="grid grid-cols-6 gap-4 text-center">
                              {Object.entries(stats.brands).map(([brand, count]) => (
                                <div key={brand}>
                                  <p className="text-sm font-bold capitalize text-gray-500 whitespace-nowrap">
                                    {brand}
                                  </p>
                                  <p className="text-2xl font-semibold text-purple-700">
                                    {count}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table Section - Scrollable */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                      <div className="sm:-mx-8 mt-2 px-2 pl-0 sm:px-8 py-0">
                        <div className="inline-block min-w-full shadow rounded-lg">

                          <table
                            className="min-w-full leading-normal hidden sm:block"
                            id="doctorTable"
                          >
                            <thead>
                              {/* ===== HEADER ROW 1 ===== */}
                              <tr>
                                {/* <th rowSpan={2} className="px-6 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">SR.No</th>
    <th rowSpan={2} className="px-10 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">MRID</th>
    <th rowSpan={2} className="px-10 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">MR Name</th>
    <th rowSpan={2} className="px-20 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">HQ</th>
    <th rowSpan={2} className="px-20 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">Region</th>
    <th rowSpan={2} className="px-20 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">Zone</th>
    <th rowSpan={2} className="px-10 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap">Current Team</th> */}

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-widerr"
                                >
                                  SR.No
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  MRID
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  MR Name
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedUsername}
                                    onChange={(e) =>
                                      setSelectedUsername(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {usernameOptions.map((u) => (
                                      <option key={u} value={u}>
                                        {u}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-20 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
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

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  Region
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedRegion}
                                    onChange={(e) =>
                                      setSelectedRegion(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {regionOptions.map((r) => (
                                      <option key={r} value={r}>
                                        {r}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  Zone
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedZONE}
                                    onChange={(e) =>
                                      setSelectedZONE(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {zoneOptions.map((z) => (
                                      <option key={z} value={z}>
                                        {z}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  Current Team
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedTeamName}
                                    onChange={(e) =>
                                      setSelectedTeamName(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {teamNameOptions.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Doctor Name
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  Speciality
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedSpeciality}
                                    onChange={(e) =>
                                      setSelectedSpeciality(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {specialityOptions.map((u) => (
                                      <option key={u} value={u}>
                                        {u}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                {isDIGI && (
                                  <th
                                    rowSpan={2}
                                    className="px-10 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap"
                                  >
                                    Speciality
                                  </th>
                                )}

                                {isDIGI && (
                                  <th
                                    rowSpan={2}
                                    className="px-10 py-2 border-2 text-center uppercase tracking-wider whitespace-nowrap"
                                  >
                                    Mobile No
                                  </th>
                                )}

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  1B
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  2B
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  3B
                                </th>

                                {/* 🔥 MAIN BRAND HEADER */}
                                <th
                                  colSpan={6}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  BrandName
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  No. Rxns
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Rxn Duration
                                </th>
                                {/* <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Points
                                </th> */}
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Total 
                                </th>

                                {isDIGI && (
                                  <th
                                    rowSpan={2}
                                    className="px-10 py-2 border-2 text-center whitespace-nowrap"
                                  >
                                    Challenger
                                  </th>
                                )}

                                {isDIGI && (
                                  <th
                                    rowSpan={2}
                                    className="px-10 py-2 border-2 text-center whitespace-nowrap"
                                  >
                                    Previous Team
                                  </th>
                                )}

                                {isDIGI && (
                                  <th
                                    rowSpan={2}
                                    className="px-10 py-2 border-2 text-center whitespace-nowrap"
                                  >
                                    Opponent Team
                                  </th>
                                )}

                                {/* <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Month
                                </th> */}
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  Month
                                  <select
                                    className="px-2 py-1 border rounded text-sm"
                                    value={selectedMonth}
                                    onChange={(e) =>
                                      setSelectedMonth(e.target.value)
                                    }
                                  >
                                    <option value="">All</option>
                                    {monthOptions.map((m) => (
                                      <option key={m} value={m}>
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Upload Date
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Upload Time
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-20 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Download Proof
                                </th>
                              </tr>

                              {/* ===== HEADER ROW 2 (SUB BRANDS) ===== */}
                              <tr>
                                {BRAND_COLUMNS.map((brand) => (
                                  <th
                                    key={brand}
                                    className="px-6 py-2 border-2 border-gray-500  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                  >
                                    {brand}
                                  </th>
                                ))}
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
                                  })),
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
                                      minutes,
                                    );
                                  };

                                  const aDateTime = parseDateTime(
                                    a.DateOfUpload,
                                    a.TimeOfUpload,
                                  );
                                  const bDateTime = parseDateTime(
                                    b.DateOfUpload,
                                    b.TimeOfUpload,
                                  );

                                  // Sort descending (newest first)
                                  return bDateTime - aDateTime;
                                })

                                .map((upload, index, arr) => (
                                  <tr
                                    key={index}
                                    className="border bg-pink-200 even:bg-pink-100"
                                  >
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {arr.length - index}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.MRID || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.USERNAME || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.HQ || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.REGION || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.ZONE || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.TeamName || "-"}
                                    </td>
                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.DrName || "-"}
                                    </td>

                                    <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.Specility || "-"}
                                    </td>
                                    {/* CONDITIONAL: Only show Speciality for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                        {upload.Specility || "-"}
                                      </td>
                                    )}

                                    {/* CONDITIONAL: Only show Mobile.No for DIGI */}
                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                        {upload.MOBNO || "-"}
                                      </td>
                                    )}

                                    {/* <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.ScCode || "-"}
                                    </td> */}
                                    {/* <td className="px-18 py-1  text-center text-sm text-black whitespace-nowrap">
                                      {upload.BrandName || "-"}
                                    </td> */}

                                    <td className="px-6 py-1 text-center text-sm">
                                      {upload.NumberOfBrands === 1 ? "1" : "-"}
                                    </td>

                                    <td className="px-6 py-1 text-center text-sm">
                                      {upload.NumberOfBrands === 2 ? "1" : "-"}
                                    </td>

                                    <td className="px-6 py-1 text-center text-sm">
                                      {upload.NumberOfBrands === 3 ? "1" : "-"}
                                    </td>

                                    {(() => {
                                      const selectedBrandSet =
                                        getSelectedBrandSet(upload);

                                      return BRAND_COLUMNS.map((brand) => (
                                        <td
                                          key={brand}
                                          className="px-6 py-1 text-center text-sm whitespace-nowrap"
                                        >
                                          {selectedBrandSet.has(
                                            brand.toLowerCase(),
                                          )
                                            ? "1"
                                            : "-"}
                                        </td>
                                      ));
                                    })()}

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
                                    {/* <td className="px-18 py-1  text-center text-sm text-black">
                                      {safeMultiply(
                                        upload.RxnDuration,
                                        upload.Points,
                                        upload.NoRxns,
                                      )}
                                    </td> */}
                                    <td className="px-18 py-1  text-center text-sm text-black">
                                      {upload.Status === "Rejected"
                                        ? "0"
                                        : safeMultiply(
                                            upload.RxnDuration,
                                            upload.Points,
                                            upload.NoRxns,
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

                                    {isDIGI && (
                                      <td className="px-18 py-1  text-center text-sm text-black">
                                        {upload.role === "Initiator"
                                          ? upload.teamB
                                          : upload.teamA}
                                      </td>
                                    )}
                                    <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                      {getMonthYY(upload.DateOfUpload)}
                                    </td>

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
                                            upload.PrescriptionImage,
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
                  </>
                )}
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

