import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Chart } from "react-google-charts";
import BackGroundImg from "../../assets/bg.png";
import PlayerImg from "../../assets/playerImg.png";

const defaultLogo = () => import("../../assets/mainLogo.gif");

const TeamWise = () => {
  const pageName = "TeamWise Stats";
  const { id: adminId } = useParams();

  // Consolidated loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTeamDataLoading, setIsTeamDataLoading] = useState(false);

  // State management
  const [AllTeamNames, setAllTeamNames] = useState([]);
  const [logoMap, setLogoMap] = useState({});
  const [selectedTeamName, setSelectedTeamName] =
    useState("Guwahati Champions");
  const [teamWiseData, setTeamWiseData] = useState({});
  const [rankData, setRankData] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [fullCenturies, setFullCenturies] = useState(0);
  const [halfCenturies, setHalfCenturies] = useState(0);

  // Team logos mapping
  const teamLogos = {
    "Delhi Fighters": () =>
      import("../../assets/50 & 100 Logo/100x100/DelhiFighters copy.png"),
    SouthThalaivas: () =>
      import("../../assets/50 & 100 Logo/100x100/SouthThalaivas.png"),
    WestWarriors: () =>
      import("../../assets/50 & 100 Logo/100x100/WestWarriors.png"),
    NorthDabangs: () =>
      import("../../assets/50 & 100 Logo/100x100/NorthDabangs.png"),
    EastTigers: () =>
      import("../../assets/50 & 100 Logo/100x100/EastTigers.png"),
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
    default: defaultLogo,
  };

  // Load all team names and logos on initial mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitialLoading(true);

        // Fetch all team names
        const response = await axios.get(
          `http://localhost:7501/api/getTeamNames`
        );
        const teams = response.data.allTeam;
        setAllTeamNames(teams);

        // Load logos for all teams
        const resolvedLogos = {};
        await Promise.all(
          teams.map(async (teamName) => {
            if (teamLogos[teamName]) {
              try {
                resolvedLogos[teamName] = await teamLogos[teamName]();
              } catch (error) {
                console.error(`Failed to load logo for ${teamName}:`, error);
              }
            }
          })
        );
        setLogoMap(resolvedLogos);

        // Load initial team data
        await loadTeamData(selectedTeamName);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeData();
    window.scrollTo(0, 0);
  }, []);

  const calculateTeamStats = () => {
    if (!rankData || rankData.length === 0) return;

    const stats = rankData.reduce(
      (acc, item) => {
        const score = parseInt(item.TotalScore) || 0;

        return {
          totalScore: acc.totalScore + score,
          bestScore: Math.max(acc.bestScore, score),
          centuries: acc.centuries + (score >= 100 ? 1 : 0),
          halfCenturies:
            acc.halfCenturies + (score >= 50 && score < 100 ? 1 : 0),
        };
      },
      { totalScore: 0, bestScore: 0, centuries: 0, halfCenturies: 0 }
    );

    setFinalScore(stats.totalScore);
    setBestScore(stats.bestScore);
    setFullCenturies(stats.centuries);
    setHalfCenturies(stats.halfCenturies);

    console.log("Total Score:", stats.totalScore);
    console.log("Best Score:", stats.bestScore);
    console.log("Full Centuries:", stats.centuries);
    console.log("Half Centuries:", stats.halfCenturies);
    console.log("Rank Data:", rankData);
  };

  useEffect(() => {
    calculateTeamStats();
  }, [rankData]);

  // Function to load team-specific data
  const loadTeamData = async (teamName) => {
    try {
      setIsTeamDataLoading(true);

      // Fetch both APIs in parallel
      const [teamDetailsResponse, pointsTableResponse] = await Promise.all([
        axios.get(`http://localhost:7501/api/getTeamDetails/${teamName}`),
        axios.get(
          `http://localhost:7501/api/getPointsTableByTeamName/${teamName}`
        ),
      ]);

      setTeamWiseData(teamDetailsResponse.data);
      console.log("Team Details Data:", teamDetailsResponse.data);

      if (pointsTableResponse.data.success) {
        setRankData(pointsTableResponse.data.data);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setIsTeamDataLoading(false);
    }
  };

  // Handle team selection
  const handleSelectTeamName = async (teamName) => {
    setSelectedTeamName(teamName);
    await loadTeamData(teamName);
  };

  // UPDATED: Chart configuration for Boundaries Split (4s and 6s)
  const chartData = [
    ["Type", "Count"],
    ["Fours", teamWiseData.Fours || 0],
    ["Sixes", teamWiseData.Sixes || 0],
  ];

  const chartOptions = {
    pieHole: 0.8,
    is3D: false,
    colors: ["#8c0050", "#ff8aa0"],
    backgroundColor: "transparent",
    chartArea: { width: "90%", height: "90%" },
    legend: {
      position: "top",
      alignment: "center",
      textStyle: { color: "#233238", fontSize: 14 },
    },
    pieSliceText: "none",
  };

  // Loading Screen Component
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-8 border-pink-100 border-b-pink-400 rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-pink-600 animate-pulse">
            Hang on Tight!
          </h2>
          <p className="mt-2 text-gray-600">
            We're getting the data ready for you...
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div
              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
  console.log("for best scoreeewe", teamWiseData)
  return (
    <div className="grid grid-cols-2 absolute max-h-[110vh]">
      <Sidebar />

      <div
        className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[135vh] sm:overflow-hidden"
        style={{ borderRadius: "80px" }}
      >
        <div className="h-[100px] mb-[-40px]">
          <Header pageName={pageName} />
        </div>

        <div className="sm:mt-[0px] mt-[40px] w-full h-auto">
          <div
            style={{
              backgroundImage: `url(${BackGroundImg})`,
              backgroundBlendMode: "overlay",
            }}
            className="bg-cover bg-no-repeat mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px]"
          >
            <div className="overflow-y-auto max-h-[120vh] w-full shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                {/* Team Logos Selection */}
                <div className="flex justify-evenly bg-pink-300 py-3">
                  {AllTeamNames.map((teamName) => (
                    <div
                      key={teamName}
                      className={`flex flex-col items-center justify-center m-2 transition-all duration-300 ${
                        selectedTeamName === teamName
                          ? "opacity-100 scale-110"
                          : "opacity-30 hover:opacity-60"
                      }`}
                    >
                      {logoMap[teamName]?.default && (
                        <img
                          src={logoMap[teamName].default}
                          alt={teamName}
                          className="w-[45px] cursor-pointer transition-transform hover:scale-110"
                          onClick={() => handleSelectTeamName(teamName)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Loading Overlay for Team Data */}
                {isTeamDataLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-pink-600 font-semibold">
                        Loading team data...
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats Cards - Row 1 */}
                <div className="sm:flex sm:justify-center sm:items-center gap-1 sm:flex-row">
                  <div className="w-full p-3 border-pink-500 border-2 sm:w-62 shadow-md mx-auto text-center">
                    <h1 className="sm:text-[15px] w-40 text-sm font-bold text-gray-500">
                      Matches Played
                    </h1>
                    <p className="text-[18px] font-custom font-bold text-pink-500">
                      {teamWiseData.TotalMatchesByTeam || 0}
                    </p>
                  </div>

                  <div className="w-full p-3 border-pink-500 border-2 sm:w-62 mx-auto shadow-md text-center">
                    <h1 className="sm:text-[15px] w-[100px] text-sm font-bold text-gray-500">
                      Best Score
                    </h1>
                    <p className="text-[18px] font-custom font-bold text-pink-500">
                      {teamWiseData.TeamHighestScore || 0}
                    </p>
                  </div>

                  <div className="w-full p-3 border-pink-500 border-2 sm:w-62 mx-auto shadow-md text-center">
                    <h1 className="sm:text-[15px] w-[160px] text-sm font-bold text-gray-500">
                      Lowest Score
                    </h1>
                    <p className="text-[18px] font-custom font-bold text-pink-500">
                      {teamWiseData.TeamLowestScore || 0}
                    </p>
                  </div>

                  <div className="w-full p-3 border-pink-500 border-2 sm:w-62 mx-auto shadow-md text-center">
                    <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                      Total Runs
                    </h1>
                    <p className="text-[18px] font-custom font-bold text-pink-500">
                      {finalScore || 0}
                    </p>
                  </div>
                </div>

                {/* Stats Cards - Row 2 */}
                <div className="sm:flex mt-1 sm:justify-center sm:items-center gap-1 sm:flex-row">
                  {/* Top Run Scorer */}
                  <div className="w-full p-3 border-pink-500 border-2 sm:w-62 shadow-md mx-auto text-center">
                    <div className="flex items-center justify-evenly w-full">
                      <div className="flex items-center">
                        <img
                          src={PlayerImg}
                          alt="player"
                          width="100px"
                          height="100px"
                        />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <h1 className="sm:text-[15px] mb-4 text-sm font-bold text-gray-500">
                          Top Run Scorer
                        </h1>
                        {rankData?.length > 0 &&
                          (() => {
                            const sortedData = [...rankData].sort(
                              (a, b) =>
                                parseInt(b.TotalScore) - parseInt(a.TotalScore)
                            );
                            const topScorer = sortedData[0];
                            return topScorer ? (
                              <div key={topScorer._id}>
                                <h1 className="sm:text-[18px] text-sm font-custom font-bold text-pink-500">
                                  {topScorer.USERNAME}
                                </h1>
                                <p className="text-[18px] font-custom font-bold text-pink-500">
                                  {topScorer.TotalScore}
                                </p>
                              </div>
                            ) : null;
                          })()}
                      </div>
                    </div>
                  </div>

                  {/* Best Score Player */}
                  <div className="w-full p-3 border-pink-500 border-2 sm:w-62 mx-auto shadow-md text-center">
                    <div className="flex items-center justify-evenly w-full">
                      <div className="flex items-center">
                        <img
                          src={PlayerImg}
                          alt="player"
                          width="100px"
                          height="100px"
                        />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <h1 className="sm:text-[15px] mb-4 text-sm font-bold text-gray-500">
                          Best Score
                        </h1>
                        {/* {teamWiseData?.PlayerScores &&
                          (() => {
                            const topScorer = Object.entries(
                              teamWiseData.PlayerScores
                            ).reduce(
                              (max, current) =>
                                current[1] > max[1] ? current : max,
                              [null, 0]
                            );
                            const [playerName, score] = topScorer;
                            return playerName ? (
                              <div key={playerName}>
                                <h1 className="sm:text-[18px] text-sm font-custom font-bold text-pink-500">
                                  {playerName}
                                </h1>
                                <p className="text-[18px] font-custom font-bold text-pink-500">
                                  {score}
                                </p>
                              </div>
                            ) : null;
                          })()} */}
                      </div>
                    </div>
                  </div>

                  {/* Best Average */}
                  <div className="w-full p-3 h-[144px] border-pink-500 border-2 sm:w-62 mx-auto shadow-md text-center">
                    <div className="flex items-center justify-evenly w-full">
                      <div className="flex items-center">
                        <img
                          src={PlayerImg}
                          alt="player"
                          width="100px"
                          height="100px"
                        />
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <h1 className="sm:text-[15px] mb-4 text-sm font-bold text-gray-500">
                          Best Average
                        </h1>
                        {/* {teamWiseData?.TopRunScorer &&
                          (() => {
                            const topScorer = Object.entries(
                              teamWiseData.TopRunScorer
                            ).reduce(
                              (max, current) =>
                                current[1] > max[1] ? current : max,
                              [null, 0]
                            );
                            const [playerName, score] = topScorer;
                            return playerName ? (
                              <div key={playerName}>
                                <h1 className="sm:text-[18px] text-sm font-custom font-bold text-pink-500">
                                  {playerName}
                                </h1>
                                <p className="text-[18px] font-custom font-bold text-pink-500">
                                  {(
                                    score /
                                    (teamWiseData.TotalMatchesByTeam || 1)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            ) : null;
                          })()} */}
                      </div>
                    </div>
                  </div>

                  {/* UPDATED: Centuries and Half Centuries (replaced 4s and 6s) */}
                  <div className="w-full p-3 h-[144px] border-pink-500 border-2 sm:w-100 mx-auto shadow-md text-center flex">
                    <div className="w-1/2 flex flex-col justify-center items-center border-r-2 border-pink-500">
                      <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                        Half Centuries <br/> (No. Players)
                      </h1>
                      <p className="text-[20px] font-custom font-bold text-pink-500 mt-2">
                        {halfCenturies || 0}
                      </p>
                    </div>
                    <div className="w-1/2 flex flex-col justify-center items-center">
                      <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                        Centuries <br/> (No. Players)
                      </h1>
                      <p className="text-[20px] font-custom font-bold text-pink-500 mt-2">
                        {fullCenturies || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="sm:flex gap-1">
                  {/* Most Wins/Losses Against */}
                  <div className="w-full sm:w-[25%] mt-1">
                    <div className="w-full sm:h-[200px] p-4 border-pink-500 border-2 shadow-md mx-auto text-center">
                      <h1 className="sm:text-[15px] text-sm font-bold text-gray-500 pt-2">
                        Most Wins Against
                      </h1>
                      <div className="flex items-center justify-center mt-4">
                        {/* {teamWiseData?.mostWinsAgainstTeam &&
                          Object.entries(teamWiseData.mostWinsAgainstTeam).map(
                            ([teamName]) => (
                              <div key={teamName}>
                                {logoMap[teamName]?.default && (
                                  <img
                                    src={logoMap[teamName].default}
                                    alt={teamName}
                                    className="w-[80px]"
                                  />
                                )}
                              </div>
                            )
                          )} */}
                      </div>
                    </div>

                    <div className="w-full p-10 mt-1 sm:h-[200px] border-pink-500 border-2 shadow-md mx-auto text-center">
                      <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                        Most Lost Against
                      </h1>
                      <div className="flex items-center justify-center mt-4">
                        {/* {teamWiseData?.mostLostAgainstTeam &&
                          Object.entries(teamWiseData.mostLostAgainstTeam).map(
                            ([teamName]) => (
                              <div key={teamName}>
                                {logoMap[teamName]?.default && (
                                  <img
                                    src={logoMap[teamName].default}
                                    alt={teamName}
                                    className="w-[80px]"
                                  />
                                )}
                              </div>
                            )
                          )} */}
                      </div>
                    </div>
                  </div>

                  {/* Player Scores Table */}
                  <div className="w-full sm:w-[50%] p-3 mt-1 border-pink-500 border-2 shadow-md mx-auto text-center">
                    <h1 className="sm:text-[15px] text-sm font-bold text-gray-500 mb-3">
                      Players Scores Table
                    </h1>
                    <div className="flex justify-center items-center">
                      <div className="sm:overflow-y-auto sm:overflow-x-hidden h-[380px]">
                        <table
                          className="w-full leading-normal"
                          id="doctorTable"
                        >
                          <thead className="sticky top-0 bg-white z-10">
                            <tr>
                              <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase">
                                Rk
                              </th>
                              <th className="px-20 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase">
                                Name
                              </th>
                              <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase">
                                AVG
                              </th>
                              <th className="px-10 py-2 border-2 text-center font-custom text-xs font-semibold text-gray-600 uppercase">
                                SCORE
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...rankData]
                              .sort(
                                (a, b) =>
                                  (parseInt(b.TotalScore) || 0) -
                                  (parseInt(a.TotalScore) || 0)
                              )
                              .map((item, index) => (
                                <tr
                                  key={index}
                                  className="border bg-pink-200 even:bg-pink-100"
                                >
                                  <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                    {index + 1}
                                  </td>
                                  <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                    {item.USERNAME}
                                  </td>
                                  <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                   {item.TotalMatches > 0
                                       ? (item.TotalScore / item.TotalMatches).toFixed(2)
                                       : 0}

                                  </td>

                                  <td className="px-18 py-1 text-center font-custom text-sm text-black">
                                    {item.TotalScore}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* UPDATED: Boundaries Split Chart (replaced Centuries Split) */}
                  <div className="w-full sm:w-[25%] mt-1 p-3 border-pink-500 border-2 shadow-md mx-auto text-center">
                    <h1 className="sm:text-[15px] text-sm font-bold text-gray-500">
                      Boundaries Split
                    </h1>
                    <Chart
                      className="mt-10"
                      chartType="PieChart"
                      data={chartData}
                      options={chartOptions}
                    />
                    <div className="flex justify-evenly items-center mt-4">
                      <div className="flex items-center">
                        <span className="block w-2 h-2 bg-[#d90166] mr-2"></span>
                        <p className="font-custom text-xs">
                          Total 4s: {teamWiseData.Fours || 0}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="block w-2 h-2 bg-[#f51b47] mr-2"></span>
                        <p className="font-custom text-xs">
                          Total 6s: {teamWiseData.Sixes || 0}
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
    </div>
  );
};

export default TeamWise;
