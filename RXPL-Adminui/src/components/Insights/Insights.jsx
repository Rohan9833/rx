import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import BackGroundImg from "../../assets/bg.png";
import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const TABS = [
  { key: "state", label: "STATE" },
  { key: "zone", label: "ZONE" },
  { key: "region", label: "REGION" },
  { key: "hq", label: "AREA" },
];

const Insight = () => {
  const pageName = "Monthly Brand Summary";

  const [activeTab, setActiveTab] = useState("state");
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([]);

  const [filterState, setFilterState] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterArea, setFilterArea] = useState("");

  // ================= FETCH DATA =================
  const fetchSummary = async (groupBy) => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:7501/api/monthly-brand-summary",
        { params: { groupBy } },
      );

      if (res.data.success) {
        setRawData(res.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load summary");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setFilterState("");
    setFilterZone("");
    setFilterRegion("");
    setFilterArea("");
  }, [activeTab]);

 useEffect(() => {
  console.log("Sample item:", rawData[0]);
  console.log("All months found:", rawData.map(d => d.month));
}, [rawData]);

const MONTH_ORDER = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const months = useMemo(() => {
  const availableMonths = [...new Set(rawData.map((d) => d.month))];
  return availableMonths.sort(
    (a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)
  );
}, [rawData]);

  // ================= PIVOT =================

  //   const pivotData = Object.values(
  //     rawData.reduce((acc, item) => {
  //       const key =
  //         activeTab === "hq"
  //           ? `${item.zone}-${item.region}-${item.name}`
  //           : activeTab === "region"
  //             ? `${item.zone}-${item.name}`
  //             : item.name;

  //       if (!acc[key]) {
  //         acc[key] = {
  //           name: item.name,
  //           zone: item.zone,
  //           region: item.region,
  //           months: {},
  //         };
  //       }

  //       acc[key].months[item.month] = {
  //         oneB: item.oneB || 0,
  //         twoB: item.twoB || 0,
  //         threeB: item.threeB || 0,
  //         totalScore: item.totalScore || 0, // ✅ ADD THIS
  //       };

  //       return acc;
  //     }, {}),
  //   );
  const pivotData = useMemo(() => {
    return Object.values(
      rawData.reduce((acc, item) => {
        const key =
          activeTab === "hq"
            ? `${item.zone}-${item.region}-${item.name}`
            : activeTab === "region"
              ? `${item.zone}-${item.name}`
              : item.name;

        if (!acc[key]) {
          acc[key] = {
            name: item.name,
            zone: item.zone,
            region: item.region,
            months: {},
          };
        }

        acc[key].months[item.month] = {
          oneB: item.oneB || 0,
          twoB: item.twoB || 0,
          threeB: item.threeB || 0,
          totalScore: item.totalScore || 0,
        };

        return acc;
      }, {}),
    );
  }, [rawData, activeTab]);

  const unique = (arr) => [...new Set(arr.filter(Boolean))];

  //   const filteredPivotData = pivotData.filter((row) => {
  //   if (activeTab === "state" && filterState && row.name !== filterState)
  //     return false;

  //   if (activeTab === "zone" && filterZone && row.name !== filterZone)
  //     return false;

  //   if (activeTab === "region") {
  //     if (filterZone && row.zone !== filterZone) return false;
  //     if (filterRegion && row.name !== filterRegion) return false;
  //   }

  //   if (activeTab === "hq") {
  //     if (filterZone && row.zone !== filterZone) return false;
  //     if (filterRegion && row.region !== filterRegion) return false;
  //     if (filterArea && row.name !== filterArea) return false;
  //   }

  //   return true;
  // });

  const filteredPivotData = useMemo(() => {
    return pivotData.filter((row) => {
      if (activeTab === "state" && filterState && row.name !== filterState)
        return false;

      if (activeTab === "zone" && filterZone && row.name !== filterZone)
        return false;

      if (activeTab === "region") {
        if (filterZone && row.zone !== filterZone) return false;
        if (filterRegion && row.name !== filterRegion) return false;
      }

      if (activeTab === "hq") {
        if (filterZone && row.zone !== filterZone) return false;
        if (filterRegion && row.region !== filterRegion) return false;
        if (filterArea && row.name !== filterArea) return false;
      }

      return true;
    });
  }, [pivotData, activeTab, filterState, filterZone, filterRegion, filterArea]);
  

  // const sortedPivotData = [...filteredPivotData].sort((a, b) => {
  //   const totalA = months.reduce(
  //     (sum, m) => sum + (a.months[m]?.totalScore || 0),
  //     0
  //   );
  //   const totalB = months.reduce(
  //     (sum, m) => sum + (b.months[m]?.totalScore || 0),
  //     0
  //   );
  //   return totalB - totalA; // 🔥 highest first
  // });
  const sortedPivotData = useMemo(() => {
    return [...filteredPivotData].sort((a, b) => {
      const totalA = months.reduce(
        (sum, m) => sum + (a.months[m]?.totalScore || 0),
        0,
      );

      const totalB = months.reduce(
        (sum, m) => sum + (b.months[m]?.totalScore || 0),
        0,
      );

      return totalB - totalA; // 🔥 highest first
    });
  }, [filteredPivotData, months]);

  // const stateOptions = unique(pivotData.map((d) => d.name));
  // const zoneOptions = unique(pivotData.map((d) => d.zone));
  // const regionOptions = unique(pivotData.map((d) => d.region));
  // const areaOptions = unique(pivotData.map((d) => d.name));

  const stateOptions = useMemo(() => {
    if (activeTab !== "state") return [];
    return unique(pivotData.map((d) => d.name));
  }, [pivotData, activeTab]);

  const zoneOptions = useMemo(() => {
    if (activeTab === "zone") {
      // Zone tab → name IS zone
      return unique(pivotData.map((d) => d.name));
    }

    // Region / HQ → zone exists separately
    if (activeTab === "region" || activeTab === "hq") {
      return unique(pivotData.map((d) => d.zone));
    }

    return [];
  }, [pivotData, activeTab]);

  const regionOptions = useMemo(() => {
    if (activeTab === "region") {
      // Region tab → name IS region
      return unique(pivotData.map((d) => d.name));
    }

    if (activeTab === "hq") {
      return unique(pivotData.map((d) => d.region));
    }

    return [];
  }, [pivotData, activeTab]);

  const areaOptions = useMemo(() => {
    if (activeTab !== "hq") return [];
    return unique(pivotData.map((d) => d.name));
  }, [pivotData, activeTab]);

  const removeFilter = () => {
    setFilterState("");
    setFilterZone("");
    setFilterRegion("");
    setFilterArea("");
  };

  // ================= EXCEL =================
  const downloadExcel = () => {
    try {
      const rows = [];

      sortedPivotData.forEach((row) => {
        const base = {};

        if (activeTab !== "state") base.Zone = row.zone || "-";
        if (activeTab === "region" || activeTab === "hq")
          base.Region = row.region || "-";

        base[
          activeTab === "state"
            ? "State"
            : activeTab === "zone"
              ? "Zone"
              : activeTab === "region"
                ? "Region"
                : "Area"
        ] = row.name;

        months.forEach((m) => {
          base[`${m} - 1B`] = row.months[m]?.oneB || 0;
          base[`${m} - 2B`] = row.months[m]?.twoB || 0;
          base[`${m} - 3B`] = row.months[m]?.threeB || 0;
          base[`${m} - TOTAL`] = row.months[m]?.totalScore || 0; // ✅
        });

        rows.push(base);
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Summary");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([buffer]),
        `Monthly_Brand_Summary_${activeTab.toUpperCase()}.xlsx`,
      );
    } catch {
      toast.error("Excel download failed");
    }
  };

  // ================= COLUMN SPAN =================
  const baseCols = activeTab === "state" ? 2 : activeTab === "zone" ? 3 : 4;
  //   const totalCols = baseCols + months.length * 3;
  const totalCols = baseCols + months.length * 4;

  // ================= RENDER =================
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

        <div
          style={{
            backgroundImage: `url(${BackGroundImg})`,
            backgroundBlendMode: "overlay",
          }}
          className="border-pink-500 border-2 bg-cover bg-no-repeat mx-auto sm:w-[80vw] relative sm:left-[10px] sm:bottom-5"
        >
          <div className="rounded-2xl shadow-md p-4">
            {/* ===== TABS ===== */}
            <div className="relative flex justify-center gap-36 border-b pb-2">
              {/* {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`font-bold px-24 py-2 ${
                    activeTab === tab.key
                      ? "text-pink-600 border-b-2 border-pink-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))} */}
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`font-bold py-2 transition ${
                    activeTab === tab.key
                      ? "text-pink-600 border-b-2 border-pink-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={downloadExcel}
                disabled={pivotData.length === 0}
                className="absolute right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white shadow-md"
              >
                <RiFileExcel2Fill className="text-xl" />
              </button>
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

            {/* ===== TABLE ===== */}
            {loading ? (
              <div className="flex justify-center items-center h-[90vh] flex flex-col">
                <RotatingLines height="56" width="56" strokeColor="purple" />
              </div>
            ) : (
              <div className="overflow-auto h-[75vh] mt-4">
                <table className="min-w-full border">
                  {/* <thead>
                    <tr className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                      {activeTab !== "state" && (
                        <th
                          rowSpan={2}
                          className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider"
                        >
                          Zone
                        </th>
                      )}
                      {(activeTab === "region" || activeTab === "hq") && (
                        <th
                          rowSpan={2}
                          className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider"
                        >
                          Region
                        </th>
                      )}
                      <th
                        rowSpan={2}
                        className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider"
                      >
                        {activeTab === "state"
                          ? "State"
                          : activeTab === "zone"
                            ? "Zone"
                            : activeTab === "region"
                              ? "Region"
                              : "Area / HQ"}
                      </th>

                      {months.map((m) => (
                        <th
                          key={m}
                          colSpan={4}
                          className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider"
                        >
                          {m}
                        </th>
                      ))}
                    </tr>

                    <tr className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-yellow-600 uppercase tracking-wider">
                      {months.map((m) => (
                        <React.Fragment key={m}>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            1B
                          </th>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            2B
                          </th>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            3B
                          </th>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            PTS
                          </th>{" "}
                         
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead> */}

                  <thead>
                    <tr className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <th
                        rowSpan={2}
                        className="px-4 py-2 border-2 border-gray-500 whitespace-nowrap"
                      >
                        Sr. No.
                      </th>

                      {/* STATE */}
                      {/* {activeTab === "state" && (
      <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
        State
      </th>
    )} */}
                      {activeTab === "state" && (
                        <th
                          rowSpan={2}
                          className="px-6 py-2 border-2 border-gray-500"
                        >
                          State
                          <select
                            className="px-2 py-1 border rounded text-sm"
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                          >
                            <option value="">All</option>
                            {stateOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </th>
                      )}

                      {/* ZONE */}
                      {/* {activeTab === "zone" && (
      <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
        Zone
      </th>
    )} */}
                      {activeTab === "zone" && (
                        <th
                          rowSpan={2}
                          className="px-6 py-2 border-2 border-gray-500"
                        >
                          Zone
                          <select
                            className="mt-1 min-w-[70px] px-3 py-1 border rounded text-sm
             bg-white text-gray-700
            "
                            value={filterZone}
                            onChange={(e) => setFilterZone(e.target.value)}
                          >
                            <option value="">All</option>
                            {zoneOptions.map((z) => (
                              <option key={z} value={z}>
                                {z}
                              </option>
                            ))}
                          </select>
                        </th>
                      )}

                      {/* REGION */}
                      {/* {activeTab === "region" && (
      <>
        <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
          Zone
        </th>
        <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
          Region
        </th>
      </>
    )} */}
                      {activeTab === "region" && (
                        <>
                          <th
                            rowSpan={2}
                            className="px-6 py-2 border-2 border-gray-500"
                          >
                            Zone
                            <select
                              className="px-2 py-1 border rounded text-sm"
                              value={filterZone}
                              onChange={(e) => setFilterZone(e.target.value)}
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
                            className="px-6 py-2 border-2 border-gray-500"
                          >
                            Region
                            <select
                              className="mt-1 w-full px-2 py-1 border rounded text-sm"
                              value={filterRegion}
                              onChange={(e) => setFilterRegion(e.target.value)}
                            >
                              <option value="">All</option>
                              {regionOptions.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </th>
                        </>
                      )}

                      {/* AREA / HQ */}
                      {/* {activeTab === "hq" && (
      <>
        <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
          Zone
        </th>
        <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
          Region
        </th>
        <th rowSpan={2} className="px-6 py-2 border-2 border-gray-500">
          Area
        </th>
      </>
    )} */}
                      {activeTab === "hq" && (
                        <>
                          <th
                            rowSpan={2}
                            className="px-6 py-2 border-2 border-gray-500"
                          >
                            Zone
                            <select
                              className="px-2 py-1 border rounded text-sm"
                              value={filterZone}
                              onChange={(e) => setFilterZone(e.target.value)}
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
                            className="px-6 py-2 border-2 border-gray-500"
                          >
                            Region
                            <select
                              className="px-2 py-1 border rounded text-sm"
                              value={filterRegion}
                              onChange={(e) => setFilterRegion(e.target.value)}
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
                            className="px-6 py-2 border-2 border-gray-500"
                          >
                            Area
                            <select
                              className="px-2 py-1 border rounded text-sm"
                              value={filterArea}
                              onChange={(e) => setFilterArea(e.target.value)}
                            >
                              <option value="">All</option>
                              {areaOptions.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                          </th>
                        </>
                      )}

                      {/* MONTH HEADERS */}
                      {months.map((m) => (
                        <th
                          key={m}
                          colSpan={4}
                          className="px-6 py-2 border-2 border-gray-500"
                        >
                          {m}
                        </th>
                      ))}
                    </tr>

                    {/* SUB HEADER */}
                    <tr className="px-6 py-2 border-2 border-gray-500 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {months.map((m) => (
                        <React.Fragment key={m}>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            1B
                          </th>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            2B
                          </th>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            3B
                          </th>
                          <th className="px-6 py-2 border-2 border-gray-500">
                            TOTAL
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sortedPivotData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={totalCols}
                          className="px-4 py-2 text-center text-sm text-black"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      sortedPivotData.map((row, i) => (
                        <tr
                          key={i}
                          className={i % 2 ? "bg-pink-100" : "bg-pink-200"}
                        >
                          <td className="px-4 py-2 text-center text-sm text-black">
                            {i + 1}
                          </td>

                          {/* {activeTab !== "state" && (
                            <td className="px-4 py-2 text-center text-sm text-black">
                              {row.zone || "-"}
                            </td>
                          )}
                          {(activeTab === "region" || activeTab === "hq") && (
                            <td className="px-4 py-2 text-center text-sm text-black">
                              {row.region || "-"}
                            </td>
                          )}
                          <td className="px-4 py-2 text-center text-sm text-black">
                            {row.name}
                          </td> */}
                          {/* STATE */}
                          {activeTab === "state" && (
                            <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                              {row.name}
                            </td>
                          )}

                          {/* ZONE */}
                          {activeTab === "zone" && (
                            <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                              {row.name || "-"}
                            </td>
                          )}

                          {/* REGION */}
                          {activeTab === "region" && (
                            <>
                              <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                                {row.zone || "-"}
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                                {row.name}
                              </td>
                            </>
                          )}

                          {/* AREA / HQ */}
                          {activeTab === "hq" && (
                            <>
                              <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                                {row.zone || "-"}
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                                {row.region || "-"}
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-black whitespace-nowrap">
                                {row.name}
                              </td>
                            </>
                          )}

                          {months.map((m) => (
                            <React.Fragment key={m}>
                              <td className="px-4 py-2 text-center text-sm text-black">
                                {row.months[m]?.oneB || 0}
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-black">
                                {row.months[m]?.twoB || 0}
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-black">
                                {row.months[m]?.threeB || 0}
                              </td>
                              <td className="px-4 py-2 text-center text-sm font-bold text-purple-700">
                                {row.months[m]?.totalScore || 0} {/* ✅ PTS */}
                              </td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default Insight;

