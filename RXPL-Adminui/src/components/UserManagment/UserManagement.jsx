import React, { useMemo, useState } from "react";
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
} from "react-icons/fa";
import "./UserManagement.css";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import BackGroundImg from "../../assets/bg.png";

const INITIAL_USERS = [
  {
    id: 1,
    name: "Linux Admin",
    username: "linuxadmin",
    email: "admin@rxpl.com",
    phone: "",
    role: "HO",
    managerId: null,
    status: "Active",
  },
  {
    id: 2,
    name: "Amit Sharma",
    username: "amit.tlm",
    email: "amit@rxpl.com",
    phone: "",
    role: "TLM",
    managerId: 1,
    status: "Active",
  },
  {
    id: 3,
    name: "Rahul Patil",
    username: "rahul.slm",
    email: "rahul@rxpl.com",
    phone: "",
    role: "SLM",
    managerId: 2,
    status: "Active",
  },
  {
    id: 4,
    name: "Suresh Kumar",
    username: "suresh.flm",
    email: "suresh@rxpl.com",
    phone: "",
    role: "FLM",
    managerId: 3,
    status: "Active",
  },
  {
    id: 5,
    name: "Akash Dutta",
    username: "akash.mr",
    email: "akash@rxpl.com",
    phone: "",
    role: "MR",
    managerId: 4,
    status: "Active",
  },
  {
    id: 6,
    name: "Priya Singh",
    username: "priya.mr",
    email: "priya@rxpl.com",
    phone: "",
    role: "MR",
    managerId: 4,
    status: "Inactive",
  },
];

const ROLES = ["HO", "TLM", "SLM", "FLM", "MR"];

