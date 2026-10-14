import Sidebar from "../Sidebar/Sidebar";
import SettingsDigi from "./SettingsDigi";
import SettingsLinux from "./SettingsLinux";

const Settings = () => {
  const BusinessUnit =
    sessionStorage.getItem("BusinessUnit") ||
    localStorage.getItem("BusinessUnit");

  const BU = BusinessUnit?.trim().toUpperCase();

  // ❌ Block access completely
  if (!["DIGI", "LINUX"].includes(BU)) {
    return null; // or redirect
  }

  return (
    <>
      <Sidebar />

      {/* ✅ DIGI → Spotlight Settings */}
      {BU === "DIGI" && <SettingsDigi />}

      {/* ✅ NPL → Excel / League Settings */}
      {BU === "LINUX" && <SettingsLinux />}
    </>
  );
};

export default Settings;
