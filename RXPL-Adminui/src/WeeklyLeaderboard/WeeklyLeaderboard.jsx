import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import BackGroundImg from "../assets/bg.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RiFileExcel2Fill } from "react-icons/ri";

export const Leaderboard = () => {
  const pageName = "Leaderboard";

  // Tab State
  const [activeTab, setActiveTab] = useState("MR"); // 'MR' or 'TEAM'

  // Common States
  const [loading, setLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [businessUnit, setBusinessUnit] = useState("");

  // Month/Week/Day states
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear] = useState("2026");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showWeekBar, setShowWeekBar] = useState(false);
  const [showDayBar, setShowDayBar] = useState(false);
  const [selectedMonthForWeeks, setSelectedMonthForWeeks] = useState(null);
  const [selectedMonthForDays, setSelectedMonthForDays] = useState(null);
  const [isWeeklyView, setIsWeeklyView] = useState(false);
  const [isDailyView, setIsDailyView] = useState(false);
  const [weekRangesWithDates, setWeekRangesWithDates] = useState([]);
  const [weeksInMonth, setWeeksInMonth] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [selectedWeekInMonth, setSelectedWeekInMonth] = useState(null);

  const [statsApi, setStatsApi] = useState(
    "prescription-stats", // 👈 change ONLY THIS
  );

  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ✅ MONTH CONFIGURATION
// ✅ MONTH CONFIGURATION - Updated to show all months
const months = [
  { name: "JAN", value: "01", disabled: false },
  { name: "FEB", value: "02", disabled: false },
  { name: "MAR", value: "03", disabled: false },
  { name: "APR", value: "04", disabled: false },
  { name: "MAY", value: "05", disabled: false },
  { name: "JUN", value: "06", disabled: false },
  { name: "JUL", value: "07", disabled: false },
  { name: "AUG", value: "08", disabled: false },
  { name: "SEP", value: "09", disabled: false },
  { name: "OCT", value: "10", disabled: false },
  { name: "NOV", value: "11", disabled: false },
  { name: "DEC", value: "12", disabled: false },
];

// ✅ DAY LIMITS - Updated for all months
const dayLimits = {
  "01": 31,
  "02": 28,
  "03": 31,
  "04": 30,
  "05": 31,
  "06": 30,
  "07": 31,
  "08": 31,
  "09": 30,
  "10": 31,
  "11": 30,
  "12": 31,
};