const ROLE_LABELS = {
  HO: "Head Office",
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
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("users");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([1, 2, 3, 4]);

  const getUser = (id) => users.find((user) => user.id === Number(id));

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

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeCount = users.filter((user) => user.status === "Active").length;

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user.id);
    setForm({
      role: user.role,
      userId: user.username || "",
      name: user.name,
      password: user.password || "",
      hq: user.hq || "",
      region: user.region || "",
      zone: user.zone || "",
      managerId: user.managerId ? String(user.managerId) : "",
      status: user.status,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
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
      if (user.id === editingId) return false;

      // Do not allow a user to report to one of their own descendants.
      if (editingId && isDescendant(user.id, editingId)) return false;

      return true;
    });
  };

  const isDescendant = (candidateId, parentId) => {
    const children = users.filter(
      (user) => Number(user.managerId) === Number(parentId),
    );

    return children.some(
      (child) =>
        child.id === Number(candidateId) || isDescendant(candidateId, child.id),
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const userId = form.userId.trim();
    const password = form.password.trim();

    if (!name || !userId || !password || !form.hq.trim() || !form.region.trim() || !form.zone.trim()) {
      setFormError("Please complete all required account and location details.");
      return;
    }

    const duplicateUserId = users.some(
      (user) =>
        String(user.username || "").toLowerCase() === userId.toLowerCase() &&
        user.id !== editingId,
    );

    if (duplicateUserId) {
      setFormError("This ID is already in use.");
      return;
    }

    const managerId = form.managerId ? Number(form.managerId) : null;
    const allowedRoles = getAllowedManagerRoles(form.role);

    if (managerId) {
      const manager = getUser(managerId);

      if (
        !manager ||
        !allowedRoles.includes(manager.role) ||
        manager.id === editingId ||
        (editingId && isDescendant(managerId, editingId))
      ) {
        setFormError("Please select a valid reporting manager.");
        return;
      }
    }

    if (form.role !== "HO" && !managerId) {
      setFormError("Please select a reporting manager for this role.");
      return;
    }

    const userData = {
      name,
      username: userId,
      password,
      hq: form.hq.trim(),
      region: form.region.trim(),
      zone: form.zone.trim(),
      role: form.role,
      managerId,
      status: form.status,
    };

    if (editingId) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingId ? { ...user, ...userData } : user,
        ),
      );
    } else {
      const newUser = {
        id: Math.max(0, ...users.map((user) => user.id)) + 1,
        ...userData,
      };

      setUsers((previous) => [...previous, newUser]);
    }

    closeModal();
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    // Prevent deleting a manager while they still have direct reports.
    const hasReports = users.some(
      (user) => Number(user.managerId) === Number(deleteId),
    );

    if (hasReports) {
      window.alert(
        "This user has direct reports. Reassign those users before deleting this account.",
      );
      setDeleteId(null);
      return;
    }

    setUsers((previous) => previous.filter((user) => user.id !== deleteId));
    setDeleteId(null);
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
      (user) => Number(user.managerId) === Number(managerId),
    );

    return children.map((user) => {
      if (visited.has(user.id)) return null;

      const nextVisited = new Set(visited);
      nextVisited.add(user.id);

      const hasChildren = users.some(
        (item) => Number(item.managerId) === user.id,
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
          <h1>User Management</h1>
          <p>Manage users, reporting relationships, and account status.</p>
        </div>

        <button type="button" className="um-primary-btn" onClick={openAddModal}>
          <FaUserPlus />
          <span>Add User</span>
        </button>
      </div>

      <div className="um-stat-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon purple">
            <FaUsers />
          </div>
          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
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
                  ["HO", "TLM", "SLM", "FLM"].includes(user.role),
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
            <strong>{users.filter((user) => user.role === "MR").length}</strong>
          </div>
        </div>
      </div>

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

          <button
            type="button"
            className={activeTab === "hierarchy" ? "active" : ""}
            onClick={() => setActiveTab("hierarchy")}
          >
            <FaSitemap />
            Hierarchy
          </button>
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

              <div className="um-filters">
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  aria-label="Filter by role"
                >
                  <option value="All">All Roles</option>
                  {ROLES.map((role) => (
                    <option value={role} key={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="um-table-info">
              <span>
                Showing <strong>{filteredUsers.length}</strong> of{" "}
                <strong>{users.length}</strong> users
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
                  {filteredUsers.map((user) => (
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
                          <button
                            type="button"
                            className="um-icon-btn edit"
                            title="Edit user"
                            onClick={() => openEditModal(user)}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="um-icon-btn delete"
                            title="Delete user"
                            onClick={() => setDeleteId(user.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7">
                        <div className="um-empty-state">
                          <FaUsers />
                          <strong>No users found</strong>
                          <span>Try changing your search or filters.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="um-hierarchy">
            <div className="um-hierarchy-heading">
              <div>
                <h3>Organization Hierarchy</h3>
                <p>Expand a manager to view their direct reports and teams.</p>
              </div>
              <span>{users.length} users</span>
            </div>

            <div className="um-tree">
              {users
                .filter((user) => user.role === "HO" && !user.managerId)
                .map((headOffice) => (
                  <div className="um-tree-root" key={headOffice.id}>
                    <div className="um-tree-node um-tree-root-node">
                      <div className="um-tree-avatar root-avatar">
                        <FaUserShield />
                      </div>
                      <div className="um-tree-user">
                        <strong>{headOffice.name}</strong>
                        <span>{headOffice.username}</span>
                      </div>
                      <span className="um-role-badge role-ho">HO</span>
                      <button
                        type="button"
                        className="um-icon-btn"
                        title="Edit user"
                        onClick={() => openEditModal(headOffice)}
                      >
                        <FaEdit />
                      </button>
                    </div>

                    {renderTree(headOffice.id, 0, new Set([headOffice.id]))}
                  </div>
                ))}

              {users.some((user) => user.role !== "HO" && !user.managerId) && (
                <div className="um-unassigned">
                  Some users do not have a reporting manager assigned.
                </div>
              )}
            </div>
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
                  >
                    {ROLES.map((role) => (
                      <option value={role} key={role}>
                        {ROLE_LABELS[role]}{role !== "HO" ? ` (${role})` : ""}
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
                    placeholder="Enter password"
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
                  Region <span>*</span>
                  <input
                    value={form.region}
                    onChange={(event) => updateForm("region", event.target.value)}
                    placeholder="Region"
                    required
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

                <label>
                  {form.role === "HO" ? "Parent ID" : `Parent ${ROLES[ROLES.indexOf(form.role) - 1]} ID`}
                  <select
                    value={form.managerId}
                    onChange={(event) => updateForm("managerId", event.target.value)}
                    disabled={form.role === "HO"}
                    required={form.role !== "HO"}
                  >
                    <option value="">
                      {form.role === "HO" ? "Not applicable" : "Select parent"}
                    </option>
                    {getEligibleManagers().map((manager) => (
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

            <h2>Delete User?</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{getUser(deleteId)?.name}</strong>? This action removes
              the user from this page.
            </p>

            <div className="um-modal-footer">
              <button
                type="button"
                className="um-secondary-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="um-danger-btn"
                onClick={confirmDelete}
              >
                Delete User
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
