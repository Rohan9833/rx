import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const ReadNotification = () => {
  const pageName = "Notifications";
  const { id: userId } = useParams();
  const colors = ["#8536D8", "#3498db", "#27ae60"]; // Add your desired colors

  const [notification, setNotification] = useState([]);
  const [headerRefresh, setHeaderRefresh] = useState(0);

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:7501api/mr/get-all-notification/${userId}`
        );

        setNotification(data.reverse());
        // console.log(data); // Log the data to ensure it is being fetched correctly
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotification();
  }, [userId]); // Include userId in the dependency array

  const handleChangeCheck = async (e) => {
    // console.log(e._id);
    try {
      const updatedStatus = !e.Status;
      const response = await axios.put(
        `http://localhost:7501api/mr/update-notification-status/${userId}/${e._id}`
      );
      if (response.data.success) {
        toast.success("Notification Read Success");
        // window.location.reload();
        setNotification((prev) =>
          prev.map((item) =>
            item._id === e._id ? { ...item, Status: updatedStatus } : item
          )
        );
        // Trigger header refresh
        setHeaderRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="grid grid-cols-2 absolute max-h-[120vh] ">
        <Sidebar />

        <div
          className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[210px] left-[10px] h-[150vh] sm:overflow-hidden"
          style={{ borderRadius: "80px" }}
        >
          <div className="h-[100px]">
            <Header pageName={pageName} key={headerRefresh} />
          </div>

          <nav className="block w-full  max-w-full bg-transparent text-white shadow-none rounded-xl transition-all px-0 py-1">
            <div className="flex flex-col-reverse justify-start gap-6 md:flex-row md:items-center">
              <div className="capitalize relative top-[-10px] sm:left-[45px] left-[8px] w-[90vw] sm:w-[70vw]">
                <div className="relative lg:h-[60vh] top-[30px] w-full overflow-auto">
                  <table className="w-full divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-10 py-3 text-center text-sm font-bold text-black tracking-wider relative border border-gray-200">
                          Date
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-black tracking-wider relative border border-gray-200">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-black tracking-wider border border-gray-200">
                          From
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-black tracking-wider border border-gray-200">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {notification.map((nfs, index) => (
                        <tr key={index}>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-center text-sm text-black">
                            {nfs.Date || "-"}
                          </td>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-left text-sm text-black">
                            {nfs.Messages || "-"}
                          </td>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-center text-sm text-black">
                            {nfs.From || "-"}
                          </td>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-center text-sm text-black">
                            <input
                              type="checkbox"
                              style={{ width: "20px", height: "30px" }}
                              disabled={nfs.Status === true}
                              checked={nfs.Status}
                              onChange={() => handleChangeCheck(nfs)}
                            />
                          </td>
                        </tr>
                      ))}
                      {/* {[
                        ...notification.filter((nfs) => !nfs.Status), // Filtered notifications with Status as false (unread)
                        ...notification.filter((nfs) => nfs.Status), // Filtered notifications with Status as true (read)
                      ].map((nfs, index) => (
                        <tr key={index}>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-center text-sm text-black">
                            {nfs.Date || "-"}
                          </td>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-left text-sm text-black">
                            {nfs.Messages || "-"}
                          </td>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-center text-sm text-black">
                            {nfs.From || "-"}
                          </td>
                          <td className="px-2 py-4 border-b border-gray-200 bg-white text-center text-sm text-black">
                            <input
                              type="checkbox"
                              style={{ width: "20px", height: "30px" }}
                              disabled={nfs.Status === true}
                              checked={nfs.Status}
                              onChange={() => handleChangeCheck(nfs)}
                            />
                          </td>
                        </tr>
                      ))} */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </nav>
          <div className="sm:mt-[40px] mt-[40px] w-full h-auto ">
            <div className="mb-4 sm:grid-cols-2 w-[30vw] sm:w-[80vw] grid gap-y-10 gap-0 grid-cols-1 relative sm:left-[45px] left-[45px]"></div>

            {/* New UI */}
            {/* ... */}
          </div>

          {/* New UI ends */}
        </div>
      </div>
    </>
  );
};

export default ReadNotification;