// ✅ Helper to check if month is in the future
const isFutureMonth = (monthValue, year = "2026") => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  
  // If year is in the future, all months are future
  if (parseInt(year) > currentYear) return true;
  
  // If year is current year, check if month is greater than current month
  if (parseInt(year) === currentYear) {
    return parseInt(monthValue) > currentMonth;
  }
  
  // If year is in the past, no months are future
  return false;
};

  // ✅ HELPER: GET DAYS IN MONTH
  const getDaysInMonth = (month, year) => {
    const monthKey = String(month).padStart(2, "0");
    if (dayLimits[monthKey]) {
      return Array.from({ length: dayLimits[monthKey] }, (_, i) => i + 1);
    }
    const daysCount = new Date(year, month, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  // ✅ EXCEL DOWNLOAD FUNCTION
  const downloadExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = leaderboardData.map((item, index) => {
        const baseData = {
          Rank: index + 1,
          Name:
            activeTab === "MR"
              ? item.USERNAME || item.MrName || "-"
              : item.TeamName || item.TEAMNAME || "-",
        };

        // Add Team column only for MR
        if (activeTab === "MR") {
          baseData["Team"] = item.TEAMNAME || item.TeamName || "-";
        }

        // Add brand counts
        baseData["1 Brand"] = item?.brandCounts?.brand1 || 0;
        baseData["2 Brands"] = item?.brandCounts?.brand2 || 0;
        baseData["3 Brands"] = item?.brandCounts?.brand3 || 0;

        // Add score
        baseData[activeTab === "MR" ? "Runs" : "Score"] =
          item.TotalScore || item.Runs || item.teamScore || 0;

        return baseData;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 8 }, // Rank
        { wch: 25 }, // Name
      ];

      if (activeTab === "MR") {
        columnWidths.push({ wch: 20 }); // Team
      }

      columnWidths.push(
        { wch: 10 }, // 1 Brand
        { wch: 10 }, // 2 Brands
        { wch: 10 }, // 3 Brands
        { wch: 12 }, // Runs/Score
      );

      worksheet["!cols"] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Generate filename
      let sheetName = `${activeTab}_Rank`;
      if (selectedDay && selectedDay !== "TOTAL") {
        sheetName += `_Day_${selectedDay}`;
      } else if (selectedWeekInMonth) {
        sheetName += `_Week_${selectedWeekInMonth}`;
      } else if (selectedDay === "TOTAL") {
        sheetName += `_Monthly_Total`;
      }
      sheetName += `_${
        months.find((m) => m.value === selectedMonth)?.name || ""
      }`;

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName.substring(0, 31),
      ); // Excel sheet name limit

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Save file
      const fileName = `${sheetName}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      saveAs(data, fileName);

      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel file");
    }
  };

  // ✅ HELPER: GET WEEKS IN MONTH
  const getWeeksInMonth = (month, year, dayLimit = null) => {
    const weeks = [];
    const lastDayOfMonth = dayLimit || new Date(year, month, 0).getDate();

    let currentWeekStart = 1;
    let weekNumber = 1;

    while (currentWeekStart <= lastDayOfMonth) {
      const weekStartDate = new Date(year, month - 1, currentWeekStart);
      const dayOfWeek = weekStartDate.getDay();

      const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
      let weekEndDay = currentWeekStart + daysUntilSaturday;

      if (weekEndDay > lastDayOfMonth) {
        weekEndDay = lastDayOfMonth;
      }

      weeks.push({
        weekNumber: weekNumber,
        startDay: currentWeekStart,
        endDay: weekEndDay,
        label: `W${weekNumber}`,
      });

      currentWeekStart = weekEndDay + 1;
      weekNumber++;
    }

    return weeks;
  };

  // ✅ GET BUSINESS UNIT FROM sessionStorage
  useEffect(() => {
    const storedBusinessUnit = sessionStorage.getItem("BusinessUnit");
    if (storedBusinessUnit) {
      setBusinessUnit(storedBusinessUnit);
    }
  }, []);

  // ✅ FETCH OVERALL DATA
  const fetchOverallData = async () => {
    try {
      setLoading(true);

      let endpoint;
      if (activeTab === "MR") {
        endpoint = `http://localhost:7501/api/getMrRank/${businessUnit}`;
      } else {
        endpoint = `http://localhost:7501/api/getAllTeamRank`;
      }

      const response = await axios.get(endpoint);
      if (response.data.success) {
        setLeaderboardData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching overall data:", error);
      toast.error("Failed to fetch leaderboard");
      setLoading(false);
    }
  };

  const fetchStats = async (month = null, year = null) => {
    try {
      setStatsLoading(true);
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const res = await axios.get(
        `http://localhost:7501/api/${statsApi}`,
        { params },
      );
      if (res.data.success) setStatsData(res.data);

      setStatsLoading(false);
    } catch (error) {
      console.error("Stats fetch error:", error);
      toast.error("Failed to load stats");
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (businessUnit) {
      fetchOverallData();
      fetchStats();
    }
  }, [businessUnit, activeTab, statsApi]); // 👈 statsApi dependency is KEY

  // ✅ FETCH WEEKLY DATA IN MONTH (W1, W2, W3, W4)
  const fetchWeeklyDataInMonth = async (weekData, month, year) => {
    try {
      setLoading(true);

      const apiEndpoint =
        activeTab === "MR"
          ? "getWeekRangeLeaderboard"
          : "teamWeekRangeLeaderboard";

      const response = await axios.get(
        `http://localhost:7501/api/${apiEndpoint}`,
        {
          params: {
            startDay: weekData.startDay,
            endDay: weekData.endDay,
            month: month,
            year: year,
            businessUnit: businessUnit,
          },
        },
      );

      if (response.data.success) {
        setLeaderboardData(response.data.data);
        setSelectedWeekInMonth(weekData.weekNumber);
        setSelectedDay(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching weekly data:", error);
      toast.error("Failed to fetch weekly leaderboard");
      setLoading(false);
    }
  };

  // ✅ FETCH DAILY DATA
  const fetchDailyData = async (day, month, year) => {
    try {
      setLoading(true);

      const apiEndpoint =
        activeTab === "MR" ? "getDailyLeaderboard" : "getDailyTeamLeaderboard";

      const response = await axios.get(
        `http://localhost:7501/api/${apiEndpoint}`,
        {
          params: {
            day: day,
            month: month,
            year: year,
            businessUnit: businessUnit,
          },
        },
      );

      if (response.data.success) {
        setLeaderboardData(response.data.data);
        setIsDailyView(true);
        setSelectedDay(day);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching daily data:", error);
      toast.error("Failed to fetch daily leaderboard");
      setLoading(false);
    }
  };

// ✅ FETCH MONTHLY TOTAL — accepts direct monthValue to avoid stale state
const handleMonthlyTotal = async (monthValue = selectedMonth) => {
  try {
    setLoading(true);

    const year = "2026";
    const apiEndpoint =
      activeTab === "MR"
        ? "getMonthlyLeaderboard"
        : "getMonthlyTeamLeaderboard";

    const response = await axios.get(
      `http://localhost:7501/api/${apiEndpoint}`,
      {
        params: {
          month: monthValue,
          year: year,
          businessUnit: businessUnit,
        },
      },
    );

    if (response.data.success) {
      setLeaderboardData(response.data.data);
      setSelectedDay("TOTAL");
      setSelectedWeekInMonth(null);
    }
    setLoading(false);
  } catch (error) {
    console.error("❌ Error fetching monthly total:", error);
    toast.error("Failed to fetch monthly total");
    setLoading(false);
  }
};

 
// ✅ HANDLE MONTH CLICK
// const handleMonthClick = (monthValue) => {
//   if (selectedMonthForDays === monthValue && showDayBar) {
//     setShowDayBar(false);
//     setSelectedMonthForDays(null);
//     setIsDailyView(false);
//     setSelectedDay(null);
//     setSelectedWeekInMonth(null);
//     setDaysInMonth([]);
//     setWeeksInMonth([]);
//     fetchOverallData();
//     fetchStats();
//   } else {
//     setSelectedMonth(monthValue);
//     setSelectedMonthForDays(monthValue);
//     setShowDayBar(true);
//     setSelectedDay("TOTAL");        // ← ADD THIS: pre-select TOTAL
//     setSelectedWeekInMonth(null);
//     setIsDailyView(false);

//     const year = "2026";

//     const monthKey = String(parseInt(monthValue)).padStart(2, "0");
//     const dayLimit = dayLimits[monthKey];
//     let days;

//     if (dayLimit) {
//       days = Array.from({ length: dayLimit }, (_, i) => i + 1);
//     } else {
//       const daysCount = new Date(year, parseInt(monthValue), 0).getDate();
//       days = Array.from({ length: daysCount }, (_, i) => i + 1);
//     }

//     setDaysInMonth(days);

//     const weeks = getWeeksInMonth(parseInt(monthValue), year, dayLimit);
//     setWeeksInMonth(weeks);

//     // ← CHANGE: fetch monthly total immediately instead of overall
//     handleMonthlyTotal(monthValue);
//     fetchStats(parseInt(monthValue), String(year));
//   }
// };


// ✅ HANDLE MONTH CLICK - Updated to check if month is disabled
const handleMonthClick = (monthValue) => {
  // Check if month is disabled (future month)
  if (isFutureMonth(monthValue)) {
    toast.warning("This month is not yet available");
    return;
  }

  if (selectedMonthForDays === monthValue && showDayBar) {
    setShowDayBar(false);
    setSelectedMonthForDays(null);
    setIsDailyView(false);
    setSelectedDay(null);
    setSelectedWeekInMonth(null);
    setDaysInMonth([]);
    setWeeksInMonth([]);
    fetchOverallData();
    fetchStats();
  } else {
    setSelectedMonth(monthValue);
    setSelectedMonthForDays(monthValue);
    setShowDayBar(true);
    setSelectedDay("TOTAL");
    setSelectedWeekInMonth(null);
    setIsDailyView(false);

    const year = "2026";

    const monthKey = String(parseInt(monthValue)).padStart(2, "0");
    const dayLimit = dayLimits[monthKey];
    let days;

    if (dayLimit) {
      days = Array.from({ length: dayLimit }, (_, i) => i + 1);
    } else {
      const daysCount = new Date(year, parseInt(monthValue), 0).getDate();
      days = Array.from({ length: daysCount }, (_, i) => i + 1);
    }

    setDaysInMonth(days);

    const weeks = getWeeksInMonth(parseInt(monthValue), year, dayLimit);
    setWeeksInMonth(weeks);

    handleMonthlyTotal(monthValue);
    fetchStats(parseInt(monthValue), String(year));
  }
};

  // ✅ HANDLE DAY SELECT
  const handleDaySelect = (day) => {
    const year = "2026";
    setSelectedDay(day);
    setSelectedWeekInMonth(null);
    fetchDailyData(day, selectedMonth, year);
  };

  // ✅ HANDLE WEEK IN MONTH SELECT
  const handleWeekInMonthSelect = (weekData) => {
    const year = "2026";
    fetchWeeklyDataInMonth(weekData, selectedMonth, year);
  };

  const handleTabChange = (tab) => {
    // 🚫 If clicking the same tab again → do NOTHING
    if (tab === activeTab) return;

    setActiveTab(tab);

    // Reset filters ONLY when tab actually changes
    setShowDayBar(false);
    setSelectedMonthForDays(null);
    setIsDailyView(false);
    setSelectedDay(null);
    setSelectedWeekInMonth(null);
    setWeeksInMonth([]);
    setDaysInMonth([]);

    // Clear leaderboard only because a NEW fetch will happen
    setLeaderboardData([]);
  };

  // ✅ INITIAL LOAD & TAB CHANGE
  useEffect(() => {
    if (businessUnit) {
      fetchOverallData();
    }
  }, [businessUnit, activeTab]);

  return (
    <div className="grid grid-cols-2 absolute max-h-[120vh]">
      <Sidebar />
      <div
        className="sm:w-[85vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[100vh] sm:overflow-hidden"
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
            {/* <div className="overflow-y-auto max-h-screen sm:w-full w-full rounded-2xl shadow-md"> */}
            <div className="sm:w-full w-full rounded-2xl shadow-md">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-[60vh]">
                    <RotatingLines
                      visible={true}
                      height="56"
                      width="56"
                      strokeColor="purple"
                      strokeWidth="5"
                      animationDuration="0.75"
                      ariaLabel="rotating-lines-loading"
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    {/* ✅ TAB SELECTOR (MR RANK / TEAM RANK) */}
                    {/* ✅ TAB SELECTOR WITH EXCEL BUTTON */}
                    {statsData && (
                      <div className="my-6 px-6">
                        {/* <h2 className="text-lg font-bold text-purple-700 mb-4 capitalize">
      {statsData.metric} — Last 7 Days
    </h2> */}

                        <div className="flex flex-wrap justify-center gap-4">
                          {/* TOTAL */}
                          <div className="bg-white rounded-xl shadow-md px-6 py-4 min-w-[140px] text-center">
                            <p className="text-sm font-semibold text-gray-500">
                              {selectedMonthForDays
                                ? `${months.find((m) => m.value === selectedMonthForDays)?.name} approved`
                                : "Total approved"}
                              <br />
                              {statsData.metric}
                            </p>
                            <p className="text-4xl font-bold text-purple-700">
                              {statsData.total}
                            </p>
                          </div>

                          {/* LAST 7 DAYS */}
                          {statsData.last7Days.map((d, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-xl shadow-md px-5 py-4 min-w-[110px] text-center"
                            >
                              <p className="text-xs font-semibold text-gray-500">
                                {new Date(d.date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-3xl font-bold text-pink-600">
                                {d.count}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="relative flex justify-around items-center border-2 border-gray-300 py-2">
                      {/* Tab Buttons - Centered */}
                      <button
                        onClick={() => handleTabChange("MR")}
                        className={`text-sm font-bold px-6 py-2 transition-all ${
                          activeTab === "MR" ? "text-pink-500" : "text-black"
                        }`}
                      >
                        MR RANK
                      </button>
                      <button
                        onClick={() => handleTabChange("TEAM")}
                        className={`text-sm font-bold px-6 py-2 transition-all ${
                          activeTab === "TEAM" ? "text-pink-500" : "text-black"
                        }`}
                      >
                        TEAM RANK
                      </button>

                      {/* ✅ EXCEL BUTTON - Absolute Position Right */}
                      {/* <button
                        onClick={downloadExcel}
                        disabled={leaderboardData.length === 0}
                        className={`absolute right-4 flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-md ${
                          leaderboardData.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white hover:shadow-lg active:scale-95"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      
                      </button> */}
                      <button
                        onClick={downloadExcel}
                        disabled={leaderboardData.length === 0}
                        className={`absolute right-4 flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-md ${
                          leaderboardData.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white hover:shadow-lg active:scale-95"
                        }`}
                      >
                        <RiFileExcel2Fill className="text-xl" />
                      </button>
                    </div>

                    {/* ✅ MONTHLY HEADER BAR */}
                  {/* ✅ MONTHLY HEADER BAR - Updated with disabled state */}
<div className="flex justify-around items-center border-b-2 border-gray-300">
  {months.map((month) => {
    const isDisabled = isFutureMonth(month.value);
    return (
      <button
        key={month.value}
        onClick={() => handleMonthClick(month.value)}
        disabled={isDisabled}
        className={`text-sm font-bold px-6 py-2 rounded-lg transition-all ${
          selectedMonthForDays === month.value && showDayBar && !isDisabled
            ? "text-pink-500 bg-pink-500 bg-opacity-20"
            : isDisabled
            ? "text-gray-400 cursor-not-allowed hover:bg-transparent"
            : "text-black hover:bg-white hover:bg-opacity-10"
        }`}
      >
        {month.name}
      </button>
    );
  })}
</div>

                    {/* ✅ DAY/WEEK BAR */}
                    {showDayBar && (
                      <div className="bg-gradient-to-r from-pink-600 to-purple-600 py-1 border-b-2 border-gray-300">
                        <div className="flex items-center px-4 overflow-x-auto scrollbar-thin justify-start scrollbar-thumb-purple-400 scrollbar-track-gray-200 space-x-2">
                          {/* DAY BUTTONS */}
                          {daysInMonth.map((day) => (
                            <button
                              key={day}
                              onClick={() => handleDaySelect(day)}
                              className={`text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                                selectedDay === day
                                  ? "bg-yellow-400 text-purple-800"
                                  : "bg-white bg-opacity-10 text-white hover:bg-opacity-20"
                              }`}
                            >
                              {day}
                            </button>
                          ))}

                          {/* WEEK BUTTONS (W1, W2, W3, W4) */}
                          {weeksInMonth.map((week) => (
                            <button
                              key={week.weekNumber}
                              onClick={() => handleWeekInMonthSelect(week)}
                              className={`text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                                selectedWeekInMonth === week.weekNumber
                                  ? "bg-yellow-400 text-purple-800"
                                  : "bg-blue-400 bg-opacity-30 text-blue-100 hover:bg-opacity-50"
                              }`}
                            >
                              {week.label}
                            </button>
                          ))}

                          {/* TOTAL BUTTON */}
                          <button
                            onClick={handleMonthlyTotal}
                            className={`text-xs font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                              selectedDay === "TOTAL"
                                ? "bg-yellow-400 text-purple-800"
                                : "bg-yellow-400 bg-opacity-30 text-yellow-100 hover:bg-opacity-50"
                            }`}
                          >
                            TOTAL
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ✅ LEADERBOARD TABLE */}
                    {/* <div className="sm:mx-8 mt-2 px-2 pl-0 sm:px-8 py-0 overflow-auto">
                      <div className="sm:h-[70vh] inline-block min-w-full shadow rounded-lg"> */}
                    <div className="sm:mx-8 mt-2 px-2 pl-0 sm:px-8 py-0">
                      {/* ✅ SINGLE SCROLL CONTAINER */}
                      <div className="h-[55vh] overflow-y-auto shadow rounded-lg pb-6">
                        <table
                          className="min-w-full leading-normal"
                          id="leaderboardTable"
                        >
                          <thead>
                            <tr>
                              <th className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                                Rank
                              </th>
                              <th className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                                {activeTab === "MR"
                                  ? "Player Name"
                                  : "Team Name"}
                              </th>
                              {activeTab === "MR" && (
                                <th className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                                  Team
                                </th>
                              )}
                              {/* ✅ FIXED: BRAND HEADER WITH PROPER ALIGNMENT */}
                              <th className="px-4 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                                <div className="flex justify-around items-center gap-4">
                                  <span>1B</span>
                                  <span>2B</span>
                                  <span>3B</span>
                                </div>
                              </th>
                              <th className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                                {activeTab === "MR" ? "Total" : "Total"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboardData.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={activeTab === "MR" ? "5" : "4"}
                                  className="px-6 py-8 text-center text-gray-500"
                                >
                                  No data available for selected period
                                </td>
                              </tr>
                            ) : (
                              leaderboardData.map((item, index) => (
                                <tr
                                  key={item._id || index}
                                  className={`border ${
                                    index % 2 === 0
                                      ? "bg-pink-200"
                                      : "bg-pink-100"
                                  } hover:bg-pink-300 transition-colors`}
                                >
                                  <td className="px-6 py-2 text-center text-sm font-bold text-black">
                                    {index + 1}
                                  </td>
                                  <td className="px-10 py-2 text-center text-sm text-black capitalize">
                                    {activeTab === "MR"
                                      ? item.USERNAME || item.MrName || "-"
                                      : item.TeamName || item.TEAMNAME || "-"}
                                  </td>
                                  {activeTab === "MR" && (
                                    <td className="px-10 py-2 text-center text-sm text-black">
                                      {item.TEAMNAME || item.TeamName || "-"}
                                    </td>
                                  )}
                                  {/* ✅ FIXED: BRAND DATA WITH PROPER ALIGNMENT */}
                                  <td className="px-4 py-2 text-center text-sm text-black">
                                    <div className="flex justify-around items-center gap-4">
                                      <span className="font-semibold">
                                        {item?.brandCounts?.brand1 || 0}
                                      </span>
                                      <span className="font-semibold">
                                        {item?.brandCounts?.brand2 || 0}
                                      </span>
                                      <span className="font-semibold">
                                        {item?.brandCounts?.brand3 || 0}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-10 py-2 text-center text-sm font-bold text-black">
                                    {item.TotalScore ||
                                      item.Runs ||
                                      item.teamScore ||
                                      0}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ✅ INFO BADGE */}
                    {selectedDay && selectedDay !== "TOTAL" && (
                      <div className="text-center mt-4 mb-4">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-4 py-2 rounded-full">
                          {activeTab === "MR" ? "MR Rank" : "Team Rank"} -{" "}
                          {months.find((m) => m.value === selectedMonth)?.name}{" "}
                          - Day {selectedDay}
                        </span>
                      </div>
                    )}

                    {selectedWeekInMonth && (
                      <div className="text-center mt-4 mb-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-4 py-2 rounded-full">
                          {activeTab === "MR" ? "MR Rank" : "Team Rank"} -{" "}
                          {months.find((m) => m.value === selectedMonth)?.name}{" "}
                          - Week {selectedWeekInMonth}
                        </span>
                      </div>
                    )}

                    {selectedDay === "TOTAL" && (
                      <div className="text-center mt-4 mb-4">
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-4 py-2 rounded-full">
                          {activeTab === "MR" ? "MR Rank" : "Team Rank"} -{" "}
                          {months.find((m) => m.value === selectedMonth)?.name}{" "}
                          - Monthly Total
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Leaderboard;



