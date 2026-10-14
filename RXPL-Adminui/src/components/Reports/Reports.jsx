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

const ITEMS_PER_PAGE = 50;

const Reports = () => {
  const pageName = "Reports";
  const [loading, setLoading] = useState(false);
const [exportLoading, setExportLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [uploadData, setUploadData] = useState([]);
  const [brandCountCategoryCounts, setBrandCountCategoryCounts] = useState({
    "1B": {
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
    "2B": {
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
    "3B": {
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
    Total: {
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
  });
  const [brandWiseCounts, setBrandWiseCounts] = useState({});

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

  // ── PAGINATION STATE ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  const Id = sessionStorage.getItem("UserId");

  const [searchQuery, setSearchQuery] = useState("");

  const BusinessUnit = sessionStorage.getItem("BusinessUnit");

  // NEW: Check if business unit is DIGI to show/hide columns
  const isDIGI = BusinessUnit === "DIGI";

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to page 1 on search
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

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setCurrentPage(1);
  };
  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setCurrentPage(1);
  };


  const getMonthYY = (dateStr) => {
  if (!dateStr) return "-";
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.toLocaleString("en-US", { month: "short" }) +
    "-" +
    String(year).slice(-2)
  );
};


  // const filteredData = (Array.isArray(uploadData) ? uploadData : []).flatMap(
  //   (upload) => {
  //     const isUsernameMatch =
  //       !selectedUsername || upload.USERNAME === selectedUsername;
  //     const isHQMatch = !selectedHQ || upload.HQ === selectedHQ;
  //     const isZONEMatch = !selectedZONE || upload.ZONE === selectedZONE;
  //     const isRegionMatch = !selectedRegion || upload.REGION === selectedRegion;
  //     const isTeamNameMatch =
  //       !selectedTeamName || upload.TEAMNAME === selectedTeamName;

  //     if (
  //       !isUsernameMatch ||
  //       !isHQMatch ||
  //       !isZONEMatch ||
  //       !isRegionMatch ||
  //       !isTeamNameMatch
  //     ) {
  //       return [];
  //     }
  //     const filteredChallenger = upload.MRUploadedData.filter((data) => {
  //       const isRoleMatch =
  //         !selectedChallenger || data.role === selectedChallenger;

  //       const isPreviousTeamMatch =
  //         !selectedPreviousTeam ||
  //         (data.role === "Initiator" && selectedPreviousTeam === data.teamA) ||
  //         (data.role === "Acceptor" && selectedPreviousTeam === data.teamB);

  //       const isOpponentTeamMatch =
  //         !selectedOpponentTeam ||
  //         (data.role === "Initiator" && selectedOpponentTeam === data.teamB) ||
  //         (data.role === "Acceptor" && selectedOpponentTeam === data.teamA);

  //       return isRoleMatch && isPreviousTeamMatch && isOpponentTeamMatch;
  //     });

  //     if (!filteredChallenger.length) return [];

  //     const filteredUploads = filteredChallenger.filter((data) => {
  //       // UPDATED: Enhanced search to include MRID and MR Name
  //       const isDrNameMatch =
  //         !searchQuery ||
  //         data.DrName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         data.ScCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         upload.TEAMNAME?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         upload.MRID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         upload.USERNAME?.toLowerCase().includes(searchQuery.toLowerCase());

  //       const isSpecialityMatch =
  //         !selectedSpeciality || data.Specility === selectedSpeciality;
  //       const isBrandNameMatch =
  //         !selectedBrandName || data.BrandName === selectedBrandName;
  //       const isPointsMatch = !selectedPoints || data.Points === selectedPoints;

  //       const parsedCreationDate = parseDate(data.DateOfCreation);

  //       const from = fromDate ? new Date(fromDate) : null;
  //       const to = toDate ? new Date(toDate) : null;

  //       if (from) from.setHours(0, 0, 0, 0);
  //       if (to) to.setHours(23, 59, 59, 999);

  //       const isWithinDateRange =
  //         (!from || parsedCreationDate >= from) &&
  //         (!to || parsedCreationDate <= to);

  //       const isMonthMatch =
  //         !selectedMonth || getMonthYY(data.DateOfUpload) === selectedMonth;

  //       return (
  //         isSpecialityMatch &&
  //         isBrandNameMatch &&
  //         isDrNameMatch &&
  //         isWithinDateRange &&
  //         isPointsMatch &&
  //         isMonthMatch
  //       );
  //     });

  //     return filteredUploads.length
  //       ? [{ ...upload, MRUploadedData: filteredUploads }]
  //       : [];
  //   },
  // );


  // Find the filteredData function and update the month filtering logic:

const filteredData = (Array.isArray(uploadData) ? uploadData : []).flatMap(
  (upload) => {
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

      // ✅ FIXED: Month filtering logic
      const isMonthMatch = !selectedMonth || getMonthYY(data.DateOfUpload) === selectedMonth;

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
  },
);

  const computeCountsFromFilteredData = (data) => {
    const brandCounts = {};
    const categoryCounts = {
      "1B": {
        totalCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
      "2B": {
        totalCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
      "3B": {
        totalCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
      Total: {
        totalCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      },
    };

    data.forEach((mr) => {
      mr.MRUploadedData.forEach((u) => {
        const status = u.Status;

        let category = "1B";
        if (u.NumberOfBrands === 2) category = "2B";
        if (u.NumberOfBrands >= 3) category = "3B";

        categoryCounts[category].totalCount++;
        categoryCounts["Total"].totalCount++;

        if (status === "Approved") {
          categoryCounts[category].approvedCount++;
          categoryCounts["Total"].approvedCount++;
        } else if (status === "Pending") {
          categoryCounts[category].pendingCount++;
          categoryCounts["Total"].pendingCount++;
        } else if (status === "Rejected") {
          categoryCounts[category].rejectedCount++;
          categoryCounts["Total"].rejectedCount++;
        }

        if (u.SelectedBrands?.length) {
          u.SelectedBrands.forEach((b) => {
            const brand = b.brandName;
            if (!brandCounts[brand]) {
              brandCounts[brand] = {
                totalCount: 0,
                pendingCount: 0,
                approvedCount: 0,
                rejectedCount: 0,
              };
            }

            brandCounts[brand].totalCount++;
            if (status === "Approved") brandCounts[brand].approvedCount++;
            else if (status === "Pending") brandCounts[brand].pendingCount++;
            else if (status === "Rejected") brandCounts[brand].rejectedCount++;
          });
        }
      });
    });

    return { brandCounts, categoryCounts };
  };

  const {
    brandCounts: filteredBrandWiseCounts,
    categoryCounts: filteredCategoryCounts,
  } = computeCountsFromFilteredData(filteredData);

  const stats = filteredData.reduce(
    (acc, mr) => {
      mr.MRUploadedData.forEach((u) => {
        if (u.NumberOfBrands === 1) acc.oneB++;
        if (u.NumberOfBrands === 2) acc.twoB++;
        if (u.NumberOfBrands === 3) acc.threeB++;

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
    },
  );

  // ── FLAT SORTED LIST (ALL filtered rows, used for pagination + Excel) ──────
  const allSortedRows = filteredData
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
      const parseDateTime = (dateStr, timeStr) => {
        if (!dateStr) return new Date(0);
        const [day, month, year] = dateStr.split("-").map(Number);
        let hours = 0,
          minutes = 0;
        if (timeStr) {
          const timeParts = timeStr.split(":").map(Number);
          hours = timeParts[0] || 0;
          minutes = timeParts[1] || 0;
        }
        return new Date(year, month - 1, day, hours, minutes);
      };

      const aDateTime = parseDateTime(a.DateOfUpload, a.TimeOfUpload);
      const bDateTime = parseDateTime(b.DateOfUpload, b.TimeOfUpload);
      return bDateTime - aDateTime;
    });

  const totalPages = Math.ceil(allSortedRows.length / ITEMS_PER_PAGE);

  const paginatedRows = allSortedRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Reset page when any filter changes ───────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedUsername,
    selectedHQ,
    selectedZONE,
    selectedRegion,
    selectedTeamName,
    selectedSpeciality,
    selectedBrandName,
    selectedPoints,
    selectedChallenger,
    selectedPreviousTeam,
    selectedOpponentTeam,
    selectedMonth,
  ]);

  const removeFilter = () => {
    setFromDate("");
    setToDate("");
    setSelectedUsername("");
    setSelectedHQ("");
    setSelectedZONE("");
    setSelectedRegion("");
    setSelectedTeamName("");
    setSelectedSpeciality("");
    setSelectedPoints("");
    setSearchQuery("");
    setSelectedChallenger("");
    setSelectedPrevTeam("");
    setSelectedOppTeam("");
    setSelectedMonth("");
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getUploadData/${Id}`,
        );

        const dataArray = Array.isArray(response.data) ? response.data : [];
        setUploadData(dataArray)

        const meta = dataArray[0]?._meta || {};

        setBrandCountCategoryCounts(
          meta.brandCountCategoryCounts || {
            "1B": {
              totalCount: 0,
              pendingCount: 0,
              approvedCount: 0,
              rejectedCount: 0,
            },
            "2B": {
              totalCount: 0,
              pendingCount: 0,
              approvedCount: 0,
              rejectedCount: 0,
            },
            "3B": {
              totalCount: 0,
              pendingCount: 0,
              approvedCount: 0,
              rejectedCount: 0,
            },
            Total: {
              totalCount: 0,
              pendingCount: 0,
              approvedCount: 0,
              rejectedCount: 0,
            },
          },
        );

        setBrandWiseCounts(meta.brandWiseCounts || {});

        const uniqueUsernames = [
          ...new Set(
            dataArray.map((mr) =>
              mr?.MRUploadedData?.length > 0 ? mr.USERNAME : undefined,
            ),
          ),
        ].filter(Boolean);
        setUsernameOptions(uniqueUsernames);
        const uniqueHQs = [
          ...new Set(
            dataArray.map((mr) =>
              mr?.MRUploadedData?.length > 0 ? mr.HQ : undefined,
            ),
          ),
        ].filter(Boolean);
        setHqOptions(uniqueHQs);
        const uniqueZones = [
          ...new Set(
            dataArray.map((mr) =>
              mr?.MRUploadedData?.length > 0 ? mr.ZONE : undefined,
            ),
          ),
        ].filter(Boolean);
        setZONEOptions(uniqueZones);
        const uniqueRegions = [
          ...new Set(
            dataArray.map((mr) =>
              mr?.MRUploadedData?.length > 0 ? mr.REGION : undefined,
            ),
          ),
        ].filter(Boolean);
        setRegionOptions(uniqueRegions);
        const uniqueTeamNames = [
          ...new Set(
            dataArray.map((mr) =>
              mr?.MRUploadedData?.length > 0 ? mr.TEAMNAME : undefined,
            ),
          ),
        ].filter(Boolean);
        setTeamNameOptions(uniqueTeamNames);
        const uniqueSpecialities = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).map((u) => u.Specility),
            ),
          ),
        ].filter(Boolean);
        setSpecialityOptions(uniqueSpecialities);
        const uniqueBrandNames = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).map((u) => u.BrandName),
            ),
          ),
        ].filter(Boolean);
        setBrandNameOptions(uniqueBrandNames);
        const uniquePoints = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).map((u) => u.Points),
            ),
          ),
        ].filter(Boolean);
        setPointsOptions(uniquePoints);
        const uniqueChallenger = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).flatMap((u) => u.role),
            ),
          ),
        ].filter(Boolean);
        setSelectChallengerOption(uniqueChallenger);
        const uniquePreviousTeam = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).flatMap((u) =>
                u.role === "Initiator" ? [u.teamA] : [u.teamB],
              ),
            ),
          ),
        ].filter(Boolean);
        setSelectPreviousTeam(uniquePreviousTeam);
        const uniqueOpponentTeam = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).flatMap((u) =>
                u.role === "Initiator" ? [u.teamB] : [u.teamA],
              ),
            ),
          ),
        ].filter(Boolean);
        setSelectOpponentTeam(uniqueOpponentTeam);
        const uniqueMonths = [
          ...new Set(
            dataArray.flatMap((mr) =>
              (mr?.MRUploadedData || []).map((u) => getMonthYY(u.DateOfUpload)),
            ),
          ),
        ].filter(Boolean);
        setMonthOptions(uniqueMonths);

        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // ── EXCEL: Always exports ALL filtered rows (ignores pagination) ──────────
const exportToExcel = () => {
  if (exportLoading) return;

  setExportLoading(true);

  setTimeout(() => {
    try {
  // Always export from raw uploadData (all records, no filter effect)
  // If filters are active, export filtered rows; otherwise export everything
  const isFilterActive =
    fromDate || toDate || selectedUsername || selectedHQ ||
    selectedZONE || selectedRegion || selectedTeamName ||
    selectedSpeciality || selectedBrandName || selectedPoints ||
    selectedChallenger || selectedPreviousTeam || selectedOpponentTeam ||
    selectedMonth || searchQuery;

  const sourceRows = isFilterActive
    ? allSortedRows  // filtered flat rows
    : (Array.isArray(uploadData) ? uploadData : []).flatMap((item) =>
        (item.MRUploadedData || []).map((upload) => ({
          ...upload,
          MRID: item.MRID,
          USERNAME: item.USERNAME,
          HQ: item.HQ,
          REGION: item.REGION,
          ZONE: item.ZONE,
          TeamName: item.TEAMNAME,
        }))
      ).sort((a, b) => {
        const parseDateTime = (dateStr, timeStr) => {
          if (!dateStr) return new Date(0);
          const [day, month, year] = dateStr.split("-").map(Number);
          let hours = 0, minutes = 0;
          if (timeStr) {
            const tp = timeStr.split(":").map(Number);
            hours = tp[0] || 0;
            minutes = tp[1] || 0;
          }
          return new Date(year, month - 1, day, hours, minutes);
        };
        return parseDateTime(b.DateOfUpload, b.TimeOfUpload) -
               parseDateTime(a.DateOfUpload, a.TimeOfUpload);
      });

  const data = sourceRows.map((upload) => {
    const selectedBrandSet = getSelectedBrandSet(upload);
    const prescriptionUrl = upload.PrescriptionImage
      ? `http://localhost:7501/uploads/${upload.PrescriptionImage}`
      : null;

    const baseData = {
      MRID: upload.MRID || "N/A",
      MRName: upload.USERNAME || "N/A",
      HQ: upload.HQ || "N/A",
      Region: upload.REGION || "N/A",
      Zone: upload.ZONE || "N/A",
      Current_Team: upload.TeamName || "N/A",
      DrName: upload.DrName || "N/A",
      Speciality: upload.Specility || "N/A",
      "1B": upload.NumberOfBrands === 1 ? 1 : "-",
      "2B": upload.NumberOfBrands === 2 ? 1 : "-",
      "3B": upload.NumberOfBrands === 3 ? 1 : "-",
      Vysov: selectedBrandSet.has("vysov") ? 1 : "-",
      Triexer: selectedBrandSet.has("triexer") ? 1 : "-",
      RDL: selectedBrandSet.has("rdl") ? 1 : "-",
      "Re-xite Forte": selectedBrandSet.has("re-xite forte") ? 1 : "-",
      "Metis G": selectedBrandSet.has("metis g") ? 1 : "-",
      Tordura: selectedBrandSet.has("tordura") ? 1 : "-",
      Month: getMonthYY(upload.DateOfUpload),
      NoRxns: upload.NoRxns || "N/A",
      RxnDuration: upload.RxnDuration || "N/A",
      Total: upload.Status === "Rejected"
        ? 0
        : parseInt(upload.Points) * parseInt(upload.RxnDuration) * parseInt(upload.NoRxns) || "N/A",
      Status: upload.Status || "N/A",
      DateOfUpload: upload.DateOfUpload || "N/A",
      // Use Excel HYPERLINK formula so the cell is clickable
      PrescriptionImage: prescriptionUrl
        ? { f: `HYPERLINK("${prescriptionUrl}", "Download")` }
        : "N/A",
    };

    if (isDIGI) {
      baseData.MOBNO = upload.MOBNO || "N/A";
      baseData.Points = upload.Points || "0";
      baseData.Previous_Team = upload.role === "Initiator" ? upload.teamA : upload.teamB;
      baseData.Challenger = upload.role;
    }

    return baseData;
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Column widths
  const colWidths = Object.keys(data[0] || {}).map((key) =>
    key === "PrescriptionImage" ? { wch: 20 } : { wch: 18 }
  );
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "UploadData");
  XLSX.writeFile(workbook, "UploadData-Report.xlsx");
    } finally {
      setExportLoading(false);
    }
  }, 50);
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
    
    // Show loading toast
    toast.loading("Downloading image...", { id: "download" });
    
    // Fetch the image as a blob
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    
    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create temporary link
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = imageUrl; // This forces download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(blobUrl);
    
    toast.success("Download started!", { id: "download" });
  } catch (error) {
    console.error("Failed to download the image:", error);
    toast.error("Failed to download image");
  }
};
  const safeMultiply = (...args) => {
    const numbers = args.map((v) => parseInt(v) || 0).filter((n) => n > 0);
    return numbers.length === 0 ? 0 : numbers.reduce((a, b) => a * b, 1);
  };

  // ── PAGINATION CONTROLS ───────────────────────────────────────────────────
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const delta = 2;
      const left = Math.max(2, currentPage - delta);
      const right = Math.min(totalPages - 1, currentPage + delta);

      pages.push(1);
      if (left > 2) pages.push("...");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);

      return pages;
    };

    return (
      <div className="flex-shrink-0 flex justify-center items-center gap-1 py-3 border-t bg-white">
        {/* Row count info */}
        <span className="text-xs text-gray-500 mr-3">
          Showing{" "}
          {Math.min(
            (currentPage - 1) * ITEMS_PER_PAGE + 1,
            allSortedRows.length,
          )}
          –{Math.min(currentPage * ITEMS_PER_PAGE, allSortedRows.length)} of{" "}
          {allSortedRows.length} rows
        </span>

        {/* Prev */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border text-xs font-medium disabled:opacity-40 hover:bg-pink-50 transition-colors"
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-xs text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                currentPage === page
                  ? "bg-pink-500 text-white border-pink-500"
                  : "hover:bg-pink-50"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border text-xs font-medium disabled:opacity-40 hover:bg-pink-50 transition-colors"
        >
          Next →
        </button>
      </div>
    );
  };

  return (
    <>
     {exportLoading && (
  <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
    <RotatingLines
      visible={true}
      height="100"
      width="100"
      strokeColor="white"
      strokeWidth="5"
      animationDuration="0.75"
      ariaLabel="export-loading"
    />
  </div>
)}

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
  disabled={exportLoading}
  className="text-white px-2 focus:ring-4 bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd font-medium rounded-full text-[10px] sm:text-sm py-2 sm:mr-16 sm:py-2 focus:outline-none border-2 disabled:opacity-60 disabled:cursor-not-allowed"
>
  Download
</button>
                          </div>
                        </div>
                        <div className="sm:visible hidden sm:flex sm:justify-center sm:items-center mr-4">
                     <button
  type="button"
  onClick={exportToExcel}
  disabled={exportLoading}
  className="text-white focus:ring-4 bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd font-medium rounded-full text-xs sm:text-sm px-3 py-2 m-2 sm:mr-16 sm:px-5 sm:py-2 focus:outline-none border-2 disabled:opacity-60 disabled:cursor-not-allowed"
>
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
                              {["1B", "2B", "3B", "Total"].map((category) => {
                                const counts = filteredCategoryCounts[
                                  category
                                ] || {
                                  totalCount: 0,
                                  pendingCount: 0,
                                  approvedCount: 0,
                                  rejectedCount: 0,
                                };
                                return (
                                  <div key={category}>
                                    <p className="text-sm font-bold text-gray-500">
                                      {category}
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600">
                                      {counts.totalCount}
                                    </p>
                                    <div className="flex flex-col gap-0.5 justify-center text-xs mt-1">
                                      <span className="text-green-600 font-semibold">
                                        A: {counts.approvedCount}
                                      </span>
                                      <span className="text-yellow-600 font-semibold">
                                        P: {counts.pendingCount}
                                      </span>
                                      <span className="text-red-600 font-semibold">
                                        R: {counts.rejectedCount}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ===== CARD 2: BRAND-WISE ===== */}
                          <div className="bg-white rounded-xl shadow-md px-4 py-2 flex-[1.6] min-w-[600px]">
                            <p className="text-base font-semibold text-gray-500 text-center mb-2">
                              Brand Wise Summary
                            </p>

                            <div className="grid grid-cols-6 gap-4 text-center">
                              {Object.entries(stats.brands).map(
                                ([brand, count]) => {
                                  const brandKey = Object.keys(
                                    brandWiseCounts,
                                  ).find(
                                    (key) =>
                                      key.toLowerCase() === brand.toLowerCase(),
                                  );
                                  const brandCounts = filteredBrandWiseCounts[
                                    brandKey
                                  ] || {
                                    totalCount: 0,
                                    pendingCount: 0,
                                    approvedCount: 0,
                                    rejectedCount: 0,
                                  };

                                  return (
                                    <div key={brand}>
                                      <p className="text-sm font-bold capitalize text-gray-500 whitespace-nowrap">
                                        {brand}
                                      </p>
                                      <p className="text-2xl font-semibold text-purple-700">
                                        {brandCounts.totalCount || count}
                                      </p>
                                      <div className="flex flex-col gap-0.5 justify-center text-xs mt-1">
                                        <span className="text-green-600 font-semibold">
                                          A: {brandCounts.approvedCount || 0}
                                        </span>
                                        <span className="text-yellow-600 font-semibold">
                                          P: {brandCounts.pendingCount || 0}
                                        </span>
                                        <span className="text-red-600 font-semibold">
                                          R: {brandCounts.rejectedCount || 0}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
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
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  SR.No
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  MRID
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-20 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Doctor Name
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  1B
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  2B
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  3B
                                </th>

                                <th
                                  colSpan={6}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                  BrandName
                                </th>

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  No. Rxns
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Rxn Duration
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
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

                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Status
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Upload Date
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-10 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Upload Time
                                </th>
                                <th
                                  rowSpan={2}
                                  className="px-20 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                >
                                  Download Proof
                                </th>
                              </tr>

                              {/* ===== HEADER ROW 2 (SUB BRANDS) ===== */}
                              <tr>
                                {BRAND_COLUMNS.map((brand) => (
                                  <th
                                    key={brand}
                                    className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                                  >
                                    {brand}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody>
                              {paginatedRows.map((upload, index) => (
                                <tr
                                  key={index}
                                  className="border bg-pink-200 even:bg-pink-100"
                                >
                                  {/* ── SR.No: global position across pages ── */}
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {allSortedRows.length -
                                      ((currentPage - 1) * ITEMS_PER_PAGE +
                                        index)}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.MRID || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.USERNAME || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.HQ || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.REGION || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.ZONE || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.TeamName || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.DrName || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {upload.Specility || "-"}
                                  </td>

                                  {isDIGI && (
                                    <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                      {upload.Specility || "-"}
                                    </td>
                                  )}
                                  {isDIGI && (
                                    <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                      {upload.MOBNO || "-"}
                                    </td>
                                  )}

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

                                  {isDIGI && (
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {upload.Points || "-"}
                                    </td>
                                  )}

                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {upload.NoRxns || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {upload.RxnDuration || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {upload.Status === "Rejected"
                                      ? "0"
                                      : safeMultiply(
                                          upload.RxnDuration,
                                          upload.Points,
                                          upload.NoRxns,
                                        )}
                                  </td>

                                  {isDIGI && (
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {upload.role}
                                    </td>
                                  )}
                                  {isDIGI && (
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {upload.role === "Initiator"
                                        ? upload.teamA
                                        : upload.teamB}
                                    </td>
                                  )}
                                  {isDIGI && (
                                    <td className="px-18 py-1 text-center text-sm text-black">
                                      {upload.role === "Initiator"
                                        ? upload.teamB
                                        : upload.teamA}
                                    </td>
                                  )}

                                  <td className="px-18 py-1 text-center text-sm text-black whitespace-nowrap">
                                    {getMonthYY(upload.DateOfUpload)}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {upload.Status || "-"}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {upload.DateOfUpload || "-"}
                                  	</td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {upload.TimeOfUpload || "-"}
                                  </td>

                                  <td className="px-18 py-1 flex justify-center items-center text-sm text-gray-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="size-6 cursor-pointer"
                                      //onClick={() =>
                                        //downloadInvoiceImage(
                                          //upload.PrescriptionImage,
                                        //)
                                      //}
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

                          {/* Mobile View Table */}
                          <table
                            className="min-w-full leading-normal sm:hidden text-xs"
                            id="doctorTable"
                          >
                            {/* Keep your existing mobile table code */}
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* ── PAGINATION CONTROLS ── */}
                    <PaginationControls />
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


