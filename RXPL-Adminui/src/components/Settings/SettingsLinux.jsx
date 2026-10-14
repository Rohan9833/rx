import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { toast, Toaster } from "react-hot-toast";
import BackGroundImg from "../../assets/bg.png";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const HOST = window.location.hostname;
const BASE_URL = "http://localhost:7501";

const SortableRow = ({
  id,
  index,
  fileName,
  active,
  uploadDate,  // ✅ Add this prop
  onView,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="bg-white border-b hover:bg-[#F9FAFB] transition-colors"
    >
      <td className="px-3 cursor-grab" {...attributes} {...listeners}>
        ☰
      </td>

      <td className="px-[90px] py-2">{index + 1}</td>

      <td className="px-8 py-2 truncate">{fileName}</td>

      {/* ✅ Add Date Column */}
      <td className="px-6 py-2 text-center text-sm text-gray-700">
        {uploadDate}
      </td>

      <td className="px-6 py-2 text-center flex items-center justify-center gap-4">
        <button onClick={onView} className="text-blue-600">
          View
        </button>

        <button onClick={onEdit} className="text-orange-500">
          Edit
        </button>

        <button onClick={onDelete} className="text-red-500">
          ✕
        </button>

        {/* ACTIVE TOGGLE */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={onToggle}
            className="sr-only peer"
          />

          {/* Track */}
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200"></div>

          {/* Thumb */}
          <div
            className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full
                  transition-transform duration-200
                  peer-checked:translate-x-5"
          ></div>
        </label>
      </td>
    </tr>
  );
};


const Settings = () => {
  const BusinessUnit = sessionStorage.getItem("BusinessUnit");
  const adminId = sessionStorage.getItem("UserId");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [noMatchImage, setNomatchImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null);
  const [currentSpotlightImages, setCurrentSpotlightImages] = useState([]);
  const [uploadImage, setUploadImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const imageInputRef = useRef(null);
  const isDigiUser = BusinessUnit?.trim().toUpperCase() === "DIGI";

  const [editingImageUrl, setEditingImageUrl] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createPreview, setCreatePreview] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const pageName = "Spotlight";

  const fetchCurrentSpotlight = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/getAllNoMatchImages`);
      if (response.data.success) {
        setCurrentSpotlightImages(response.data.images);
      }
    } catch (error) {
      console.error("Error fetching spotlight images:", error);
      setCurrentSpotlightImages([]);
    }
  };

  useEffect(() => {
    fetchCurrentSpotlight();
  }, []);

  // const handleNoMatchImageSelect = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setNomatchImage(file);
  //     setImagePreview(URL.createObjectURL(file));
  //   }
  // };
  const handleNoMatchImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNomatchImage(file);

    // EDIT MODE
    if (editingImageUrl) {
      setEditPreview(URL.createObjectURL(file));
      setIsEditModalOpen(true);
    }
    // CREATE MODE
    else {
      setCreatePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitSchedule = async () => {
    if (!startDate || !endDate) {
      return toast.error("Please select both start and end dates");
    }

    if (new Date(startDate) > new Date(endDate)) {
      return toast.error("End date must be after start date");
    }

    setScheduleLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/createMatchSchedule`, {
        userId: adminId,
        startDate,
        endDate,
        businessUnit: BusinessUnit,
      });

      if (response.data.success) {
        toast.success("Match schedule created successfully");
        setStartDate("");
        setEndDate("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  // const handleCancelImage = () => {
  //   setNomatchImage(null);
  //   setImagePreview(null);
  //   if (imageInputRef.current) imageInputRef.current.value = null;
  // };
  const handleCancelImage = () => {
    setNomatchImage(null);
    setCreatePreview(null);
    setEditPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = null;
  };

  const handleUploadNoMatchImage = async () => {
    if (!noMatchImage) return toast.error("Please select an image");
    setUploadImage(true);
    try {
      const formData = new FormData();
      formData.append("image", noMatchImage);
      await axios.post(
        `${BASE_URL}/api/uploadNoMatchImage/${adminId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Image uploaded successfully");
      handleCancelImage();
      fetchCurrentSpotlight();
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setUploadImage(false);
    }
  };

  // const handleDeleteImage = async (fileName) => {
  //   if (!window.confirm("Are you sure?")) return;

  //   try {
  //     await axios.delete(`${BASE_URL}/api/deleteNoMatchImage/${fileName}`);
  //     toast.success("Image deleted");
  //     fetchCurrentSpotlight();
  //   } catch {
  //     toast.error("Delete failed");
  //   }
  // };
  const handleDeleteImage = (fileName) => {
    setDeleteTarget(fileName);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/deleteNoMatchImage/${deleteTarget}`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchCurrentSpotlight();
    } catch {
      toast.error("Delete failed");
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const getImageUploadDate = (url) => {
  try {
    const timestamp = url.split('?t=')[1];
    if (!timestamp) return 'N/A';
    
    const date = new Date(parseInt(timestamp));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    return 'N/A';
  }
};

  const handleEditImage = async () => {
    if (!noMatchImage || !editingImageUrl) {
      return toast.error("Please select an image");
    }

    setUploadImage(true);
    try {
      const formData = new FormData();
      formData.append("image", noMatchImage);

      await axios.put(
        `${BASE_URL}/api/editNoMatchImage/${adminId}/${editingImageUrl}`,
        formData
      );

      toast.success("Image updated");
      closeEditModal();
      fetchCurrentSpotlight();
    } catch {
      toast.error("Update failed");
    } finally {
      setUploadImage(false);
    }
  };

  const toggleActive = async (fileName, current) => {
    try {
      await axios.put(`${BASE_URL}/api/toggleNoMatchImage/${fileName}`, {
        active: !current,
      });

      setCurrentSpotlightImages((prev) =>
        prev.map((img) =>
          img.fileName === fileName ? { ...img, active: !current } : img
        )
      );
    } catch {
      toast.error("Toggle failed");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingImageUrl(null);
    handleCancelImage(); // resets preview & file input
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCurrentSpotlightImages((items) => {
      const oldIndex = items.findIndex((i) => i.fileName === active.id);
      const newIndex = items.findIndex((i) => i.fileName === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Persist order
      axios.post(`${BASE_URL}/api/reorderNoMatchImages`, {
        images: newOrder.map((i) => i.fileName),
      });

      return newOrder;
    });
  };

return (
    <div className="grid grid-cols-2 absolute max-h-[110vh]">
      <Sidebar />

      <div
        className="sm:w-[82vw] w-[92vw] z-1 bg-white absolute sm:left-[220px] left-[10px] min-h-[125vh] overflow-x-hidden"
        style={{ borderRadius: "80px" }}
      >
        {/* Header */}
        <div className="h-[100px] mb-[-40px]">
          <Header pageName={pageName} />
        </div>

        {/* Content */}
        <div className="sm:mt-[0px] mt-[40px] w-full h-auto">
          <div
            style={{
              backgroundImage: `url(${BackGroundImg})`,
              backgroundBlendMode: "overlay",
            }}
            className="bg-cover bg-no-repeat mx-auto max-w-screen sm:w-[80vw] relative sm:left-[10px] border-pink-500 border-2"
          >
            <div className="overflow-y-auto max-h-[120vh] w-full shadow-md overflow-hidden px-6 pb-0"></div>
            {!isDigiUser && (
              <div className="max-w-7xl mx-auto flex flex-col gap-10 mt-10 px-6 pb-10">
                
                {/* Spotlight Inventory Table - Moved above */}
                <div className="bg-white rounded-[40px] shadow-sm border relative flex flex-col">
                  {/* Header with Add Button */}
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#1F2D3D]">
                      Spotlight Inventory
                    </h2>
                   
		    <div className="flex flex-col items-center gap-1">
                      {/* <span className="bg-[#F1F4F8] text-[#4B5A6B] px-4 py-1 rounded-full text-sm font-bold">
                        {currentSpotlightImages.length} Images
                      </span> */}

                      <button
                        onClick={() => imageInputRef.current.click()}
                        className="bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <span className="text-lg">+</span>
                        Add Image
                      </button>
                      <span className="text-[#4B5A6B] px-4 py-1 rounded-full text-sm">
                       300x300 Pixel
                      </span>
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={imageInputRef}
                        hidden
                        onChange={handleNoMatchImageSelect}
                        accept="image/*"
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto max-h-[450px] overflow-y-auto px-2 pb-4">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-white z-20">
                        <tr className="text-[#90A0B7] uppercase text-[11px] font-bold tracking-[2px]">
                          <th className="px-3 py-4 bg-white">Sequence</th>
                          <th className="px-20 py-4 text-left bg-white">
                            Sr No.
                          </th>
                          <th className="px-10 py-4 text-left bg-white">
                            Image Name
                          </th>
                          <th className="px-6 py-4 text-center bg-white">Upload Date</th>
                          <th className="px-8 py-4 text-center bg-white">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={currentSpotlightImages.map(
                            (img) => img.fileName
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          <tbody>
                            {currentSpotlightImages.map((img, idx) => (
                              <SortableRow
                                key={img.fileName}
                                id={img.fileName}
                                index={idx}
                                fileName={img.fileName}
                                active={img.active}
                                uploadDate={getImageUploadDate(img.url)}
                                onView={() => setSelectedImage(img)}
                                onEdit={() => {
                                  setEditingImageUrl(img.fileName);
                                  imageInputRef.current.click();
                                }}
                                onDelete={() => handleDeleteImage(img.fileName)}
                                onToggle={() =>
                                  toggleActive(img.fileName, img.active)
                                }
                              />
                            ))}
                          </tbody>
                        </SortableContext>
                      </DndContext>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Upload Preview Modal - Shows when image is selected in create mode */}
          {createPreview && !editingImageUrl && (
            <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-6">
              <div className="bg-white rounded-[40px] p-10 w-full max-w-md relative">
                <button
                  onClick={handleCancelImage}
                  className="absolute top-6 right-6 bg-[#F9FAFB] hover:bg-[#E0E6ED] text-[#4B5A6B] rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold"
                >
                  ×
                </button>

                <h2 className="text-[28px] font-bold text-[#1F2D3D] mb-8">
                  Upload Spotlight Image
                </h2>

                <div className="w-full h-56 border-2 border-dashed rounded-3xl flex items-center justify-center bg-[#F9FAFB] overflow-hidden">
                  <img
                    src={createPreview}
                    className="w-full h-full object-contain rounded-2xl"
                    alt="Upload Preview"
                  />
                </div>

                <button
                  onClick={handleUploadNoMatchImage}
                  disabled={uploadImage}
                  className="w-full mt-10 py-2 bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white text-lg font-bold rounded-2xl shadow-lg disabled:opacity-50"
                >
                  {uploadImage ? "Uploading..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* View Modal */}
          {selectedImage && (
            <div className="fixed inset-0 z-[1000] bg-[#1F2D3D]/60 flex items-center justify-center p-6 backdrop-blur-sm">
              <div className="bg-white rounded-[40px] max-w-3xl w-full relative overflow-hidden shadow-2xl p-10 animate-in zoom-in duration-300">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 bg-[#F9FAFB] hover:bg-[#E0E6ED] text-[#4B5A6B] rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold"
                >
                  ×
                </button>

                <h3 className="text-2xl font-bold text-[#1F2D3D] mb-6 pr-16 truncate">
                  Preview: {selectedImage.fileName}
                </h3>

                <div
                  className="rounded-3xl border-8 border-[#F9FAFB] bg-[#F8F9FB]
                flex items-center justify-center
                h-[60vh] w-full overflow-hidden"
                >
                  <img
                    src={selectedImage.url}
                    alt="Spotlight Preview"
                    className="block max-h-[100%] max-w-[100%] object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Edit modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-6">
              <div className="bg-white rounded-[40px] p-10 w-full max-w-md relative">
                <button
                  onClick={closeEditModal}
                  className="absolute top-6 right-6 bg-[#F9FAFB] hover:bg-[#E0E6ED] text-[#4B5A6B] rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold"
                >
                  ×
                </button>

                <h2 className="text-[28px] font-bold text-[#1F2D3D] mb-8">
                  Edit Spotlight
                </h2>

                <div className="w-full h-56 border-2 border-dashed rounded-3xl flex items-center justify-center bg-[#F9FAFB] overflow-hidden">
                  {editPreview && (
                    <img
                      src={editPreview}
                      className="w-full h-full object-contain rounded-2xl"
                      alt="Edit Preview"
                    />
                  )}
                </div>

                <button
                  onClick={handleEditImage}
                  disabled={uploadImage}
                  className="w-full mt-10 py-2 bg-gradient-to-r from-[#6016E1] to-[#E11675] text-white text-lg font-bold rounded-2xl shadow-lg"
                >
                  {uploadImage ? "Updating..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-[#1F2D3D] mb-2">
                  Delete Image
                </h3>

                <p className="text-sm text-[#4B5A6B] mb-6">
                  Are you sure you want to delete this image?
                  <br />
                  <span className="font-semibold">{deleteTarget}</span>
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 rounded-lg bg-[#F1F4F8] text-[#4B5A6B] font-medium hover:bg-[#E0E6ED]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <Toaster position="top-right" />
        </div>
      </div>
    </div>
  );

};

export default Settings;

