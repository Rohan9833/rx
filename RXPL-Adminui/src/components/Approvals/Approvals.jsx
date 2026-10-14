import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import toast, { Toaster } from "react-hot-toast";
import Header from "../Header/Header";
import axios from "axios";
import { saveAs } from "file-saver";
import { RotatingLines } from "react-loader-spinner";
import BackGroundImg from "../../assets/bg.png";

const ApprovalsPage = () => {
  const pageName = "Approval Page";
  // const { id: userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [rxplFormData, setRxplFormData] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentFormId, setCurrentFormId] = useState("");
  const [mrId, setMrId] = useState("");

  const [reason, setReason] = useState("");
  const [usernameOptions, setUsernameOptions] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [hqOptions, setHqOptions] = useState([]);
  const [selectedHQ, setSelectedHQ] = useState("");
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

  const [selectedChallenger, setSelectedChallenger] = useState("");
  const [selectChallengerOption, setSelectChallengerOption] = useState([]);
  const [selectedPreviousTeam, setSelectedPrevTeam] = useState("");
  const [selectPreviousTeam, setSelectPreviousTeam] = useState([]);

  const [pointsOptions, setPointsOptions] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState("");

  const [selectedOpponentTeam, setSelectedOppTeam] = useState("");
  const [selectOpponentTeam, setSelectOpponentTeam] = useState([]);

  const [todayDate, setTodayDate] = useState("");

  const Id = sessionStorage.getItem("UserId");

  const [searchQuery, setSearchQuery] = useState("");

  const [showMoreColumns, setShowMoreColumns] = useState(false);

  const handleToggleColumns = (index) => {
    setShowMoreColumns((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // const MRID = sessionStorage.getItem("Id");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getUploadData/${Id}`
        );
        setRxplFormData(response.data);
        const uniqueUsernames = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.USERNAME;
              }
            })
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setUsernameOptions(uniqueUsernames);
        const uniqueHQs = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.HQ;
              }
            })
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setHqOptions(uniqueHQs);
        const uniqueZones = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.ZONE;
              }
            })
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setZONEOptions(uniqueZones);
        const uniquePoints = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.Points)
            )
          ),
        ].filter(Boolean); // Exclude undefined or empty
        setPointsOptions(uniquePoints);
        const uniqueRegions = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.REGION;
              }
            })
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setRegionOptions(uniqueRegions);
        const uniqueTeamNames = [
          ...new Set(
            response.data.map((mr) => {
              if (mr.MRUploadedData.length > 0) {
                return mr.TEAMNAME;
              }
            })
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setTeamNameOptions(uniqueTeamNames);
        const uniqueSpecialities = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.Specility)
            )
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setSpecialityOptions(uniqueSpecialities);
        const uniqueBrandNames = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.map((u) => u.BrandName)
            )
          ),
        ].filter(Boolean); // Exclude undefined or empty USERNAMEs
        setBrandNameOptions(uniqueBrandNames);
        const uniqueChallenger = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap(
                (u) =>
                  u.isTournament
                    ? [u.role, "Tournament"] // Add u.role and "Tournament" if isTournament is true
                    : [u.role] // Add only u.role otherwise
              )
            )
          ),
        ].filter(Boolean); // Exclude undefined or empty
        setSelectChallengerOption(uniqueChallenger);
        const uniquePreviousTeam = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap(
                (u) =>
                  u.role === "Initiator"
                    ? [u.teamA] // Add u.role and "Tournament" if isTournament is true
                    : [u.teamB] // Add only u.role otherwise
              )
            )
          ),
        ].filter(Boolean);
        setSelectPreviousTeam(uniquePreviousTeam);
        const uniqueOpponentTeam = [
          ...new Set(
            response.data.flatMap((mr) =>
              mr.MRUploadedData.flatMap(
                (u) =>
                  u.role === "Initiator"
                    ? [u.teamB] // Add u.role and "Tournament" if isTournament is true
                    : [u.teamA] // Add only u.role otherwise
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
    const today = new Date();
    const formattedToday = today
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    setTodayDate(formattedToday);
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0); // Normalize the date to midnight
    return date;
  };

  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => setToDate(e.target.value);

  // const filteredData = rxplFormData.flatMap((upload) => {
  //   const isUsernameMatch =
  //     !selectedUsername || upload.USERNAME === selectedUsername;
  //   const isHQMatch = !selectedHQ || upload.HQ === selectedHQ;
  //   const isZONEMatch = !selectedZONE || upload.ZONE === selectedZONE;
  //   const isRegionMatch = !selectedRegion || upload.REGION === selectedRegion;
  //   const isTeamNameMatch =
  //     !selectedTeamName || upload.TEAMNAME === selectedTeamName;

  //   if (!isUsernameMatch) return [];
  //   if (!isHQMatch) return [];
  //   if (!isZONEMatch) return [];
  //   if (!isRegionMatch) return [];
  //   if (!isTeamNameMatch) return [];

  //   const filteredUploads = upload.MRUploadedData.filter((data) => {
  //     const isDrNameMatch =
  //       !searchQuery ||
  //       data.DrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       data.ScCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       upload.TEAMNAME?.toLowerCase().includes(searchQuery.toLowerCase());
  //     const isSpecialityMatch =
  //       !selectedSpeciality || data.Specility === selectedSpeciality;
  //     const isBrandNameMatch =
  //       !selectedBrandName || data.BrandName === selectedBrandName;

  //     const parsedCreationDate = parseDate(data.DateOfCreation);

  //     const from = fromDate ? new Date(fromDate) : null;
  //     const to = toDate ? new Date(toDate) : null;

  //     if (from) from.setHours(0, 0, 0, 0); // Start of the day
  //     if (to) to.setHours(23, 59, 59, 999); // End of the day

  //     const isWithinDateRange =
  //       (!from || parsedCreationDate >= from) &&
  //       (!to || parsedCreationDate <= to);

  //     return (
  //       isSpecialityMatch &&
  //       isBrandNameMatch &&
  //       isDrNameMatch &&
  //       isWithinDateRange
  //     );
  //   });
  //   return filteredUploads.length
  //     ? [{ ...upload, MRUploadedData: filteredUploads }]
  //     : [];
  // });

  const filteredData = rxplFormData.flatMap((upload) => {
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
      const isRoleMatch = !selectedChallenger || data.role === selectedChallenger;
  
      // Strict team matching based on role
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
      const isDrNameMatch =
        !searchQuery ||
        data.DrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.ScCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        upload.TEAMNAME?.toLowerCase().includes(searchQuery.toLowerCase());
      const isSpecialityMatch =
        !selectedSpeciality || data.Specility === selectedSpeciality;
      const isBrandNameMatch =
        !selectedBrandName || data.BrandName === selectedBrandName;
      const isPointsMatch = !selectedPoints || data.Points === selectedPoints;
  
      const parsedCreationDate = parseDate(data.DateOfCreation);
  
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
  
      if (from) from.setHours(0, 0, 0, 0); // Start of the day
      if (to) to.setHours(23, 59, 59, 999); // End of the day
  
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


  const downloadInvoiceImage = async (imageUrl) => {
    try {
      await axios.post(`http://localhost:7501/api/getBillCount/${Id}`);
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

  const OpenModalForApproval = (upload, ObjId) => {
    setModalTitle(upload.Status === "Rejected" ? "Approved" : "Rejected");
    setMrId(ObjId);
    setShowModal(true);
    setCurrentFormId(upload._id);
  };

  const handleReason = (e) => {
    setReason(e.target.value);
  };

  const [btnDisable, setBtnDisable] = useState(false);

  const submitApprovalReport = async () => {
    setBtnDisable(true);
    try {
      const res = await axios.put(
        `http://localhost:7501/api/reject/${mrId}/${currentFormId}`,
        { reason, modalTitle }
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      toast.success("Status Updated Success", { duration: 2000 });
      setShowModal(false);
      setBtnDisable(false);
    } catch (error) {
      setBtnDisable(false);
      console.log(error);
      toast.error("Failed to Update Status", { duration: 2000 });
    }
  };

  const removeFilter = () => {
    setFromDate(""); // Clear start date
    setToDate(""); // Clear end date
    setSelectedUsername("");
    setSelectedHQ("");
    setSelectedZONE("");
    setSelectedRegion("");
    setSelectedTeamName("");
    setSelectedSpeciality("");
    setSelectedPoints("");
    setSelectedBrandName("");
    setSearchQuery("");
    setSelectedChallenger("");
    setSelectedPrevTeam("");
    setSelectedOppTeam("");
  };

  return (
    <>
      <Toaster />
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
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                        <>
                          <div className="">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={handleSearchChange}
                              placeholder="Search Doctor Name ,CustomerCode & TeamName"
                              className="sm:ml-5 px-4 py-2 w-[240px] sm:w-[420px] border-2 border-gray-500 text-sm sm:text-base"
                            />
                          </div>
                        </>
                        <div className="flex justify-center items-center">
                          <div className="flex justify-center items-center mr-4 mb-4">
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
                          <div className="flex justify-center items-center mr-4 mb-4">
                            <label
                              htmlFor="to-date"
                              className="block mt-2 text-xs sm:text-base font-bold text-center"
                            >
                              To
                            </label>
                            <input
                              type="date"
                              id="to-date"
                              value={toDate}
                              onChange={handleToDateChange}
                              className="mt-1 block w-[20vw] sm:w-[10vw] px-2 py-1 text-xs border-2 border-gray-300 focus:outline-none focus:ring-gray-300 focus:border-gray-300 sm:text-sm rounded-md cursor-pointer"
                            />
                          </div>
                          <div
                            className="sm:mr-16 mb-2 sm:mb-0"
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
                      </div>
                      <div className="w-full h-auto">
                        <div className="mx-auto overflow-y-auto max-w-screen sm:w-[80vw] relative ">
                          <div className="flex justify-start items-center gap-10">
                            <div className="sm:h-[70vh] inline-block sm:shadow sm:rounded-md w-full">
                              <table
                                className="min-w-full leading-normal hidden sm:block"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      SR.no
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DrName
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UploadDate
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Action
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Reason
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      ActionDate
                                    </th>

                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Specility
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
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                          <option
                                            key={brandName}
                                            value={brandName}
                                          >
                                            {brandName}
                                          </option>
                                        ))}
                                      </select>
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      UploadTime
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      No.Rxns
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      RxnDuration
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Score
                                    </th>
                                    <th className="min-w-[200px] px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Total Score
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                          <option
                                            key={prevTeam}
                                            value={prevTeam}
                                          >
                                            {prevTeam}
                                          </option>
                                        ))}
                                      </select>
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Mobile.No
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      CustomerCode
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      MRID
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                          <option
                                            key={username}
                                            value={username}
                                          >
                                            {username}
                                          </option>
                                        ))}
                                      </select>
                                    </th>
                                    <th className="px-20 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      TeamName
                                      <select
                                        className="px-2 py-1 border rounded text-sm"
                                        value={selectedTeamName}
                                        onChange={(e) =>
                                          setSelectedTeamName(e.target.value)
                                        }
                                      >
                                        <option value="">All</option>
                                        {teamNameOptions.map((teamName) => (
                                          <option
                                            key={teamName}
                                            value={teamName}
                                          >
                                            {teamName}
                                          </option>
                                        ))}
                                      </select>
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      DateOfCreation
                                    </th>
                                    <th className="px-10 py-2 border-2 border-gray-500 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Download
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredData
                                    .sort((a, b) => {
                                      const aDate =
                                        a.MRUploadedData.length > 0
                                          ? new Date(
                                              a.MRUploadedData[0].DateOfCreation
                                            )
                                          : new Date(0);
                                      const bDate =
                                        b.MRUploadedData.length > 0
                                          ? new Date(
                                              b.MRUploadedData[0].DateOfCreation
                                            )
                                          : new Date(0);
                                      return bDate - aDate;
                                    })
                                    .flatMap((item) =>
                                      item.MRUploadedData.map((upload) => ({
                                        ...upload,
                                        MRID: item.MRID,
                                        USERNAME: item.USERNAME,
                                        HQ: item.HQ,
                                        REGION: item.REGION,
                                        ZONE: item.ZONE,
                                        TeamName: item.TEAMNAME,
                                        ObjId: item._id,
                                      }))
                                    )
                                    .reverse() // Reverses the order for newest data at the top
                                    .map((upload, index, arr) => (
                                      <tr
                                        key={index}
                                        className="border bg-pink-200 even:bg-pink-100"
                                      >
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {arr.length - index}{" "}
                                          {/* Calculate reverse Sr. No. */}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.DrName || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.Points || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.DateOfUpload || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                            onClick={() =>
                                              OpenModalForApproval(
                                                upload,
                                                upload.ObjId
                                              )
                                            }
                                            className="ml-14 cursor-pointer"
                                          >
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path
                                              fill-rule="evenodd"
                                              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                            />
                                          </svg>
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.Status || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.Reason || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.ModifiedDate || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.Specility || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.BrandName || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.TimeOfUpload || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.NoRxns || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.RxnDuration || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {parseInt(upload.RxnDuration) *
                                            parseInt(upload.Points) *
                                            parseInt(upload.NoRxns)}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.Status === "Rejected"
                                            ? "0"
                                            : parseInt(upload.RxnDuration) *
                                              parseInt(upload.Points) *
                                              parseInt(upload.NoRxns)}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.role}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.role === "Initiator"
                                            ? upload.teamA
                                            : upload.teamB}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.role === "Initiator"
                                            ? upload.teamB
                                            : upload.teamA}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.MOBNO || "-"}
                                        </td>
                                        <td className="px-18 py-1  text-center text-sm text-black">
                                          {upload.ScCode || "-"}
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
                                          {upload.DateOfCreation || "-"}
                                        </td>
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
                              <table
                                className="min-w-full leading-normal sm:hidden text-xs"
                                id="doctorTable"
                              >
                                <thead>
                                  <tr>
                                    {/* <th className="px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                      SR.no
                                    </th>
                                    <th className="px-1 py-1 border-2 border-gray-500 bg-gray-100 text-left text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                      DrName
                                    </th>
                                    <th className="px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                      Points
                                    </th>
                                    <th className="px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                      Download
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
                                    <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold">
                                      Action
                                    </th>
                                    <th className="w-[10px] px-1 py-1 border-2 border-gray-500 bg-gray-100 text-center text-[9px] text-gray-600 uppercase tracking-wider font-semibold"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredData
                                    .sort((a, b) => {
                                      const aDate =
                                        a.MRUploadedData.length > 0
                                          ? new Date(
                                              a.MRUploadedData[0].DateOfCreation
                                            )
                                          : new Date(0);
                                      const bDate =
                                        b.MRUploadedData.length > 0
                                          ? new Date(
                                              b.MRUploadedData[0].DateOfCreation
                                            )
                                          : new Date(0);
                                      return bDate - aDate;
                                    })
                                    .flatMap((item) =>
                                      item.MRUploadedData.map((upload) => ({
                                        ...upload,
                                        MRID: item.MRID,
                                        USERNAME: item.USERNAME,
                                        HQ: item.HQ,
                                        REGION: item.REGION,
                                        ZONE: item.ZONE,
                                        TeamName: item.TEAMNAME,
                                        ObjId: item._id,
                                      }))
                                    )
                                    .reverse()
                                    .map((upload, index, arr) => (
                                      <React.Fragment key={index}>
                                        <tr className="border bg-pink-200 even:bg-pink-100">
                                          {/* <td className="px-1 py-1  text-center text-[9px] text-black">
                                            {arr.length - index}
                                          </td> */}
                                          {/* <td className="px-1 py-1  text-left text-[9px] text-black">
                                            {upload.DrName || "-"}
                                          </td>
                                          <td className="px-1 py-1  text-center text-[9px] text-black">
                                            {upload.Points || "-"}
                                          </td>
                                          <td className="px-1 py-1  flex justify-center items-center text-black">
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
                                          </td> */}
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
                                          <td className="flex justify-center items-center mt-2 px-1 py-1  text-center text-[9px] text-black">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="10"
                                              height="10"
                                              fill="currentColor"
                                              viewBox="0 0 16 16"
                                              onClick={() =>
                                                OpenModalForApproval(
                                                  upload,
                                                  upload.ObjId
                                                )
                                              }
                                              className="cursor-pointer"
                                            >
                                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                              <path
                                                fill-rule="evenodd"
                                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                              />
                                            </svg>
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
                                              className="bg-gray-100 px-1 py-2 text-[9px]"
                                            >
                                              <div className="flex flex-col gap-2">
                                                {/* <div>
                                                  <strong>
                                                    Date of Upload:
                                                  </strong>{" "}
                                                  {upload.DateOfUpload || "-"}
                                                </div> */}
                                                <div>
                                                  <strong>Status:</strong>{" "}
                                                  {upload.Status || "-"}
                                                </div>
                                                {/* <div className="flex items-center gap-1">
                                                  <strong>Action:</strong>
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="10"
                                                    height="10"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                    onClick={() =>
                                                      OpenModalForApproval(
                                                        upload,
                                                        upload.ObjId
                                                      )
                                                    }
                                                    className="cursor-pointer"
                                                  >
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path
                                                      fill-rule="evenodd"
                                                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                    />
                                                  </svg>
                                                </div> */}
                                                <div>
                                                  <strong>Reason:</strong>{" "}
                                                  {upload.Resaon || "-"}
                                                </div>
                                                <div>
                                                  <strong>ActionDate:</strong>{" "}
                                                  {upload.ModifiedDate || "-"}
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
                                                  <strong>No Rxns:</strong>{" "}
                                                  {upload.NoRxns || "-"}
                                                </div>
                                                {/* <div>
                                                  <strong>TimeOfUpload:</strong>{" "}
                                                  {upload.TimeOfUpload || "-"}
                                                </div> */}
                                                <div>
                                                  <strong>Rxn Duration:</strong>{" "}
                                                  {upload.RxnDuration || "-"}
                                                </div>
                                                <div>
                                                  <strong>Score:</strong>{" "}
                                                  {parseInt(
                                                    upload.RxnDuration
                                                  ) *
                                                    parseInt(upload.Points) *
                                                    parseInt(upload.NoRxns)}
                                                </div>
                                                <div>
                                                  <strong>Total Score:</strong>{" "}
                                                  {upload.Status === "Rejected"
                                                    ? "0"
                                                    : parseInt(
                                                        upload.RxnDuration
                                                      ) *
                                                      parseInt(upload.Points) *
                                                      parseInt(upload.NoRxns)}
                                                </div>
                                                <div>
                                                  <strong>Challenger:</strong>{" "}
                                                  {upload.role || "-"}
                                                </div>
                                                <div>
                                                  <strong>
                                                    PREVIOUS_TEAM:
                                                  </strong>{" "}
                                                  {upload.role === "Initiator"
                                                    ? upload.teamA
                                                    : upload.teamB}
                                                </div>
                                                <div>
                                                  <strong>
                                                    OPPONENT_TEAM:
                                                  </strong>{" "}
                                                  {upload.role === "Initiator"
                                                    ? upload.teamB
                                                    : upload.teamA}
                                                </div>
                                                <div>
                                                  <strong>Mobile No:</strong>{" "}
                                                  {upload.MOBNO || "-"}
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
                                                {/* <div>
                                                  <strong>
                                                    Date of Creation:
                                                  </strong>{" "}
                                                  {upload.DateOfCreation || "-"}
                                                </div> */}
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
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-80 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg text-center font-bold">{modalTitle}</h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="currentColor"
                class="bi bi-x"
                viewBox="0 0 16 16"
                className="cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
            </div>
            <div>
              <label className="leading-loose text-black">
                Reason<span className="text-red-600">*</span>
              </label>
              <textarea
                type="text"
                name="reason"
                onChange={handleReason}
                rows={6}
                className="px-2 py-2 border-2  w-full sm:text-sm rounded-md focus:outline-none text-gray-600"
              ></textarea>
            </div>
            <div className="flex justify-center items-center">
              <button
                className={`px-4 py-2 mt-4 rounded text-white ${
                  btnDisable
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
                }`}
                // onClick={submitApprovalReport}
                onClick={!btnDisable ? submitApprovalReport : undefined} // Prevent click when disabled
                disabled={btnDisable} // Make button truly disabled
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

export default ApprovalsPage;
