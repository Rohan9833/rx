import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import BackGroundImg from "../../assets/bg.png";

const PlayersComparision = () => {
  const pageName = "Players Compare";
  const { id: adminId } = useParams();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectMr, setSelectedMr] = useState();
  const [selectMr2, setSelectedMr2] = useState();
  const [selectMr3, setSelectedMr3] = useState();
  const [getAllMr, setAllMr] = useState([]);

  const [playerData1, setPlayerData1] = useState([]);
  const [playerData2, setPlayerData2] = useState([]);
  const [playerData3, setPlayerData3] = useState([]);

  //   const selectedPlayers = [playerData1, playerData2, playerData3].filter(Boolean);

  useEffect(() => {
    const fetchAllMrNames = async () => {
      try {
        const response = await axios.get(
          "http://localhost:7501/api/getMrNames"
        );
        setAllMr(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllMrNames();
  }, []);

  const handleSelectedMr1 = async (e) => {
    setSelectedMr(e.target.value);
    const response = await axios.get(
      `http://localhost:7501/api/playerDetails/${e.target.value}`
    );
    setPlayerData1(response.data.data);
  };

  const handleSelectedMr2 = async (e) => {
    setSelectedMr2(e.target.value);
    const response = await axios.get(
      `http://localhost:7501/api/playerDetails/${e.target.value}`
    );
    setPlayerData2(response.data.data);
  };

  const handleSelectedMr3 = async (e) => {
    setSelectedMr3(e.target.value);
    const response = await axios.get(
      `http://localhost:7501/api/playerDetails/${e.target.value}`
    );
    setPlayerData3(response.data.data);
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

  const [logos, setLogos] = useState({});

  useEffect(() => {
    const loadLogos = async () => {
      const loadedLogos = {};
      for (const team in teamLogos) {
        loadedLogos[team] = await teamLogos[team]().then((mod) => mod.default);
      }
      setLogos(loadedLogos);
    };
  
    loadLogos();
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 absolute max-h-[110vh] ">
        <Sidebar />

        <div
          className="sm:w-[82vw] w-[92vw]  z-1 bg-white  absolute  sm:left-[210px] left-[10px] h-[115vh] sm:overflow-hidden"
          style={{ borderRadius: "80px" }}
        >
          <div className="h-[100px] mb-[-30px]">
            <Header pageName={pageName} />
          </div>

          <nav className="block w-full max-w-full bg-transparent text-black shadow-none rounded-xl transition-all px-0 py-1">
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
              <div
                style={{
                  backgroundImage: `url(${BackGroundImg})`,
                  backgroundBlendMode: "overlay",
                }}
                className="bg-cover p-10 bg-no-repeat capitalize relative top-[-10px] sm:left-[45px] left-[49px] w-[70vw] sm:w-[80vw]"
              >
                {/* <div className="sm:flex sm:flex-row gap-4 sm:justify-center flex justify-center flex-col">
                  <div className="mr-2">
                    <h3>Player 1: </h3>
                    <select
                      value={selectMr}
                      onChange={(e) => handleSelectedMr1(e)}
                      className="p-2 mt-2 border rounded sm:w-[310px] w-[220px]"
                    >
                      <option value="">Select Player1</option>
                      {getAllMr
                        .filter(
                          (mr) =>
                            mr.USERNAME !== selectMr2 &&
                            mr.USERNAME !== selectMr3
                        )
                        .map((mr, index) => (
                          <option
                            key={index}
                            className="uppercase text-[15px]"
                            value={mr.USERNAME}
                          >
                            {mr.USERNAME}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mr-2">
                    <h3>Player 2: </h3>
                    <select
                      value={selectMr2}
                      onChange={(e) => handleSelectedMr2(e)}
                      className="p-2 mt-2 border rounded sm:w-[310px] w-[220px]"
                    >
                      <option value="">Select Player2</option>
                      {getAllMr
                        .filter(
                          (mr) =>
                            mr.USERNAME !== selectMr &&
                            mr.USERNAME !== selectMr3
                        ) // Filter out selected players
                        .map((mr, index) => (
                          <option
                            key={index}
                            className="uppercase text-[15px]"
                            value={mr.USERNAME}
                          >
                            {mr.USERNAME}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mr-2">
                    <h3>Player 3: </h3>
                    <select
                      value={selectMr3}
                      onChange={(e) => handleSelectedMr3(e)}
                      className="p-2 mt-2 border rounded sm:w-[310px] w-[220px]"
                    >
                      <option value="">Select Player3</option>
                      {getAllMr
                        .filter(
                          (mr) =>
                            mr.USERNAME !== selectMr &&
                            mr.USERNAME !== selectMr2
                        ) // Filter out selected players
                        .map((mr, index) => (
                          <option
                            key={index}
                            className="uppercase text-[15px]"
                            value={mr.USERNAME}
                          >
                            {mr.USERNAME}
                          </option>
                        ))}
                    </select>
                  </div>
                </div> */}

                <div className="flex gap-8 justify-center items-center">
                  <div className={` mr-[-30px] w-[200px] mt-4`}>
                    <table className="table-auto border-collapse w-full">
                      <tbody className="w-full text-left">
                        <React.Fragment>
                          <tr>
                            <td className="border-b-2 border-black px-4 text-[13px] font-bold text-gray-600 py-2">
                              Name
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black px-4 text-[13px] font-bold  text-gray-600 py-2">
                              TeamName
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black px-4 text-[13px] font-bold  text-gray-600 py-2">
                              HQ
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold text-gray-600 px-4 py-2">
                              Region
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold text-gray-600 px-4 py-2">
                              Zone
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold text-gray-600 px-4 py-2">
                              TotalScore
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black px-4 text-[13px] font-bold text-gray-600 py-2">
                              Matches
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold  text-gray-600 px-4 py-2">
                              Total Sixes
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold text-gray-600 px-4 py-2">
                              Total Fours
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold text-gray-600 px-4 py-2">
                              Average
                            </td>
                          </tr>
                          <tr>
                            <td className="border-b-2 border-black text-[13px] font-bold text-gray-600 px-4 py-2">
                              Best
                            </td>
                          </tr>
                        </React.Fragment>
                      </tbody>
                    </table>
                  </div>
                  <div
                    className={`border-purple-800 mr-1 border-2  w-[270px] ${
                      playerData1?.length > 0 ? `h-[450px]` : `h-[450px]`
                    }`}
                  >
                    <table className="table-auto border-collapse w-full">
                      <tbody className="w-full text-center ">
                        <select
                          value={selectMr}
                          onChange={(e) => handleSelectedMr1(e)}
                          className="p-2 border-b-2 border-purple-800 sm:w-[265px]"
                        >
                          <option value="">Select Player1</option>
                          {getAllMr
                            .filter(
                              (mr) =>
                                mr.USERNAME !== selectMr2 &&
                                mr.USERNAME !== selectMr3
                            )
                            .map((mr, index) => (
                              <option
                                key={index}
                                className="uppercase text-[15px]"
                                value={mr.USERNAME}
                              >
                                {mr.USERNAME}
                              </option>
                            ))}
                        </select>
                        {playerData1?.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Team:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item.USERNAME}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {logos[item.TEAMNAME] ? (
                                <div className="flex justify-center items-center">
                                <img
                                  src={logos[item.TEAMNAME]}
                                  alt={item.TEAMNAME}
                                  className="w-[45px] cursor-pointer"
                                />
                                </div>
                              ) : (
                                <td className="border px-4 text-[13px]   py-2">
                                {item.TEAMNAME || "-"}
                              </td>
                              )}
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border px-4  py-2 ">
                                Hq:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item.HQ}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border px-4  py-2 ">
                                Region:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.REGION}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Zone:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.ZONE}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Runs:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.TotalScore}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Matches:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item.TotalMatches}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Total Sixes:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.TotalSixes}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Total Fours:
                              </td> */}
                              <td className="border text-[13px]    px-4 py-2">
                                {item.TotalFours}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Average:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {parseInt(
                                  item.TotalScore / item.TotalMatches
                                ) || "0"}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Best:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.BestScore}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className={`border-purple-800 mr-1 mt-2 border-2 rounded w-[270px] ${
                      playerData2?.length > 0 ? `h-[450px]` : `h-[450px]`
                    }`}
                  >
                    <table className="table-auto border-collapse w-full">
                      <tbody className="w-full text-center">
                        <select
                          value={selectMr2}
                          onChange={(e) => handleSelectedMr2(e)}
                          className="p-2 border-b-2 border-purple-800 sm:w-[265px]"
                        >
                          <option value="">Select Player2</option>
                          {getAllMr
                            .filter(
                              (mr) =>
                                mr.USERNAME !== selectMr &&
                                mr.USERNAME !== selectMr3
                            ) // Filter out selected players
                            .map((mr, index) => (
                              <option
                                key={index}
                                className="uppercase text-[15px]"
                                value={mr.USERNAME}
                              >
                                {mr.USERNAME}
                              </option>
                            ))}
                        </select>
                        {playerData2?.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Team:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item.USERNAME}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                            {logos[item.TEAMNAME] ? (
                                <div className="flex justify-center items-center">
                                <img
                                  src={logos[item.TEAMNAME]}
                                  alt={item.TEAMNAME}
                                  className="w-[45px] cursor-pointer"
                                />
                                </div>
                              ) : (
                                <td className="border px-4 text-[13px]   py-2">
                                {item.TEAMNAME || "-"}
                              </td>
                              )}
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border px-4  py-2 ">
                                Hq:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item.HQ}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border px-4  py-2 ">
                                Region:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.REGION}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Zone:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.ZONE}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Runs:
                              </td> */}
                              <td className="border text-[13px]    px-4 py-2">
                                {item.TotalScore}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Matches:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item.TotalMatches}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Total Sixes:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.TotalSixes}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Total Fours:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.TotalFours}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Average:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {parseInt(
                                  item.TotalScore / item.TotalMatches
                                ) || "0"}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Best:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.BestScore}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className={`border-purple-800 mr-1 mt-2 border-2 rounded w-[270px] ${
                      playerData3?.length > 0 ? `h-[450px]` : `h-[450px]`
                    }`}
                  >
                    <table className="table-auto border-collapsew-full">
                      <tbody className="w-full text-center">
                        <select
                          value={selectMr3}
                          onChange={(e) => handleSelectedMr3(e)}
                          className="p-2 border-b-2 border-purple-800 sm:w-[265px]"
                        >
                          <option value="">Select Player3</option>
                          {getAllMr
                            .filter(
                              (mr) =>
                                mr.USERNAME !== selectMr &&
                                mr.USERNAME !== selectMr2
                            ) // Filter out selected players
                            .map((mr, index) => (
                              <option
                                key={index}
                                className="uppercase text-[15px]"
                                value={mr.USERNAME}
                              >
                                {mr.USERNAME}
                              </option>
                            ))}
                        </select>
                        {playerData3?.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Team:
                              </td> */}
                              <td className="border capitalize px-4 text-[13px]   py-2">
                                {item.USERNAME}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                            {logos[item.TEAMNAME] ? (
                                <div className="flex justify-center items-center">
                                <img
                                  src={logos[item.TEAMNAME]}
                                  alt={item.TEAMNAME}
                                  className="w-[45px] cursor-pointer"
                                />
                                </div>
                              ) : (
                                <td className="border px-4 text-[13px]   py-2">
                                {item.TEAMNAME || "-"}
                              </td>
                              )}
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border px-4  py-2 ">
                                Hq:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item?.HQ}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border px-4  py-2 ">
                                Region:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item?.REGION}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Zone:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item?.ZONE}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Runs:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item?.TotalScore}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Matches:
                              </td> */}
                              <td className="border px-4 text-[13px]   py-2">
                                {item?.TotalMatches}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Total Sixes:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item?.TotalSixes}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Total Fours:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item?.TotalFours}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100">
                              {/* <td className="border  px-4 py-2 ">
                                Average:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {parseInt(
                                  item?.TotalScore / item?.TotalMatches
                                ) || "0"}
                              </td>
                            </tr>
                            <tr className="bg-pink-200 even:bg-pink-100"  >
                              {/* <td className="border  px-4 py-2 ">
                                Best:
                              </td> */}
                              <td className="border text-[13px]   px-4 py-2">
                                {item.BestScore}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* // new Ui ends  */}
        </div>
      </div>
    </>
  );
};

export default PlayersComparision;
