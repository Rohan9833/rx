import React from "react";
import Login from "./components/Login/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Reports from "./components/Reports/Reports";
import ApprovalsPage from "./components/Approvals/Approvals";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Edit from "./components/Edit/Edit";
import './App.css'
import PlayersComparision from "./components/PlayersCompare/PlayersComparision";
import TeamWise from "./components/TeamWiseStats/TeamWise";
import LiveUserCount from "./components/LiveUserPage/LiveUserCount";
import MatchSummary from "./components/MatchDetails/MatchSummary";
import ReplyPage from "./components/QueryReply/ReplyPage";
import PlayersPresent from "./components/PlayersDatabase/PlayersPresent";
import UserScreenTime from "./components/UserScreenTime/UserScreenTime";
import WeeklyLeaderboard from "./WeeklyLeaderboard/WeeklyLeaderboard";
import Insight from "./components/Insights/Insights";
import UserManagement from "./components/UserManagment/UserManagement";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/reports/:id" element={<Reports />} />
          <Route path="/approvals/:id" element={<ApprovalsPage />} />
          <Route path="/settings/:id" element={<Settings />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/PlayersComprare/:id" element={<PlayersComparision />} />
          <Route path="/TeamWiseStats/:id" element={<TeamWise />} />
          <Route path="/LiveUser/:id" element={<LiveUserCount />} />
          <Route path="/MatchDetails/:id" element={<MatchSummary />} />
          <Route path="/QueryDetails/:id" element={<ReplyPage />} />
          <Route path="/PlayersData/:id" element={<PlayersPresent />} />
          <Route path="/UserScreenTime/:id" element={<UserScreenTime />} />
          <Route path="/weeklyLeaderboard/:id" element={<WeeklyLeaderboard/>} />
          <Route path="/insight/:id" element={<Insight/>} />
          <Route path="/user-management/:id" element={<UserManagement />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;


/*
import React from "react";
import Login from "./components/Login/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Reports from "./components/Reports/Reports";
import ApprovalsPage from "./components/Approvals/Approvals";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Edit from "./components/Edit/Edit";
import './App.css'
import PlayersComparision from "./components/PlayersCompare/PlayersComparision";
import TeamWise from "./components/TeamWiseStats/TeamWise";
import LiveUserCount from "./components/LiveUserPage/LiveUserCount";
import MatchSummary from "./components/MatchDetails/MatchSummary";
import ReplyPage from "./components/QueryReply/ReplyPage";
import PlayersPresent from "./components/PlayersDatabase/PlayersPresent";
import UserScreenTime from "./components/UserScreenTime/UserScreenTime";
import WeeklyLeaderboard from "./WeeklyLeaderboard/WeeklyLeaderboard";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/reports/:id" element={<Reports />} />
          <Route path="/approvals/:id" element={<ApprovalsPage />} />
          <Route path="/settings/:id" element={<Settings />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/PlayersComprare/:id" element={<PlayersComparision />} />
          <Route path="/TeamWiseStats/:id" element={<TeamWise />} />
          <Route path="/LiveUser/:id" element={<LiveUserCount />} />
          <Route path="/MatchDetails/:id" element={<MatchSummary />} />
          <Route path="/QueryDetails/:id" element={<ReplyPage />} />
          <Route path="/PlayersData/:id" element={<PlayersPresent />} />
          <Route path="/UserScreenTime/:id" element={<UserScreenTime />} />
          <Route path="/weeklyLeaderboard/:id" element={<WeeklyLeaderboard/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
*/
