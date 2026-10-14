import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { toast, Toaster } from "react-hot-toast";
const Settings = () => {
  const [schedule, setSchedule] = useState({});
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef(null);

  const [file1, setFile1] = useState(null);
  const [isLoading1, setIsLoading1] = useState(false);
  const fileRef1 = useRef(null);

  const [file2, setFile2] = useState(null);
  const [isLoading2, setIsLoading2] = useState(false);
  const fileRef2 = useRef(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("2025");

  const [btn1, setBtn1] = useState(true);
  const [btn2, setBtn2] = useState(true);

  const pageName = "Settings";

  const adminId = localStorage.getItem("UserId");
  const BusinessUnit = localStorage.getItem("BusinessUnit");

  const handleChange = (e) => {
    setSchedule(e.target.value);
  };

  const handleFile = () => {
    fileRef.current.click();
  };

  const handleFile1 = () => {
    fileRef1.current.click();
  };

  const handleFile2 = () => {
    fileRef2.current.click();
  };

  const handleFileChange = () => {
    const file = fileRef.current.files[0];
    if (file) {
      console.log("File uploaded: " + file.name);
      setFile(file);
    }
  };

  const handleFileChange1 = () => {
    const file = fileRef1.current.files[0];
    if (file) {
      setFile1(file);
    }
  };

  const handleFileChange2 = () => {
    const file = fileRef2.current.files[0];
    if (file) {
      setFile2(file);
    }
  };

  const handleFileClear = () => {
    setFile(null); // Clear the state
    fileRef.current.value = null; // Reset the file input value
  };

  const handleFileClear1 = () => {
    setFile1(null); // Clear the state
    fileRef1.current.value = null; // Reset the file input value
  };

  const handleFileClear2 = () => {
    setFile2(null); // Clear the state
    fileRef2.current.value = null; // Reset the file input value
  };

  const handleUpload = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        `https://dev.admin.rxpl.digilateral.com/api/upload-excelSheet-admin/${adminId}`,
        formData
      );
      toast.success("Excel Sheet Uploaded Successfully");
      setIsLoading(false);
      setFile(null);
      fileRef.current.value = null;
    } catch (error) {
      setIsLoading(false);
      // toast.error(
      //   !file ? "Please Select Excel File" : error.response.data.error
      // );
      const errors = error.response.data.error;
      if (Array.isArray(errors)) {
        const errorMessage = errors.join("\n");

        const blob = new Blob([errorMessage], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ValidationError.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.error("Validation error. File downloaded.");
      } else {
        toast.error("Data Missing");
      }
    }
  };

  const handleUpload1 = async () => {
    setIsLoading1(true);
    const formData = new FormData();
    formData.append("file", file1);
    try {
      const res = await axios.post(
        `https://dev.admin.rxpl.digilateral.com/api/scheduleMatchesAdmin/${adminId}`,
        formData
      );
      toast.success("Tournament Sheet Uploaded Successfully");
      setIsLoading1(false);
      setFile1(null);
      fileRef1.current.value = null;
    } catch (error) {
      setIsLoading1(false);
      // toast.error(!file1 ? "Please Select Excel File" : error.response.data.error);
      const errors = error.response.data.error;
      if (Array.isArray(errors)) {
        const errors = error.response.data.error; // assuming it's an array of objects
        const errorMessage = errors.join("\n");

        const blob = new Blob([errorMessage], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ValidationError.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.error("Validation error. File downloaded.");
      } else {
        toast.error("Data Missing");
      }
    }
  };

  const handleUpload2 = async () => {
    setIsLoading2(true);
    const formData = new FormData();
    formData.append("file", file2);
    formData.append("month", month);
    formData.append("year", year);
    formData.append("companyName", BusinessUnit);
    try {
      const res = await axios.post(
        `https://dev.admin.rxpl.digilateral.com/api/uploadExcelNplLeague/${adminId}`,
        formData
      );
      toast.success("Sheet Uploaded Successfully");
      setIsLoading2(false);
      setFile2(null);
      setMonth("");
      fileRef2.current.value = null;
    } catch (error) {
      setIsLoading2(false);
      toast.error(
        !file2 ? "Please Select Excel File" : error.response.data.message
      );
      const errors = error.response.data.error;
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // ✅ FIX: Proper ternary
    const duration = schedule?.SetMatchDurationBefore || 0;

    console.log("📤 Sending:", { SetMatchDurationBefore: duration });

    const res = await axios.patch(
      `https://dev.admin.rxpl.digilateral.com/api/updateMatchDuration/${adminId}`,
      {
        SetMatchDurationBefore: parseInt(duration),  // ✅ ENSURE NUMBER
      }
    );

    console.log("✅ Response:", res.data);
    toast.success("Match Duration Gap Updated Successfully");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Error updating duration");
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://dev.admin.rxpl.digilateral.com/api/getMatchDuration/${adminId}`
        );
        setSchedule(res.data.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const handleDownload = () => {
    // Define the headers
    const headers = [
      [
        "TLMID",
        "TLMNAME",
        "TLMPASSWORD",
        "TLMHQ",
        "TLMZONE",
        "TLMTeamName",
        "SLMID",
        "SLMNAME",
        "SLMPASSWORD",
        "SLMHQ",
        "SLMREGION",
        "SLMZONE",
        "SLMTeamName",
        "FLMID",
        "FLMNAME",
        "FLMPASSWORD",
        "FLMHQ",
        "FLMREGION",
        "FLMZONE",
        "FLMTeamName",
        "MRID",
        "MRNAME",
        "MREMAIL",
        "MRPASSWORD",
        "MRROLE",
        "MRHQ",
        "MRREGION",
        "MRZONE",
        "MRBUSSINESSUNIT",
        "TEAMNAME",
      ],
    ];

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook and trigger download
    XLSX.writeFile(workbook, "SampleSheet.xlsx");
  };

  const handleDownloadTournament = () => {
    // Define the headers
    const headers = [
      ["challengeStartDate", "challengeEndDate", "playerAId", "playerBId"],
    ];

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();

    // Define column formatting to treat data as TEXT
    worksheet["!cols"] = [
      { wch: 20, z: "@", t: "s" }, // challengeStartDate
      { wch: 20, z: "@", t: "s" }, // challengeEndDate
      { wch: 15, z: "@", t: "s" }, // playerAId
      { wch: 15, z: "@", t: "s" }, // playerBId
    ];

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook and trigger download
    XLSX.writeFile(workbook, "TournamentSample.xlsx");
  };

  const handleDownload2 = () => {
    // Define the headers
    const headers = [
      [
        "MRID",
        "BrandName",
        "percentageFactor",
        "Pcpm",
        "SalesVal",
        "TargetVal",
      ],
    ];

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook and trigger download
    XLSX.writeFile(workbook, "SampleExcel.xlsx");
  };

  return (
    <div>
      <Sidebar />
      {BusinessUnit === "NPL" ? (
        <div
          className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[140vh] sm:overflow-hidden"
          style={{
            borderTopLeftRadius: "80px",
          }}
        >
          <div className="h-[100px]">
            <Header pageName={pageName} />
          </div>

          <div className="flex justify-center sm:mt-8 items-center">
            <h1 className="font-bold sm:absolute px-4 py-2 sm:left-5">
              Upload Excel Sheet
            </h1>
            <button
              onClick={handleDownload2}
              className="sm:absolute px-4 py-2 sm:right-5 rounded-lg text-white bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
            >
              Download Sample
            </button>
          </div>
          <div className="flex justify-center mt-8 items-center">
            <div className="flex flex-col justify-center items-center gap-4 w-full max-w-2xl">
              {/* Month and Year Input Fields */}
              <div className="flex flex-col justify-center sm:flex-row gap-4 w-full px-4 sm:px-0">
                <div className="w-full sm:w-1/2">
                  <label
                    htmlFor="month"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Month
                  </label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 capitalize"
                  >
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                {/* <div className="w-full sm:w-1/2">
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Enter year (e.g. 2025)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div> */}
              </div>

              <div
                className="border-4 border-dashed flex flex-col justify-center items-center px-12 sm:px-36 py-4 sm:py-16 rounded-2xl text-lg font-semibold cursor-pointer text-gray-500 gap-2 w-full"
                onClick={file2 ? null : handleFile2}
              >
                {file2 ? (
                  <div className="flex justify-center items-center gap-2">
                    <h1>{file2.name}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="red"
                      className="size-6"
                      onClick={handleFileClear2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <div className="flex flex-col justify-center items-center">
                      <h1>Click to upload a file</h1>
                      <span>(.xls,.xlsx)</span>
                    </div>
                  </>
                )}
              </div>

              <input
                type="file"
                hidden
                onChange={handleFileChange2}
                ref={fileRef2}
                accept=".xls,.xlsx"
              />
              <button
                type="button"
                className={`${
                  isLoading2
                    ? "disabled bg-gray-500"
                    : "visible bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
                }  ml-2 text-white focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5 focus:outline-none`}
                onClick={handleUpload2}
                disabled={!month || !year || isLoading2} // Disable if month/year not filled
              >
                {isLoading2 ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[140vh] sm:overflow-hidden"
          style={{
            borderTopLeftRadius: "80px",
          }}
        >
          <div className="h-[100px]">
            <Header pageName={pageName} />
          </div>

          <div className="flex justify-center sm:mt-8 items-center">
            <div className="border-4 rounded-3xl p-2 sm:p-4 min-w-[280px] w-[30vw]">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-center w-full">
                  <label htmlFor="name" className="font-bold text-lg">
                    Match Duration Gap:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={schedule?.SetMatchDurationBefore}
                    onChange={handleChange}
                    className="rounded-lg px-4 py-2 bg-slate-300 border border-white m-2 w-[80%] sm:w-full"
                  />
                  <button
                    type="submit"
                    className="rounded-3xl px-4 py-2 bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd text-white m-2 w-[80%] sm:w-full transition-colors duration-200 ease-in hover:bg-blue-100"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
          <hr className="mt-6 sm:ml-16" />
          <div className="flex justify-center mt-8 items-center">
            <div className="flex flex-col justify-center items-center gap-4">
              <h1 className="font-bold sm:absolute px-4 py-2 sm:left-5 sm:top-[340px]">
                Upload Excel Sheet
              </h1>
              <button
                onClick={handleDownload}
                className="sm:absolute px-4 py-2 sm:right-5 sm:top-[340px] rounded-lg text-white bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
              >
                Download Sample
              </button>
              <div
                className="border-4 border-dashed flex flex-col justify-center items-center px-12 sm:px-36 py-4 sm:py-16 rounded-2xl text-lg font-semibold cursor-pointer text-gray-500 gap-2"
                onClick={file ? null : handleFile}
              >
                {file ? (
                  <div className="flex justify-center items-center gap-2">
                    <h1>{file.name}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="red"
                      className="size-6"
                      onClick={handleFileClear} // Use handleFileClear here
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <div className="flex flex-col justify-center items-center">
                      <h1>Click to upload a file</h1>
                      <span>(.xls,.xlsx)</span>
                    </div>
                  </>
                )}
              </div>

              <input
                type="file"
                hidden
                onChange={handleFileChange}
                ref={fileRef}
                accept=".xls,.xlsx"
              />
              <button
                type="button"
                className={`${
                  isLoading
                    ? "disabled bg-gray-500"
                    : "visible bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
                }  ml-2 text-white focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5 focus:outline-none`}
                onClick={handleUpload}
              >
                {isLoading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
          <hr className="mt-6 sm:ml-16" />
          <div className="flex justify-center mt-8 items-center">
            <div className="flex flex-col justify-center items-center gap-4">
              <h1 className="font-bold sm:absolute px-4 py-2 sm:left-5 sm:top-[620px]">
                Upload Tournament Sheet
              </h1>
              <button
                onClick={handleDownloadTournament}
                className="sm:absolute px-4 py-2 sm:right-5 sm:top-[620px] rounded-lg text-white bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
              >
                Download Tournament Sample
              </button>
              <div
                className="border-4 border-dashed mt-10 flex flex-col justify-center items-center px-12 sm:px-36 py-4 sm:py-16 rounded-2xl text-lg font-semibold cursor-pointer text-gray-500 gap-2"
                onClick={file1 ? null : handleFile1}
              >
                {file1 ? (
                  <div className="flex justify-center items-center gap-2">
                    <h1>{file1.name}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="red"
                      className="size-6"
                      onClick={handleFileClear1} // Use handleFileClear here
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <div className="flex flex-col justify-center items-center">
                      <h1>Click to upload a file</h1>
                      <span>(.xls,.xlsx)</span>
                      <span className="text-black text-sm">
                        Note: *ChallengeDates Should be in DD-MM-YYYY Format
                        only
                      </span>
                    </div>
                  </>
                )}
              </div>

              <input
                type="file"
                hidden
                onChange={handleFileChange1}
                ref={fileRef1}
                accept=".xls,.xlsx"
              />
              <button
                type="button"
                className={`${
                  isLoading1
                    ? "disabled bg-gray-500"
                    : "visible bg-gradient-to-r from-customGradientButtonStart to-customGradientButtonEnd"
                }  ml-2 text-white focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5 focus:outline-none`}
                onClick={handleUpload1}
              >
                {isLoading1 ? "Uploading..." : "Upload Tournament Sheet"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Settings;

                                                                                                                                                                                                                                                                                                                                                   