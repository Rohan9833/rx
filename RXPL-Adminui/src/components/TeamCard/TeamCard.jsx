import { useState, useRef } from "react";
import axios from "axios";
import { AiFillPicture } from "react-icons/ai";
import { LiaEdit } from "react-icons/lia";
import { FaCamera } from "react-icons/fa";
// import { MdClear } from "react-icons/md";

const TeamCard = ({ teamKey }) => {
  const [file, setFile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [tName, setTName] = useState(teamKey);
  const fileRef = useRef(null);

  const handleFileChange = () => {
    const selectedFile = fileRef.current.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (file, teamKey) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teamName", teamKey);

    try {
      const res = await axios.put(
        "http://localhost:7501/api/updateLogo",
        formData
      );
      window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const clearFile = () => {
    setFile(null);
    fileRef.current.value = null; // Clear the file input
  };

  const handleTextChange = (TEAMname) => {
    setTName(TEAMname);
  };

  return (
    <div className="relative rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex flex-col justify-center items-center">
      {/* Edit Button */}
      <button
        className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        onClick={() => setEdit(!edit)}
        title="Edit Team Details"
      >
        <LiaEdit size={20} className="text-gray-600 dark:text-gray-200" />
      </button>
      <input
        type="file"
        ref={fileRef}
        hidden
        onChange={handleFileChange}
        accept="image/*"
      />

      <div
        className={`cursor-pointer flex justify-center items-center bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full overflow-hidden ${
          edit && "border-4 border-gray-700"
        } `}
        onClick={edit ? () => fileRef.current.click() : null}
        title="Click to upload a new logo"
      >
        {file || name.fileName ? (
          <img
            src={
              file
                ? URL.createObjectURL(file)
                : `http://localhost:7501/uploads/${name.fileName}`
            }
            alt="Team Logo"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {edit ? (
              <FaCamera size={40} className="text-gray-400" />
            ) : (
              <AiFillPicture size={40} className="text-gray-400" />
            )}
          </>
        )}
      </div>

      {!edit ? (
        <div className="mt-4 text-center">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            {/* Team: */}
            <span className="capitalize text-gray-600 dark:text-gray-400">
              {teamKey}
            </span>
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <label
            htmlFor="tName"
            className="text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            Update Team Name:
          </label>
          <input
            type="text"
            id="tName"
            value={tName}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter new team name"
          />
        </div>
      )}

      <div className="mt-4 flex justify-center gap-4">
        {(edit || file) && (
          <button
            onClick={() => handleUpload(name._id, file, tName, teamKey)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-all"
          >
            Save
          </button>
        )}
        {file && (
          <button
            onClick={clearFile}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md flex items-center gap-1 transition-all"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
