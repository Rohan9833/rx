import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

const Notifications = () => {
  const pageName = "Notifications";
  const { id: adminId } = useParams();
  const [ids, setIds] = useState([]);
  const [mrIDs, setMrIDs] = useState([]);
  const [tlmIDs, setTlmIDs] = useState([]);
  const [flmIDs, setFlmIDs] = useState([]);
  const [specificIds, setSpecificIds] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState("");
  const [message, setMessage] = useState("");
  const [reciverIds, setReceiverIds] = useState([]);
  const [checkboxes, setCheckboxes] = useState({
    All: false,
    Tlm: false,
    Flm: false,
    Mr: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchId = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7501api/admin/allEntity-Id/${adminId}`
        );
        setIds(response.data.allTotalIds);
        setMrIDs(response.data.mrIDs); // Update with actual key from response
        setTlmIDs(response.data.tlmIDs); // Update with actual key from response
        setFlmIDs(response.data.flmIDs); // Update with actual key from response
      } catch (error) {
        console.log(error);
      }
    };
    fetchId();
  }, [adminId]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setCheckboxes((prevState) => {
      const newCheckboxes = {
        ...prevState,
        [name]: checked,
      };

      // Disable the "All" checkbox if any individual checkbox is checked
      if (name !== "All" && checked) {
        newCheckboxes.All = false;
      } else if (name === "All") {
        // Disable individual checkboxes if "All" checkbox is checked
        newCheckboxes.Tlm = false;
        newCheckboxes.Flm = false;
        newCheckboxes.Mr = false;
      }

      // Update receiver IDs based on the new checkbox state
      updateReceiverIds(newCheckboxes);

      return newCheckboxes;
    });
  };

  const updateReceiverIds = (checkboxes) => {
    let newReceiverIds = [];
    if (checkboxes.All) {
      newReceiverIds = [...mrIDs, ...tlmIDs, ...flmIDs];
    } else {
      if (checkboxes.Mr) {
        newReceiverIds = [...newReceiverIds, ...mrIDs];
      }
      if (checkboxes.Tlm) {
        newReceiverIds = [...newReceiverIds, ...tlmIDs];
      }
      if (checkboxes.Flm) {
        newReceiverIds = [...newReceiverIds, ...flmIDs];
      }
    }
    setReceiverIds(newReceiverIds);
  };

  const handleSelectChange = (e) => {
    const input = e.target.value;
    const idsArray = input
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
    setSpecificIds(idsArray);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const input = e.target.value.trim();
      if (input && !specificIds.includes(input)) {
        setSpecificIds((prev) => [...prev, input]);
        e.target.value = ""; // Clear the input field
      }
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
  };

  const handleDeleteSpecificId = (idToDelete) => {
    setSpecificIds((prev) => prev.filter((id) => id !== idToDelete));
  };

  const handleSubmit = async () => {
    if (!selectedFrom) {
      toast.error("Please enter message from");
      return;
    }
    if (!message) {
      toast.error("Please enter a message.");
      return;
    }

    // Combine the receiver IDs from checkboxes and specific input
    const combinedReceiverIds = [...reciverIds, ...specificIds];

    // Construct the data object
    const data = {
      message,
      reciverIds: combinedReceiverIds,
      from: selectedFrom,
    };

    //    console.log(data);

    try {
      // Make the POST request
      await axios.post(
        `http://localhost:7501api/admin/selected-notification/${adminId}`,
        data
      );
      //    toast.success("Data submitted successfully.");
      //  window.location.reload();
      setTimeout(() => {
        toast.success("Your message is sent as notification successfully");
      }, 0);

      setTimeout(() => {
        window.location.reload();
        window.scrollTo(0, 0);
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error("Error submitting data.");
    }
  };

  return (
    <>
      <Toaster />
      <div className="grid grid-cols-2 absolute max-h-[120vh]">
        <Sidebar />

        <div
          className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[120vh] sm:overflow-hidden"
          style={{ borderRadius: "80px" }}
        >
          <div className="h-[100px]">
            <Header pageName={pageName} />
          </div>

          <nav className="block w-full max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center"></div>
          </nav>
          <div className="sm:mt-[10px] mt-[40px] w-full h-auto">
            <div className="mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px] rounded-2xl">
              <div className="overflow-y-hidden max-h-screen sm:w-full w-full rounded-2xl shadow-md pl-10">
                <div className="flex justify-start items-center gap-10 p-4">
                  <div>
                    <span className="pr-2">All</span>
                    <input
                      type="checkbox"
                      name="All"
                      checked={checkboxes.All}
                      onChange={handleCheckboxChange}
                      disabled={
                        checkboxes.Tlm || checkboxes.Mr || checkboxes.Flm
                      }
                    />
                  </div>
                  <div>
                    <span className="pr-2">TLM</span>
                    <input
                      type="checkbox"
                      name="Tlm"
                      checked={checkboxes.Tlm}
                      disabled={checkboxes.All}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                  <div>
                    <span className="pr-2">FLM</span>
                    <input
                      type="checkbox"
                      name="Flm"
                      checked={checkboxes.Flm}
                      disabled={checkboxes.All}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                  <div>
                    <span className="pr-2">MR</span>
                    <input
                      type="checkbox"
                      name="Mr"
                      checked={checkboxes.Mr}
                      disabled={checkboxes.All}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                </div>
                <div className="flex justify-start">
                  <input
                    type="text"
                    onKeyDown={handleInputKeyDown}
                    className="w-50 border-2 text-left p-2"
                    placeholder="Type Specific Id"
                    disabled={checkboxes.All}
                  />
                </div>
                <div className="flex justify-start mt-2">
                  {specificIds.map((id, index) => (
                    <span
                      key={index}
                      className="mr-2 p-1 bg-gray-200 rounded flex items-center"
                    >
                      {id}
                      <button
                        type="button"
                        className="ml-2 text-red-600"
                        onClick={() => handleDeleteSpecificId(id)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex justify-start">
                  <input
                    type="text"
                    value={selectedFrom}
                    onChange={(e) => setSelectedFrom(e.target.value)}
                    className="w-50 border-2 mt-10 text-left p-2"
                    placeholder="From"
                  />
                </div>
                <div className="flex justify-start mt-20">
                  <h1 className="pr-10">Messages</h1>
                  <textarea
                    cols={50}
                    rows={10}
                    className="border-2 p-2"
                    value={message}
                    onChange={handleTextareaChange}
                  ></textarea>
                </div>
                <div className="flex justify-start items-center mt-10 mb-10">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-white focus:ring-4 bg-[#2b1c6d] font-medium rounded-full text-sm px-5 py-2.5 me-2 focus:outline-none"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
