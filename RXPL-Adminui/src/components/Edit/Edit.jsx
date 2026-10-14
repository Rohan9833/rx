import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/Sidebar";
import TeamCard from "../TeamCard/TeamCard";
import Header from "../Header/Header";

const Edit = () => {
  const pageName = "Edit Logo";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [teamData, setTeamData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:7501/api/getTeamNames");
      setTeamData(res.data.allTeam);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Sidebar />
      <div
        className="sm:w-[84vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-auto sm:overflow-hidden"
        style={{
          borderTopLeftRadius: "80px",
          // borderBottomLeftRadius: "80px",
        }}
      >
        <div className="h-[100px]">
          <Header pageName={pageName} />
        </div>

        <div className="flex justify-center items-center sm:ml-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-12 h-auto w-full">
            {teamData.map((teamKey) => (
              <TeamCard teamKey={teamKey} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
