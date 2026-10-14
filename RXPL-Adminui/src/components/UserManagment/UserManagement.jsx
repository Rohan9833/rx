import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaUserTie,
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSitemap,
  FaList,
  FaChevronDown,
  FaChevronRight,
  FaUserShield,
  FaUserCheck,
} from "react-icons/fa";
import "./UserManagement.css";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import BackGroundImg from "../../assets/bg.png";

const API_BASE_URL = `http://${window.location.hostname}:7501/api`;


const ROLES = ["TLM", "SLM", "FLM", "MR"];

const ROLE_LABELS = {
  TLM: "TLM",
  SLM: "SLM",
  FLM: "FLM",
  MR: "MR",
};

const EMPTY_FORM = {
  role: "MR",
  userId: "",
  name: "",
  password: "",
  hq: "",
  region: "",
  zone: "",
  managerId: "",
  status: "Active",
};

const getAllowedManagerRoles = (role) => {
  const index = ROLES.indexOf(role);
  return index > 0 ? [ROLES[index - 1]] : [];
};

const UserManagement = () => {
  const pageName = "User Management";
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState("active");
  const [reactivatingId, setReactivatingId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMoreMrs, setLoadingMoreMrs] = useState(false);
  const [mrPagination, setMrPagination] = useState({ mrPage: 1, mrLimit: 50, totalMRs: 0, totalMRPages: 0, hasMoreMRs: false });
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("MR");
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 10;
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("users");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivationError, setDeactivationError] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);

  const loadUsers = async (mode = viewMode) => {
    setLoadingUsers(true);
    setLoadError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/hierarchy/users`, { params: { mrPage: 1, mrLimit: 50, status: mode } });
      if (!response.data?.success || !Array.isArray(response.data.users)) {
        throw new Error(response.data?.message || "The server returned an invalid users response.");
      }
      setUsers(response.data.users);
      setMrPagination(response.data.pagination || { mrPage: 1, mrLimit: 50, totalMRs: response.data.users.filter((user) => user.role === "MR").length, totalMRPages: 1, hasMoreMRs: false });
      setExpandedIds(response.data.users.filter((user) => user.role === "TLM").map((user) => user.id));
    } catch (error) {
      setLoadError(error.response?.data?.message || error.message || "Could not load users from the server.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const loadMoreMrs = async () => {
    if (loadingMoreMrs || !mrPagination.hasMoreMRs) return;
    setLoadingMoreMrs(true);
    setLoadError("");
    try {
      const nextPage = mrPagination.mrPage + 1;
      const response = await axios.get(`${API_BASE_URL}/hierarchy/users`, { params: { mrPage: nextPage, mrLimit: mrPagination.mrLimit || 50, status: viewMode } });
      if (!response.data?.success || !Array.isArray(response.data.users)) {
        throw new Error(response.data?.message || "The server returned an invalid users response.");
      }
      const nextMrs = response.data.users.filter((user) => user.role === "MR");
      setUsers((previous) => [...previous.filter((user) => user.role !== "MR"), ...previous.filter((user) => user.role === "MR"), ...nextMrs]);
      setMrPagination(response.data.pagination || { ...mrPagination, mrPage: nextPage, hasMoreMRs: false });
    } catch (error) {
      setLoadError(error.response?.data?.message || error.message || "Could not load more medical representatives.");
    } finally {
      setLoadingMoreMrs(false);
    }
  };

  const getUser = (id) => users.find((user) => String(user.id) === String(id));

  const switchView = async (mode) => {
    setViewMode(mode);
    setActiveTab("users");
    setSearch("");
    setStatusFilter("All");
    setRoleFilter(mode === "inactive" ? "All" : "MR");
    setTablePage(1);
    await loadUsers(mode);
  };

  const reactivateUser = async (user) => {
    if (!user || reactivatingId) return;
    try {
      setReactivatingId(user.id);
      setLoadError("");
      const response = await axios.patch(API_BASE_URL + "/hierarchy/users/" + user.role + "/" + user.id + "/activate");
      if (!response.data?.success) throw new Error(response.data?.message || "The server did not reactivate this user.");
      await loadUsers("inactive");
    } catch (error) {
      setLoadError(error.response?.data?.message || error.message || "Failed to reactivate user.");
    } finally {
      setReactivatingId(null);
    }
  };

  const getManagerName = (managerId) => {
    if (!managerId) return "—";
    return getUser(managerId)?.name || "Unassigned";
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        [user.name, user.username, user.email, user.phone, user.role].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
        );

      const matchesRole = (viewMode === "inactive" && roleFilter === "All") || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter, viewMode]);

  const activeCount = users.filter((user) => user.status === "Active").length;
  const tablePageCount = Math.max(1, Math.ceil(filteredUsers.length / TABLE_PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
  useEffect(() => { setTablePage(1); }, [roleFilter, search, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setParentSearch("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user.id);
    setForm({
      role: user.role,
      userId: user.userId || user.username || "",
      name: user.name,
      password: user.password || "",
      hq: user.hq || "",
      region: user.region || "",
      zone: user.zone || "",
      managerId: user.managerId ? String(user.managerId) : "",
      status: user.status,
    });
    setParentSearch("");
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setParentSearch("");
    setFormError("");
  };

  const updateForm = (field, value) => {
    setForm((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === "role") {
        updated.managerId = "";
      }

      return updated;
    });
    setFormError("");
  };

  const getEligibleManagers = () => {
    const allowedRoles = getAllowedManagerRoles(form.role);

    return users.filter((user) => {
      if (!allowedRoles.includes(user.role)) return false;
      if (String(user.id) === String(editingId)) return false;

      // Do not allow a user to report to one of their own descendants.
      if (editingId && isDescendant(user.id, editingId)) return false;

      return true;
    });
  };

  const isDescendant = (candidateId, parentId) => {
    const children = users.filter(
      (user) => String(user.managerId) === String(parentId),
    );

    return children.some(
      (child) =>
        String(child.id) === String(candidateId) || isDescendant(candidateId, child.id),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const userId = form.userId.trim();
    if (!name || !userId || !form.hq.trim() || !form.zone.trim() || (form.role !== "TLM" && !form.region.trim())) {
      setFormError("Please complete the required ID, name, HQ, zone, and region fields.");
      return;
    }

    const duplicateUserId = users.some(
      (user) => String(user.userId || user.username || "").toLowerCase() === userId.toLowerCase()
        && String(user.id) !== String(editingId),
    );
    if (duplicateUserId) {
      setFormError("This ID is already in use.");
      return;
    }

    const managerId = form.role === "TLM" ? null : form.managerId;
    const allowedRoles = getAllowedManagerRoles(form.role);
    if (form.role !== "TLM") {
      const manager = getUser(managerId);
      if (!manager || !allowedRoles.includes(manager.role) || String(manager.id) === String(editingId)
        || (editingId && isDescendant(managerId, editingId))) {
        setFormError("Please select a valid reporting manager.");
        return;
      }
    }

    try {
      setFormError("");
      const payload = {
        role: form.role, userId, name, password: form.password,
        hq: form.hq.trim(), region: form.region.trim(), zone: form.zone.trim(),
        businessUnit: form.businessUnit || "", parentId: managerId, status: form.status,
      };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/hierarchy/users/${form.role}/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/hierarchy/users`, payload);
      }
      await loadUsers();
      closeModal();
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || "Failed to save user changes.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || deactivating) return;
    const user = getUser(deleteId);
    if (!user) { setDeleteId(null); return; }
    try {
      setDeactivating(true);
      setDeactivationError("");
      setLoadError("");
      const response = await axios.patch(`${API_BASE_URL}/hierarchy/users/${user.role}/${user.id}/deactivate`);
      if (!response.data?.success) throw new Error(response.data?.message || "The server did not deactivate this user.");
      setUsers((previous) => previous.map((item) => String(item.id) === String(user.id) ? { ...item, status: "Inactive" } : item));
      setDeleteId(null);
      await loadUsers();
    } catch (error) {
      setDeactivationError(error.response?.data?.message || error.message || "Failed to mark user inactive.");
    } finally {
      setDeactivating(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const renderTree = (managerId, depth = 0, visited = new Set()) => {
    const children = users.filter(
      (user) => String(user.managerId) === String(managerId),
    );

    return children.map((user) => {
      if (visited.has(user.id)) return null;

      const nextVisited = new Set(visited);
      nextVisited.add(user.id);

      const hasChildren = users.some(
        (item) => String(item.managerId) === String(user.id),
      );
      const expanded = expandedIds.includes(user.id);

      return (
        <div className="um-tree-branch" key={user.id}>
          <div className="um-tree-node" style={{ "--tree-depth": depth }}>
            <button
              type="button"
              className="um-tree-toggle"
              onClick={() => toggleExpanded(user.id)}
              disabled={!hasChildren}
              aria-label={expanded ? "Collapse team" : "Expand team"}
            >
              {hasChildren ? (
                expanded ? (
                  <FaChevronDown />
                ) : (
                  <FaChevronRight />
                )
              ) : (
                <span className="um-tree-toggle-placeholder" />
              )}
            </button>

            <div className="um-tree-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="um-tree-user">
              <strong>{user.name}</strong>
              <span>{user.username}</span>
            </div>

            <span className={`um-role-badge role-${user.role.toLowerCase()}`}>
              {user.role}
            </span>

            <span
              className={`um-status ${
                user.status === "Active" ? "status-active" : "status-inactive"
              }`}
            >
              {user.status}
            </span>

            <button
              type="button"
              className="um-icon-btn"
              title="Edit user"
              onClick={() => openEditModal(user)}
            >
              <FaEdit />
            </button>
          </div>

          {hasChildren && expanded && (
            <div className="um-tree-children">
              {renderTree(user.id, depth + 1, nextVisited)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="um-page-shell relative block min-h-screen w-full max-w-full">
        <Sidebar />
        <div
          className="um-layout-content relative z-1 min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-white"
          style={{ borderRadius: "40px" }}
        >
          <div className="h-[100px] mb-[-20px]">
            <Header pageName={pageName} />
          </div>
          <div
            style={{
              backgroundImage: `url(${BackGroundImg})`,
              backgroundBlendMode: "overlay",
            }}
            className="relative mx-auto w-full min-w-0 max-w-full overflow-x-hidden bg-cover bg-no-repeat"
          >
            <div className="rounded-2xl shadow-md min-h-[calc(100vh-100px)]">
              <div className="user-management-page">
      <div className="um-page-header">
        <div>
          <div className="um-breadcrumb">Administration / Users</div>
          <h1>{viewMode === "inactive" ? "Inactive Users" : "User Management"}</h1>
          <p>{viewMode === "inactive" ? "Review inactive accounts and reactivate users when needed." : "Manage active users, reporting relationships, and account status."}</p>
        </div>

        <div className="um-page-header-actions">
          <button type="button" className="um-secondary-btn" onClick={() => switchView(viewMode === "active" ? "inactive" : "active")}>
            <FaUserCheck />
            <span>{viewMode === "active" ? "View Inactive Users" : "Back to Active Users"}</span>
          </button>
          {viewMode === "active" && (
            <button type="button" className="um-primary-btn" onClick={openAddModal}>
              <FaUserPlus />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === "active" && <div className="um-stat-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon purple">
            <FaUsers />
          </div>
          <div>
            <span>Total Users</span>
            <strong>{users.length - users.filter((user) => user.role === "MR").length + mrPagination.totalMRs}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon green">
            <FaUserShield />
          </div>
          <div>
            <span>Active Users</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon pink">
            <FaUserTie />
          </div>
          <div>
            <span>Managers</span>
            <strong>
              {
                users.filter((user) =>
                  ["TLM", "SLM", "FLM"].includes(user.role),
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon orange">
            <FaUsers />
          </div>
          <div>
            <span>Medical Representatives</span>
            <strong>{mrPagination.totalMRs || users.filter((user) => user.role === "MR").length}</strong>
          </div>
        </div>
      </div>}

      {loadingUsers && <div className="um-loading-state">Loading users from the database…</div>}
      {loadError && <div className="um-load-error"><span>{loadError}</span><button type="button" className="um-secondary-btn" onClick={loadUsers}>Retry</button></div>}
      <div className="um-main-card">
        <div className="um-tabs">
          <button
            type="button"
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <FaList />
            Users
          </button>

          {viewMode === "active" && (
            <button
              type="button"
              className={activeTab === "hierarchy" ? "active" : ""}
              onClick={() => setActiveTab("hierarchy")}
            >
              <FaSitemap />
              Hierarchy
            </button>
          )}
        </div>

        {activeTab === "users" ? (
          <>
            <div className="um-toolbar">
              <div className="um-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search name, username, email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="um-role-toggle" role="group" aria-label="Choose user role">
                {viewMode === "inactive" && (
                  <button type="button" className={roleFilter === "All" ? "active" : ""} aria-pressed={roleFilter === "All"} onClick={() => setRoleFilter("All")}>All</button>
                )}
                {ROLES.map((role) => (
                  <button type="button" key={role} className={roleFilter === role ? "active" : ""} aria-pressed={roleFilter === role} onClick={() => setRoleFilter(role)}>
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
              {viewMode === "active" && (
                <div className="um-filters">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
              )}
            </div>

            <div className="um-table-info">
              <span>
                Showing <strong>{filteredUsers.length}</strong> {roleFilter} users
              </span>
            </div>

            <div className="um-table-wrapper">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Reports To</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{user.name}</strong>
                            <span>{user.phone || "No phone added"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`um-role-badge role-${user.role.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{getManagerName(user.managerId)}</td>

                      <td>
                        <span
                          className={`um-status ${
                            user.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <span className="um-status-dot" />
                          {user.status}
                        </span>
                      </td>

                      <td>
                        <div className="um-actions">
                          {viewMode === "inactive" ? (
                            <button type="button" className="um-icon-btn edit" title="Reactivate user" onClick={() => reactivateUser(user)} disabled={reactivatingId === user.id}>
                              <FaUserCheck />
                            </button>
                          ) : (
                            <>
                              <button type="button" className="um-icon-btn edit" title="Edit user" onClick={() => openEditModal(user)}><FaEdit /></button>
                              <button type="button" className="um-icon-btn delete" title="Mark user inactive" onClick={() => { setDeactivationError(""); setDeleteId(user.id); }}><FaTrash /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loadingUsers && !loadingMoreMrs && paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan="7">
                        <div className="um-empty-state">
                          <FaSearch />
                          <strong>No users found</strong>
                          <span>Try changing your search or filters.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {(loadingUsers || loadingMoreMrs) && paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan="7">
                        <div className="um-table-loading" role="status" aria-live="polite">
                          <span className="um-loading-spinner" />
                          <strong>Loading users…</strong>
                          <span>Fetching the latest user records.</span>
                        </div>
                      </td>
                    </tr>
                  )}}
                </tbody>
              </table>
            </div>
            <div className="um-pagination-controls">
              <span>Page {tablePage} of {tablePageCount} · {filteredUsers.length} {roleFilter} users</span>
              <div className="um-pagination-buttons">
                <button type="button" className="um-secondary-btn" onClick={() => setTablePage((page) => Math.max(1, page - 1))} disabled={tablePage <= 1}>Previous</button>
                <button type="button" className="um-secondary-btn" onClick={() => setTablePage((page) => Math.min(tablePageCount, page + 1))} disabled={tablePage >= tablePageCount}>Next</button>
              </div>
            </div>
            {(roleFilter === "MR" || (viewMode === "inactive" && roleFilter === "All")) && mrPagination.hasMoreMRs && (
              <div className="um-pagination-controls">
                <span>Loaded {users.filter((user) => user.role === "MR").length} of {mrPagination.totalMRs} medical representatives</span>
                <button type="button" className="um-secondary-btn" onClick={loadMoreMrs} disabled={loadingMoreMrs}>
                  {loadingMoreMrs ? "Loading..." : "Load Next 50 MRs"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="um-hierarchy">
            <div className="um-hierarchy-heading">
              <div>
                <h3>Organization Hierarchy</h3>
                <p>Expand a manager to view their direct reports and teams.</p>
              </div>
              <span>{users.length - users.filter((user) => user.role === "MR").length + mrPagination.totalMRs} users</span>
            </div>

            <div className="um-tree">
              {renderTree(null, 0, new Set())}

              {users.some((user) => user.role !== "TLM" && !user.managerId) && (
                <div className="um-unassigned">
                  Some users do not have a reporting manager assigned.
                </div>
              )}
            </div>
            {mrPagination.hasMoreMRs && (
              <div className="um-pagination-controls">
                <span>Loaded {users.filter((user) => user.role === "MR").length} of {mrPagination.totalMRs} medical representatives</span>
                <button type="button" className="um-secondary-btn" onClick={loadMoreMrs} disabled={loadingMoreMrs}>
                  {loadingMoreMrs ? "Loading..." : "Next 50 MRs"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="um-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="um-modal um-account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="um-modal-title"
          >
            <div className="um-modal-header">
              <div>
                <h2 id="um-modal-title">
                  {editingId ? "Edit User" : "Add New User"}
                </h2>
                <p>
                  {editingId
                    ? "Update the user's details and reporting structure."
                    : "Create a user and assign their place in the hierarchy."}
                </p>
              </div>

              <button
                type="button"
                className="um-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="um-form-grid um-account-form-grid">
                <label>
                  User Role <span>*</span>
                  <select
                    value={form.role}
                    onChange={(event) => updateForm("role", event.target.value)}
                    disabled={Boolean(editingId)}
                  >
                    {ROLES.map((role) => (
                      <option value={role} key={role}>
                        {ROLE_LABELS[role]} ({role})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  ID <span>*</span>
                  <input
                    value={form.userId}
                    onChange={(event) => updateForm("userId", event.target.value)}
                    placeholder="Enter user ID"
                    required
                  />
                </label>

                <label>
                  Full Name <span>*</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Full name"
                    required
                  />
                </label>

                <label>
                  Password <span>*</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateForm("password", event.target.value)}
                    placeholder="Leave blank to keep current password"
                    required={!editingId}
                  />
                </label>

                <label>
                  HQ <span>*</span>
                  <input
                    value={form.hq}
                    onChange={(event) => updateForm("hq", event.target.value)}
                    placeholder="HQ"
                    required
                  />
                </label>

                <label>
                  Region {form.role !== "TLM" && <span>*</span>}
                  <input
                    value={form.region}
                    onChange={(event) => updateForm("region", event.target.value)}
                    placeholder="Region"
                    required={form.role !== "TLM"}
                  />
                </label>

                <label>
                  Zone <span>*</span>
                  <input
                    value={form.zone}
                    onChange={(event) => updateForm("zone", event.target.value)}
                    placeholder="Zone"
                    required
                  />
                </label>

                <label className="um-parent-field">
                  {form.role === "TLM" ? "Parent" : `Parent ${ROLES[ROLES.indexOf(form.role) - 1]} ID`}
                  <input
                    type="search"
                    className="um-parent-search"
                    value={parentSearch}
                    onChange={(event) => setParentSearch(event.target.value)}
                    placeholder="Search parent by ID or name"
                    disabled={form.role === "TLM"}
                  />
                  <select
                    value={form.managerId}
                    onChange={(event) => updateForm("managerId", event.target.value)}
                    disabled={form.role === "TLM"}
                    required={form.role !== "TLM"}
                  >
                    <option value="">
                      {form.role === "TLM" ? "TLM users are at the top level" : "Select parent"}
                    </option>
                    {getEligibleManagers().filter((manager) => `${manager.username || ""} ${manager.name} ${manager.role}`.toLowerCase().includes(parentSearch.trim().toLowerCase())).map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.username || manager.name} — {manager.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Account Status
                  <select
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {formError && <div className="um-form-error">{formError}</div>}

              <div className="um-modal-footer">
                <button type="button" className="um-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="um-primary-btn">
                  {editingId ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div
          className="um-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteId(null);
          }}
        >
          <div className="um-confirm-modal" role="dialog" aria-modal="true">
            <div className="um-delete-icon">
              <FaTrash />
            </div>

            <h2>Deactivate User?</h2>
            <p>
              Are you sure you want to mark{" "}
              <strong>{getUser(deleteId)?.name}</strong> as inactive? The account will be retained in the database.
            </p>

            {deactivationError && <div className="um-form-error" role="alert">{deactivationError}</div>}

            <div className="um-modal-footer">
              <button
                type="button"
                className="um-secondary-btn"
                disabled={deactivating}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="um-danger-btn"
                onClick={confirmDelete}
                disabled={deactivating}
              >
                {deactivating ? "Deactivating..." : "Confirm Deactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;
