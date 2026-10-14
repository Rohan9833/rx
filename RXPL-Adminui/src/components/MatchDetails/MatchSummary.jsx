import React, { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BackGroundImg from "../../assets/bg.png";
import { MdOutlineModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

const MatchSummary = () => {
  const pageName = "Match Summary";
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
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [selectedOpponentTeam, setSelectedOppTeam] = useState("");
  const [selectOpponentTeam, setSelectOpponentTeam] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(null);

  const [matchSchedules, setMatchSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const Id = sessionStorage.getItem("UserId");
  const BusinessUnit = sessionStorage.getItem("BusinessUnit");

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

  const filteredData = uploadData.filter((upload) => {
    const parsedCreationDate = parseDate(upload.startDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from) from.setHours(0, 0, 0, 0); // Start of the day
    if (to) to.setHours(23, 59, 59, 999); // End of the day
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
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getMatchSchedules/${BusinessUnit}`
        );
        setMatchSchedules(response.data.schedules);
      } catch (error) {
        toast.error("Failed to fetch schedules");
      }
    };
    fetchSchedules();
  }, []);

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    const sDate = new Date(schedule.startDate);
    const eDate = new Date(schedule.endDate);
    setEditStartDate(sDate.toISOString().split("T")[0]);
    setEditEndDate(eDate.toISOString().split("T")[0]);
    setEditModalOpen(true);
  };

  const handleDeleteSchedule = (schedule) => {
    setDeletingSchedule(schedule);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:7501/api/deleteMatchSchedule`,
        {
          data: {
            businessUnit: BusinessUnit,
            scheduleId: deletingSchedule._id,
          },
        }
      );

      if (response.data.success) {
        toast.success("Schedule deleted successfully");
        setDeleteModalOpen(false);
        setDeletingSchedule(null);

        // Refresh schedules
        const res = await axios.get(
          `http://localhost:7501/api/getMatchSchedules/${BusinessUnit}`
        );
        if (res.data.success) {
          setMatchSchedules(res.data.schedules);
        }
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingSchedule(null);
  };

  const handleSubmitSchedule = async () => {
    if (!startDate || !endDate) {
      return toast.error("Please select both start and end dates");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return toast.error("End date must be after start date");
    }

    setScheduleLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:7501/api/createMatchSchedule`,
        {
          userId: Id,
          startDate,
          endDate,
          businessUnit: BusinessUnit,
        }
      );

      if (response.data.success) {
        toast.success("Match schedule created successfully");
        setStartDate("");
        setEndDate("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getMatchSchedules/${BusinessUnit}`
        );
        if (response.data.success) {
          setMatchSchedules(response.data.schedules);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    if (BusinessUnit) {
      fetchSchedules();
    }
  }, [BusinessUnit]);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSaveEdit = async () => {
    if (!editStartDate || !editEndDate) {
      return toast.error("Please fill all dates");
    }

    try {
      const response = await axios.put(
        `http://localhost:7501/api/editMatchSchedule`,
        {
          businessUnit: BusinessUnit,
          scheduleId: editingSchedule._id,
          startDate: editStartDate,
          endDate: editEndDate,
        }
      );

      if (response.data.success) {
        toast.success("Schedule updated");
        setEditModalOpen(false);
        // Refresh schedules
        const res = await axios.get(
          `http://localhost:7501/api/getMatchSchedules/${BusinessUnit}`
        );
        setMatchSchedules(res.data.schedules);
      }
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getAllMatches`
        );
        // console.log("Data:", response.data);

        setUploadData(response.data.reverse());
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
              className="border-pink-500 border-2 bg-cover bg-no-repeat mx-auto max-w-screen sm:w-[80vw] h-[90vh] relative sm:left-[10px] sm:bottom-5"
            >
              {/* ✅ Changed: Removed overflow-y-auto max-h-screen */}
              <div className="sm:w-full w-full rounded-2xl shadow-md p-4">
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
                  <div>
                    {/* Create Match Schedule Section - This stays fixed */}
                    <div className="p-7 mt-[-30px]">
                      <div className="bg-white p-10 rounded-[40px] shadow-sm border w-full max-w-full">
                        <h2 className="text-[22px] font-bold text-[#1F2D3D] mb-8">
                          Create Match Schedule
                        </h2>

                        <div className="flex flex-row items-end gap-6">
                          <div className="flex-1">
                            <label className="text-sm font-bold text-[#4B5A6B] mb-1 block">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-5 py-2 border rounded-2xl bg-[#F9FAFB] outline-none"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="text-sm font-bold text-[#4B5A6B] mb-1 block">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full px-5 py-2 border rounded-2xl bg-[#F9FAFB] outline-none"
                              min={startDate}
                            />
                          </div>

                          <button
                            onClick={handleSubmitSchedule}
                            disabled={scheduleLoading}
			    //disabled={true}
                            className="flex-1 py-2 bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white text-lg font-bold rounded-2xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {scheduleLoading ? "Creating..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Match Schedules Table - Only this scrolls */}
                    <div className="mb-8 mx-7">
                      <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                          <h2 className="text-2xl font-bold text-[#1F2D3D]">
                            Match Schedules
                          </h2>
                          <span className="bg-[#F1F4F8] text-[#4B5A6B] px-4 py-1 rounded-full text-sm font-bold">
                            {matchSchedules.length} Schedules
                          </span>
                        </div>

                        {/* ✅ Only this div scrolls */}
                        <div
                          className="overflow-y-auto overflow-x-hidden"
                          style={{ maxHeight: "300px" }}
                        >
                          <table className="min-w-full">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  SR.NO
                                </th>
                                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  START DATE
                                </th>
                                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  END DATE
                                </th>
                                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  STATUS
                                </th>
                                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  ACTION
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {matchSchedules.map((schedule, index) => {
                                const today = new Date();
                                const start = new Date(schedule.startDate);
                                const end = new Date(schedule.endDate);
                                const isActive = today >= start && today <= end;
                                const isPast = today > end;

                                return (
                                  <tr
                                    key={schedule._id}
                                    className="bg-white border-b hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                                      {index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                                      {formatDate(schedule.startDate)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                                      {formatDate(schedule.endDate)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          isActive
                                            ? "bg-green-100 text-green-800"
                                            : isPast
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                      >
                                        {isActive
                                          ? "Active"
                                          : isPast
                                          ? "Completed"
                                          : "Upcoming"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                      <div className="flex items-center justify-center gap-3">
                                        <button
                                          onClick={() =>
                                            handleEditSchedule(schedule)
                                          }
                                          className="text-orange-500 font-semibold hover:text-orange-700"
                                        >
                                          <MdOutlineModeEdit />
                                        </button>
                                        <button
                                          onClick={() =>
                                            !isPast &&
                                            handleDeleteSchedule(schedule)
                                          }
                                          disabled={isPast}
                                          className={`font-semibold ${
                                            isPast
                                              ? "text-gray-300 cursor-not-allowed"
                                              : "text-red-500 hover:text-red-700 cursor-pointer"
                                          }`}
                                          title={
                                            isPast
                                              ? "Cannot delete completed schedules"
                                              : "Delete schedule"
                                          }
                                        >
                                          <RiDeleteBin6Line />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Edit Schedule Modal */}
                    {editModalOpen && (
                      <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-[40px] p-10 w-full max-w-md relative">
                          <button
                            onClick={() => setEditModalOpen(false)}
                            className="absolute top-6 right-6 bg-[#F9FAFB] hover:bg-[#E0E6ED] text-[#4B5A6B] rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold"
                          >
                            ×
                          </button>

                          <h2 className="text-[28px] font-bold text-[#1F2D3D] mb-8">
                            Edit Match Schedule
                          </h2>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-bold text-[#4B5A6B] mb-1 block">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={editStartDate}
                                onChange={(e) =>
                                  setEditStartDate(e.target.value)
                                }
                                className="w-full px-5 py-2 border rounded-2xl bg-[#F9FAFB] outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-bold text-[#4B5A6B] mb-1 block">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={editEndDate}
                                onChange={(e) =>
                                  setEditEndDate(e.target.value)
                                }
                                className="w-full px-5 py-2 border rounded-2xl bg-[#F9FAFB] outline-none"
                                min={editStartDate}
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleSaveEdit}
                            className="w-full mt-10 py-2 bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white text-lg font-bold rounded-2xl shadow-lg"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteModalOpen && (
                      <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-200">
                          <h3 className="text-lg font-bold text-[#1F2D3D] mb-2">
                            Delete Schedule
                          </h3>

                          <p className="text-sm text-[#4B5A6B] mb-6">
                            Are you sure you want to delete this schedule?
                            <br />
                            <span className="font-semibold">
                              {deletingSchedule &&
                                formatDate(deletingSchedule.startDate)}{" "}
                              -{" "}
                              {deletingSchedule &&
                                formatDate(deletingSchedule.endDate)}
                            </span>
                          </p>

                          <div className="flex justify-end gap-3">
                            <button
                              onClick={cancelDelete}
                              className="px-4 py-2 rounded-lg bg-[#F1F4F8] text-[#4B5A6B] font-medium hover:bg-[#E0E6ED]"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={confirmDelete}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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

export default MatchSummary;

