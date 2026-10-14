import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Chart } from "react-google-charts";
import BackGroundImg from "../../assets/bg.png";
import RxplLogo from "../../assets/mainLogo.gif";
import PlayerImg from "../../assets/playerImg.png";
import { FaEye } from "react-icons/fa";
import { io } from "socket.io-client";

const Dashboard = () => {
  const pageName = "Dashboard";
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [highestTeamScore, setHighestTeamScore] = useState({});
  const [lowestTeamScore, setLowestTeamScore] = useState({});
  const [totalRuns, setTotalRuns] = useState({});
  const [topRunScorer, setTopRunScorer] = useState([]);
  const [halfCenturies, setHalfCenturies] = useState({});
  const [Centuries, setCenturies] = useState({});
  const [bestScore, setBestScore] = useState({});
  const [mostNoOfMatchesByTeam, setMostNoOfMatchesByTeam] = useState({});
  const [totalSixes, setTotalSixes] = useState({});
  const [totalFours, setTotalFours] = useState({});

  const [highestteamLogoSrc, setHighestTeamLogSrc] = useState(null);
  const [lowestteamLogoSrc, setLowestTeamLogSrc] = useState(null);
  const [mostNoOfMathestByTeamSrc, setMostNoOfMatchesByTeamSrc] =
    useState(null);
  const [tableTopperTeamSrc, setTableTopperTeamSrc] = useState(null);

  const [rankData, setRankData] = useState([]);

  const [tableTopperTeam, setTableTopperTeam] = useState([]);
  const [liveUser, setLiveUser] = useState(null);
  const [last30min, setLast30min] = useState(null);
  const [last1hrs, setLast1hrs] = useState(null);
  const [last2hrs, setLast2hrs] = useState(null);
  const [last4hrs, setLast4hrs] = useState(null);

  const BusinessUnit = sessionStorage.getItem("BusinessUnit");

  const socketServerURL = "http://localhost:7501"; // Replace with your server URL

  useEffect(() => {
    const loadLogo = async () => {
      const { team } = highestTeamScore;

      if (team in teamLogos) {
        try {
          const logo = await teamLogos[team]();
          setHighestTeamLogSrc(logo.default); // Dynamic imports return an object with a `default` property.
        } catch (error) {
          console.error("Failed to load team logo:", error);
        }
      }
    };

    loadLogo();
  }, [highestTeamScore]);

  useEffect(() => {
    const loadLogo = async () => {
      const { team } = lowestTeamScore;

      if (team in teamLogos) {
        try {
          const logo = await teamLogos[team]();
          setLowestTeamLogSrc(logo.default); // Dynamic imports return an object with a `default` property.
        } catch (error) {
          console.error("Failed to load team logo:", error);
        }
      }
    };

    loadLogo();
  }, [lowestTeamScore]);

  useEffect(() => {
    const loadLogo = async () => {
      const { TeamName } = mostNoOfMatchesByTeam;

      if (TeamName in teamLogos) {
        try {
          const logo = await teamLogos[TeamName]();
          setMostNoOfMatchesByTeamSrc(logo.default); // Dynamic imports return an object with a `default` property.
        } catch (error) {
          console.error("Failed to load team logo:", error);
        }
      }
    };

    loadLogo();
  }, [mostNoOfMatchesByTeam]);

  useEffect(() => {
    const loadLogo = async () => {
      const { TeamName } = tableTopperTeam;

      if (TeamName in teamLogos) {
        try {
          const logo = await teamLogos[TeamName]();
          setTableTopperTeamSrc(logo.default); // Dynamic imports return an object with a `default` property.
        } catch (error) {
          console.error("Failed to load team logo:", error);
        }
      }
    };

    loadLogo();
  }, [tableTopperTeam]);

  useEffect(() => {
    const fetchHighestTeamScore = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getHighestTeamScore`
        );
        setHighestTeamScore(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchHighestTeamScore();
  }, []);

  useEffect(() => {
    const fetchLowestScore = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getLowestTeamScore`
        );
        setLowestTeamScore(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLowestScore();
  }, []);

  useEffect(() => {
    const fetchTotalRuns = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/totalRuns`
        );
        setTotalRuns(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTotalRuns();
  }, []);

  useEffect(() => {
    const fetchTopRunScorer = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/topRunScorer`
        );
        setTopRunScorer(response.data.data[0]);
        console.log("topRunScorerrrr", response.data.data[0]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTopRunScorer();
  }, []);

  useEffect(() => {
    const fetchTotalHalfCenturies = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/totalHalfCenturiesCount`
        );
        setHalfCenturies(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTotalHalfCenturies();
  }, []);

  useEffect(() => {
    const fetchTotalCenturies = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/totalCenturiesCount`
        );
        setCenturies(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTotalCenturies();
  }, []);

  useEffect(() => {
    const fetchBestScore = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/bestScoreByPlayer`
        );
        setBestScore(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBestScore();
  }, []);

  useEffect(() => {
    const fetchMostNoOfMatchesByTeam = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getMostNoOfMatchesByTeam`
        );
        setMostNoOfMatchesByTeam(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMostNoOfMatchesByTeam();
  }, []);

  useEffect(() => {
    const fetchTopTeam = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getAllTeamRank`
        );
        setTableTopperTeam(response.data.data[0]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTopTeam();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7501/api/getAllTeamRank"
        );
        if (response.data.success) {
          setRankData(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTotalSixes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getTotalSixes`
        );
        setTotalSixes(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTotalSixes();
  }, []);

  useEffect(() => {
    const fetchTotalFours = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getTotalFours`
        );
        setTotalFours(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTotalFours();
  }, []);

  const chartData = [
    ["Type", "Count"], // Labels
    ["Fours", totalFours.TotalFours], // Data for Fours
    ["Sixes", totalSixes.TotalSixes], // Data for Sixes
  ];

  const chartOptions = {
    pieHole: 0.8, // This creates the donut effect
    is3D: false,
    colors: ["#8c0050", "#ff8aa0"], // Custom colors for slices
    backgroundColor: "transparent",
    chartArea: {
      width: "90%",
      height: "90%",
    },
    legend: {
      position: "top",
      alignment: "center",
      textStyle: {
        color: "#233238",
        fontSize: 14,
      },
    },
    pieSliceText: "none",
  };

  const teamLogos = {
    "Delhi Fighters": () =>
      import("../../assets/50 & 100 Logo/100x100/DelhiFighters copy.png"),
    "Gujarat Commandos": () =>
      import("../../assets/50 & 100 Logo/100x100/GujaratCommandos copy.png"),
    "Mumbai Runners": () =>
      import("../../assets/50 & 100 Logo/100x100/MumbaiRunners copy.png"),
    "Chennai Superstars": () =>
      import("../../assets/50 & 100 Logo/100x100/ChennaiSuperstars copy.png"),
    "Kolkata Invincibles": () =>
      import("../../assets/50 & 100 Logo/100x100/KolkataInvincibles copy.png"),
    "Bangalore Indians": () =>
      import("../../assets/50 & 100 Logo/100x100/BangaloreIndians copy.png"),
    "Guwahati Champions": () =>
      import("../../assets/50 & 100 Logo/100x100/GuwahatiChampions copy.png"),
    "Andhra Blasters": () =>
      import("../../assets/50 & 100 Logo/100x100/AndhraBlasters copy.png"),
    "Kerala Riders": () =>
      import("../../assets/50 & 100 Logo/100x100/KeralaRiders copy.png"),
    "Patna Kings": () =>
      import("../../assets/50 & 100 Logo/100x100/PatnaKings copy.png"),
    "Pune Warriors": () =>
      import("../../assets/50 & 100 Logo/100x100/PuneWarriors copy.png"),
    "Punjab Giants": () =>
      import("../../assets/50 & 100 Logo/100x100/PunjabGiants copy.png"),
    "Raipur Challengers": () =>
      import("../../assets/50 & 100 Logo/100x100/RaipurChallengers copy.png"),
    "Rajasthan Stormers": () =>
      import("../../assets/50 & 100 Logo/100x100/RajasthanStormers copy.png"),
    "Ranchi Daredevils": () =>
      import("../../assets/50 & 100 Logo/100x100/RanchiDaredevils copy.png"),
    "Hyderabad Nawabs": () =>
      import("../../assets/50 & 100 Logo/100x100/HyderabadNawabs copy.png"),
    "Lucknow Royals": () =>
      import("../../assets/50 & 100 Logo/100x100/LucknowRoyals copy.png"),
    "Nagpur Legends": () =>
      import("../../assets/50 & 100 Logo/100x100/NagpurLegends copy.png"),
    "Bhopal Titans": () =>
      import("../../assets/50 & 100 Logo/100x100/BhopalTitans copy.png"),
    "Cuttack Gladiators": () =>
      import("../../assets/50 & 100 Logo/100x100/CuttackGladiators copy.png"),
  };

  useEffect(() => {
    // Fetch initial live user count from REST API
    const getLiveUser = async () => {
      try {
        const response = await axios.get(
          `${socketServerURL}/api/getLiveUserCount`
        );
        setLiveUser(response.data.data[0].LiveUser);
      } catch (error) {
        console.log(error);
      }
    };
    getLiveUser();

    // Establish WebSocket connection
    const socket = io(socketServerURL);

    // Listen for real-time updates
   socket.on("LiveUser_Count", (data) => {
      console.log("Live User Count:", data);
     setLiveUser(data.LiveUser); // Update live user count from WebSocket data
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [socketServerURL]);

  useEffect(()=>{
    const getAllUserCount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501/api/getUserCountLiveAccordingToTime`
        );
        setLast30min(response.data.last30Minutes.length);
        setLast1hrs(response.data.last1Hour.length);
        setLast2hrs(response.data.last2Hours.length);
        setLast4hrs(response.data.last4Hours.length);
      } catch (error) {
        console.log(error);
      }
    }

    getAllUserCount()
  },[socketServerURL])

  const handleNavigateToLive = () =>{
    navigate(`/LiveUser/${userId}`);
  }

  const handleNavigateToLast30min = () =>{
    navigate(`/LiveUser/${userId}`,{ state: { data: "last30min" } });
  }

  const handleNavigateToLast1hrs = () =>{
    navigate(`/LiveUser/${userId}`,{ state: { data: "last1hour" } });
  }

  const handleNavigateToLast2hrs = () =>{
    navigate(`/LiveUser/${userId}`,{ state: { data: "last2hour" } });
  }

  const handleNavigateToLast4hrs = () =>{
    navigate(`/LiveUser/${userId}`,{ state: { data: "last4hour" } });
  }
 console.log("dahsboard seeeee:", rankData);
  return (
    <>
      <div className="grid grid-cols-2 absolute max-h-[110vh] ">
        <Sidebar />

        <div
          className="sm:w-[82vw] w-[92vw]  z-1 bg-white  absolute  sm:left-[210px] left-[10px] h-[125vh] sm:overflow-hidden"
          style={{ borderRadius: "80px" }}
        >
          <div className="h-[100px] mb-[-30px]">
            <Header pageName={pageName} />
          </div>

          {/* <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
              <div className="capitalize relative top-[-10px] sm:left-[45px] left-[49px] w-[70vw] sm:w-[80vw]">
                bg-[url('../../assets/bg.jpg')] bg-contain bg-center
              </div>
            </div>
          </nav> */}
          <div className="sm:mt-[0px] mt-[40px]  w-full h-auto ">
            <div className="mb-0 sm:grid-cols-2 w-[30vw] sm:w-[80vw] grid gap-y-10 gap-0 grid-cols-1 relative sm:left-[45px] left-[45px]">
              <div className="mb-0 sm:grid-cols-3 w-[30vw] sm:w-[80vw] grid gap-y-10 gap-0 grid-cols-1 relative sm:left-[45px] left-[45px]"></div>
            </div>

            <div
              style={{
                backgroundImage: `url(${BackGroundImg})`,
                backgroundBlendMode: "overlay",
              }}
              className="bg-cover bg-no-repeat  mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px] "
            >
              <div className="overflow-y-auto max-h-screen sm:w-full w-full  shadow-md overflow-hidden ">
                <div className="overflow-x-auto">
                  <div className="overflow-hidden">
                    <div className="p-2 flex justify-between items-center gap-10">
                      <div onClick={handleNavigateToLive} className="flex select-none justify-start items-center gap-1 cursor-pointer">
                        <FaEye />
                        <h3>{liveUser} Live</h3>
                      </div>
                      <div onClick={handleNavigateToLast30min} className="flex select-none justify-start items-center gap-1 cursor-pointer">
                        <FaEye />
                        <h3>{last30min} Last 30min</h3>
                      </div>
                      <div onClick={handleNavigateToLast1hrs} className="flex select-none justify-start items-center gap-1 cursor-pointer">
                        <FaEye />
                        <h3>{last1hrs} Last 1hrs</h3>
                      </div>
                      <div onClick={handleNavigateToLast2hrs} className="flex select-none justify-start items-center gap-1 cursor-pointer">
                        <FaEye />
                        <h3>{last2hrs} Last 2hrs</h3>
                      </div>
                      <div onClick={handleNavigateToLast4hrs}  className="flex select-none justify-start items-center gap-1 cursor-pointer">
                        <FaEye />
                        <h3>{last4hrs} Last 4hrs</h3>
                      </div>
                    </div>
                    <div className="sm:flex sm:justify-center sm:items-center gap-1 sm:flex-row ">
                      <div class="w-full p-3 border-pink-500 border-2  sm:w-62  shadow-md mx-auto text-center">
                        <div className="flex items-center justify-evenly w-full">
                          {/* Left Section: Score and Best Score */}
                          <div className="flex items-center">
                            {highestteamLogoSrc ? (
                              <img
                                src={highestteamLogoSrc}
                                alt={`${highestTeamScore.team}`}
                                // width="100px"
                                // height="100px"
                              />
                            ) : (
                              <p className="text-[20px] font-custom font-bold text-pink-500">
                                {rankData[0]?.TeamName}
                              </p>
                            )}
                          </div>

                          {/* Right Section: Logo */}
                          <div className="flex flex-col items-center text-center">
                            <h1 className="sm:text-[15px] w-20 text-sm font-bold text-gray-500">
                              Best Score By Team
                            </h1>
                            <p className="text-[18px] font-custom font-bold text-pink-500">
                              {rankData[0]?.teamScore}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div class="w-full p-3 border-pink-500 border-2   sm:w-62 mx-auto shadow-md  text-center">
                        <div className="flex items-center justify-evenly w-full">
                          {/* Left Section: Score and Best Score */}
                          <div className="flex items-center">
                            {lowestteamLogoSrc ? (
                              <img
                                src={lowestteamLogoSrc}
                                alt={`${lowestTeamScore.team}`}
                                // width="100px"
                                // height="100px"
                              />
                            ) : (
                              <p className="text-[20px] font-custom font-bold text-pink-500">
                               {rankData[3]?.TeamName}
			    // {lowestTeamScore?.TeamName}
                              </p>
                            )}
                          </div>

                          {/* Right Section: Logo */}
                          <div className="flex flex-col items-center text-center">
                            <h1 className="sm:text-[15px] w-[100px] text-sm font-bold text-gray-500">
                              Lowest Score By Team
                            </h1>
                            <p className="text-[18px] font-custom font-bold text-pink-500">
                              {rankData[3]?.teamScore}
         // {lowestTeamScore?.score}                  
	  </p>
                          </div>
                        </div>
                      </div>
                 {BusinessUnit === "DIGI" ? (
                  <div class="w-full p-3 border-pink-500 border-2 sm:w-62 mx-auto shadow-md  text-center">
                        <div className="flex items-center justify-evenly w-full">
                          {/* Left Section: Score and Best Score */}
                          <div className="flex items-center">
                            {mostNoOfMathestByTeamSrc ? (
                              <img
                                src={mostNoOfMathestByTeamSrc}
                                alt={`${mostNoOfMatchesByTeam.TeamName}`}
                                // width="100px"
                                // height="100px"
                              />
                            ) : (
                              <p className="text-[20px] font-custom font-bold text-pink-500">
                                {mostNoOfMatchesByTeam.TeamName}
                              </p>
                            )}
                          </div>

                          {/* Right Section: Logo */}
                          <div className="flex flex-col items-center text-center">
                            <h1 className="sm:text-[15px] w-[160px] text-sm font-bold text-gray-500">
                              Most nos of Matches by team
                            </h1>
                            <p className="text-[18px] font-custom font-bold text-pink-500">
                              {mostNoOfMatchesByTeam.highestMatchesCount}
                            </p>
                          </div>
                        </div>
                      </div>
                ) : ("")      
                }
                      <div class="w-full p-3 border-pink-500 border-2 sm:w-62 sm:h-[135px] mx-auto shadow-md  text-center">
                        <div className="flex items-center justify-evenly w-full">
                          {/* Left Section: Score and Best Score */}
                          <div className="flex items-center pt-3">
                            <img
                              src={RxplLogo}
                              alt="logo"
                              width="120px"
                              height="120px"
                            />
                          </div>

                          {/* Right Section: Logo */}
                          <div className="flex flex-col gap-1 items-center text-center">
                            <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                              Total Runs
                            </h1>
                            <p className="text-[18px] font-custom font-bold text-pink-500">
                              {BusinessUnit === "DIGI" ? totalRuns.TotalRuns :  totalFours.TotalFours * 4 + totalSixes.TotalSixes * 6}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sm:flex mt-1 sm:justify-center sm:items-center gap-1 sm:flex-row ">
                      <div class="w-full p-3 border-pink-500 border-2  sm:w-62  shadow-md mx-auto text-center">
                        <div className="flex items-center justify-evenly w-full">
                          <div className="flex items-center">
                            <img
                              src={PlayerImg}
                              alt="logo"
                              width="100px"
                              height="100px"
                            />
                          </div>

                          {/* Right Section: Logo */}
                          <div className="flex flex-col items-center text-center">
                            <h1 className="sm:text-[15px] mb-4 text-sm font-bold text-gray-500">
                              Top Run Scorer
                            </h1>
                            <h1 className="sm:text-[18px] text-sm font-custom font-bold text-pink-500">
                              {topRunScorer.USERNAME}
                            </h1>
                            <p className="text-[18px] font-custom font-bold text-pink-500">
                              {topRunScorer.TotalScore} 
                            </p>
                            <h1 className="sm:text-[10px] text-sm font-custom font-bold text-pink-500">
                              {topRunScorer.TEAMNAME}
                            </h1>
                          </div>
                        </div>
                      </div>
                      <div class="w-full p-3 border-pink-500 border-2   sm:w-62 mx-auto shadow-md  text-center">
                        {/* <h1 class="sm:text-[15px] text-sm font-bold text-gray-500">
                          Best Score
                        </h1>
                        <div className="flex justify-evenly mt-2">
                          <p class="text-[20px] font-custom font-bold text-pink-500">
                            {bestScore.BestScore}
                          </p>
                          <p class="text-[20px] font-custom font-bold text-pink-500">
                            {bestScore.TEAMNAME}
                          </p>
                        </div> */}
                        <div className="flex items-center justify-evenly w-full">
                          <div className="flex items-center">
                            <img
                              src={PlayerImg}
                              alt="logo"
                              width="100px"
                              height="100px"
                            />
                          </div>

                          {/* Right Section: Logo */}
                          <div className="flex flex-col items-center text-center">
                            <h1 className="sm:text-[15px] mb-4 text-sm font-bold text-gray-500">
                              Best Score
                            </h1>
                            <h1 className="sm:text-[18px] text-sm font-custom font-bold text-pink-500">
                              {bestScore.USERNAME}
                            </h1>
                            <p className="text-[18px] font-custom font-bold text-pink-500">
                              {bestScore.BestScore}
                            </p>
                            <h1 className="sm:text-[10px] text-sm font-custom font-bold text-pink-500">
                              {bestScore.TEAMNAME}
                            </h1>
                          </div>
                        </div>
                      </div>
                      <div class="w-full p-3 h-[144px] border-pink-500 border-2   sm:w-62 mx-auto shadow-md  text-center">
                        <h1 class="sm:text-[15px] pt-4 text-sm font-bold text-gray-500">
                          Half Centuries (No. Players)
                        </h1>
                        <p class="text-[20px] font-custom font-bold text-pink-500 mt-2">
                          {halfCenturies.totalHalfCenturies}
                        </p>
                      </div>
                      <div class="w-full p-3 h-[144px] border-pink-500 border-2   sm:w-62 mx-auto shadow-md  text-center">
                        <h1 class="sm:text-[15px] pt-4 text-sm font-bold text-gray-500">
                          Centuries (No. Players)
                        </h1>
                        <p class="text-[20px] font-custom font-bold text-pink-500 mt-2">
                          {Centuries.totalCenturies}
                        </p>
                      </div>
                    </div>

                    {/* <div className="flex gap-1">
                      <div className="w-[65%] mt-1">
                        <div class="w-full p-2 border-pink-500 border-2  sm:w-62  shadow-md mx-auto text-center">
                          <h1 class="sm:text-[15px] text-sm font-bold text-gray-500">
                            Table Topper
                          </h1>
                          <p class="text-[80px] font-bold text-pink-500">
                            {tableTopperTeam.TeamName}
                          </p>
                        </div>
                        <div class="w-full p-16  mt-1 border-pink-500 border-2   sm:w-62 mx-auto shadow-md  text-center">
                          <h1 class="sm:text-[15px] text-sm font-bold text-gray-500">
                            Runs Scored By Boundries
                          </h1>
                          <p class="text-[22px] mt-2 font-bold text-pink-500">
                            {totalFours.TotalFours * 4 +
                              totalSixes.TotalSixes * 6}
                          </p>
                        </div>
                      </div>
                      <div class="w-[120%] p-3 mt-1 border-pink-500 border-2  shadow-md mx-auto text-center">
                        <h1 class="sm:text-[15px] text-sm font-bold text-gray-500">
                          Summary
                        </h1>
                        <div
                          style={{
                            height: "300px",
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
                        >
                          <table
                            className="min-w-full leading-normal hidden sm:block"
                            id="doctorTable"
                          >
                            <thead>
                              <tr>
                                <th className="px-10 py-2 border-2  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Rk
                                </th>
                                <th className="px-16 py-2 border-2  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  TEAMS
                                </th>
                                <th className="px-10 py-2 border-2  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  MTS
                                </th>
                                <th className="px-10 py-2 border-2  text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  SCORE
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rankData.map((item, index) => (
                                <tr
                                  key={index}
                                  className="border bg-pink-200 even:bg-pink-100"
                                >
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {rankData.length - index}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {item.TeamName}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {item.MatchesCount}
                                  </td>
                                  <td className="px-18 py-1 text-center text-sm text-black">
                                    {item.teamScore}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div class="w-[60%] mt-1 p-3 border-pink-500 border-2  sm:w-62  shadow-md mx-auto text-center">
                        <h1 class="sm:text-[15px] text-sm font-bold text-gray-500">
                          Boundries Split
                        </h1>
                        <Chart
                          className="mt-10"
                          chartType="PieChart"
                          data={chartData}
                          options={chartOptions}
                        />
                        <div className="flex justify-evenly items-center mt-4">
                          <div className="flex items-center">
                            <span className="block w-2 h-2 bg-grayBlue mr-2"></span>{" "}
                            <p>Total 6s: {totalSixes.TotalSixes}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="block w-2 h-2 bg-gray1 mr-2"></span>{" "}
                            <p>Total 4s: {totalFours.TotalFours}</p>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    <div className="sm:flex gap-1">
                      {/* Table Topper and Runs Scored By Boundries */}
                      <div className="w-full sm:w-[25%] mt-1">

                       {BusinessUnit === "DIGI" && <div className="w-full p-2 border-pink-500 border-2 sm:w-62 shadow-md mx-auto text-center">
                          <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                            Table Topper
                          </h1>
                          <div className="flex items-center justify-center">
                            {tableTopperTeamSrc ? (
                              <img
                                src={tableTopperTeamSrc}
                                alt={`${tableTopperTeam?.TeamName}`}
                                // width="100px"
                                // height="100px"
                              />
                            ) : (
                              <p className="text-[20px] font-custom font-bold text-pink-500">
                                {tableTopperTeam?.TeamName}
                              </p>
                            )}
                          </div>
                        </div>}
                        <div className="w-full p-16 mt-1 border-pink-500 border-2 sm:w-62 mx-auto shadow-md text-center">
                          <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                            Runs Scored By Boundries
                          </h1>
                          <p className="text-[22px] mt-2 font-custom font-bold text-pink-500">
                            {totalFours.TotalFours * 4 +
                              totalSixes.TotalSixes * 6}
                          </p>
                        </div>
                      </div>

                      {/* Summary - Adjusted to 1/3 width */}
                      <div className="w-full sm:w-[50%] p-3 mt-1 border-pink-500 border-2 shadow-md mx-auto text-center ">
                        <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                          Summary
                        </h1>
                        <div className="flex justify-center items-center">
                          <div className="sm:overflow-y-auto sm:overflow-x-hidden h-[300px]">
                            <table
                              className="w-full leading-normal sm:block"
                              id="doctorTable"
                            >
                              <thead>
                                <tr>
                                  <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Rk
                                  </th>
                                  <th className="px-[120px] py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    TEAMS
                                  </th>
                                  {/* <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    MTS
                                  </th> */}
                                  <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    SCORE
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rankData.map((item, index) => (
                                  <tr
                                    key={index}
                                    className="border bg-pink-200 even:bg-pink-100"
                                  >
                                    <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                      {index + 1}
                                    </td>
                                    <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                      {item.TeamName}
                                    </td>
                                    {/* <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                      {item.MatchesCount}
                                    </td> */}
                                    <td className="px-18 py-1 text-center font-custom  text-sm text-black">
                                      {item.teamScore}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Boundries Split */}
                      <div className="w-full sm:w-[25%] mt-1 p-3 border-pink-500 border-2 sm:w-62 shadow-md mx-auto text-center">
                        <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                          Boundries Split
                        </h1>
                        <Chart
                          className="mt-10"
                          chartType="PieChart"
                          data={chartData}
                          options={chartOptions}
                        />
                        <div className="flex justify-evenly items-center mt-4">
                          <div className="flex items-center">
                            <span className="block w-2 h-2  bg-[#ff8aa0] mr-2"></span>{" "}
                            {/* Green box */}
                            <p className="font-custom ">
                              Total 6: {totalSixes.TotalSixes}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="block w-2 h-2 bg-[#8c0050] mr-2"></span>{" "}
                            {/* Blue box */}
                            <p className="font-custom">
                              Total 4: {totalFours.TotalFours}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* // new Ui ends  */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
