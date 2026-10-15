const mongoose = require("mongoose");

const Tlm = require("../Models/TlmModel");
const Slm = require("../Models/SlmModel");
const Flm = require("../Models/FlmModel");
const Mr = require("../Models/MrModel");

const ROLE_CONFIG = {
  TLM: { model: Tlm, idField: "TLMEmpID", nameField: "TLMName", parentRole: null, childrenField: "Slm" },
  SLM: { model: Slm, idField: "SLMEmpID", nameField: "SLMName", parentRole: "TLM", parentLinkField: "Slm" },
  FLM: { model: Flm, idField: "FLMEmpID", nameField: "BDMName", parentRole: "SLM", parentLinkField: "Flm" },
  MR:  { model: Mr,  idField: "MRID",     nameField: "USERNAME", parentRole: "FLM", parentLinkField: "Mrs" },
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const getByRole = (role) => ROLE_CONFIG[String(role || "").toUpperCase()];

const updateHierarchyUser = async (req, res) => {
  try {
    const role = String(req.params.role || "").toUpperCase();
    const config = getByRole(role);
    const { id } = req.params;

    if (!config) {
      return res.status(400).json({ success: false, message: "Role must be TLM, SLM, FLM, or MR." });
    }
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user record ID." });
    }

    const user = await config.model.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const body = req.body || {};
    const idValue = String(body.userId ?? body.idValue ?? user[config.idField] ?? "").trim();
    const name = String(body.name ?? user[config.nameField] ?? "").trim();
    const password = body.password === undefined ? user.Password ?? user.PASSWORD : String(body.password);
    const hq = String(body.hq ?? user.HQ ?? "").trim();
    const region = String(body.region ?? user.REGION ?? "").trim();
    const zone = String(body.zone ?? user.ZONE ?? "").trim();
    const businessUnit = String(body.businessUnit ?? user.BUSINESSUNIT ?? "").trim();

    if (!idValue || !name || !hq || !zone) {
      return res.status(400).json({ success: false, message: "ID, name, HQ, and zone are required." });
    }
    if (role !== "TLM" && !region) {
      return res.status(400).json({ success: false, message: "Region is required for SLM, FLM, and MR." });
    }

    const duplicate = await config.model.findOne({
      [config.idField]: idValue,
      _id: { $ne: user._id },
    }).select("_id");
    if (duplicate) {
      return res.status(409).json({ success: false, message: "That user ID is already in use." });
    }

    const changes = {
      [config.idField]: idValue,
      [config.nameField]: name,
      HQ: hq,
      ZONE: zone,
      BUSINESSUNIT: businessUnit,
    };
    if (role !== "TLM") changes.REGION = region;
    if (password !== undefined && password !== null && String(password).length) {
      changes[role === "MR" ? "PASSWORD" : "Password"] = String(password);
    }

    let oldParent = null;
    let newParent = null;
    if (config.parentRole) {
      const parentId = String(body.parentId ?? "");
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({ success: false, message: `A valid parent ${config.parentRole} is required.` });
      }
      const parentConfig = getByRole(config.parentRole);
      newParent = await parentConfig.model.findById(parentId);
      if (!newParent) {
        return res.status(404).json({ success: false, message: `Parent ${config.parentRole} not found.` });
      }
      if (String(newParent._id) === String(user._id)) {
        return res.status(400).json({ success: false, message: "A user cannot be their own parent." });
      }
      const parentLinkField = config.parentLinkField;
      oldParent = await getByRole(config.parentRole).model.findOne({
        [parentLinkField]: user._id,
      });
      if (oldParent && String(oldParent._id) !== String(newParent._id)) {
        await oldParent.updateOne({ $pull: { [parentLinkField]: user._id } });
      }
      await newParent.updateOne({ $addToSet: { [parentLinkField]: user._id } });
    }

    await config.model.updateOne({ _id: user._id }, { $set: changes });

    return res.status(200).json({
      success: true,
      message: `${role} user updated successfully.`,
      user: await config.model.findById(user._id).select("-Password -PASSWORD").lean(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
      error: error.message,
    });
  }
};


const createHierarchyUser = async (req, res) => {
  try {
    const role = String(req.body?.role || "").toUpperCase();
    const config = getByRole(role);
    if (!config) {
      return res.status(400).json({ success: false, message: "Role must be TLM, SLM, FLM, or MR." });
    }

    const body = req.body || {};
    const userId = String(body.userId || "").trim();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    const hq = String(body.hq || "").trim();
    const region = String(body.region || "").trim();
    const zone = String(body.zone || "").trim();
    const businessUnit = String(body.businessUnit || "").trim();

    if (!userId || !name || !password || !hq || !zone || (role !== "TLM" && !region)) {
      return res.status(400).json({ success: false, message: "Please provide ID, name, password, HQ, zone, and region where required." });
    }

    const duplicate = await config.model.findOne({ [config.idField]: userId }).select("_id");
    if (duplicate) {
      return res.status(409).json({ success: false, message: "That user ID is already in use." });
    }

    const data = {
      [config.idField]: userId,
      [config.nameField]: name,
      [role === "MR" ? "PASSWORD" : "Password"]: password,
      HQ: hq,
      ZONE: zone,
      BUSINESSUNIT: businessUnit,
    };
    if (role !== "TLM") data.REGION = region;
    if (role === "MR") {
      data.isActive = body.status !== "Inactive";
      data.matchSchedules = [];

      // Match schedules are stored on each MR. Seed a new MR with the
      // unique schedules already used by MRs in the same BUSINESSUNIT.
      if (businessUnit) {
        const existingMrs = await Mr.find({
          BUSINESSUNIT: businessUnit,
          "matchSchedules.0": { $exists: true },
        })
          .select("matchSchedules")
          .lean();

        const schedulesByKey = new Map();
        for (const existingMr of existingMrs) {
          for (const schedule of existingMr.matchSchedules || []) {
            const key = [
              schedule.startDate ? new Date(schedule.startDate).toISOString() : "",
              schedule.endDate ? new Date(schedule.endDate).toISOString() : "",
              schedule.createdAt ? new Date(schedule.createdAt).toISOString() : "",
              String(schedule.createdBy || ""),
            ].join("|");

            if (!schedulesByKey.has(key)) {
              schedulesByKey.set(key, {
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                isMatchOn: Boolean(schedule.isMatchOn),
                createdAt: schedule.createdAt,
                createdBy: schedule.createdBy,
              });
            }
          }
        }

        data.matchSchedules = Array.from(schedulesByKey.values()).sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateA - dateB;
        });
      }
    }

    let parent = null;
    if (config.parentRole) {
      const parentId = String(body.parentId || "");
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({ success: false, message: "Please select a valid parent manager." });
      }
      const parentConfig = getByRole(config.parentRole);
      parent = await parentConfig.model.findById(parentId);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Selected parent manager was not found." });
      }
    }

    const created = await config.model.create(data);
    if (parent) {
      await parent.updateOne({ $addToSet: { [config.parentLinkField]: created._id } });
    }

    return res.status(201).json({
      success: true,
      message: role + " user created successfully.",
      user: { id: String(created._id), role, userId, name },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "That user ID is already in use." });
    }
    return res.status(500).json({ success: false, message: "Failed to create user.", error: error.message });
  }
};

const deactivateHierarchyUser = async (req, res) => {
  try {
    const role = String(req.params.role || "").toUpperCase();
    const config = getByRole(role);
    if (!config) return res.status(400).json({ success: false, message: "Role must be TLM, SLM, FLM, or MR." });
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user record ID." });
    const user = await config.model.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: role + " user marked inactive." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to mark user inactive.", error: error.message });
  }
};

const activateHierarchyUser = async (req, res) => {
  try {
    const role = String(req.params.role || "").toUpperCase();
    const config = getByRole(role);
    if (!config) return res.status(400).json({ success: false, message: "Role must be TLM, SLM, FLM, or MR." });
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid user record ID." });
    const user = await config.model.findByIdAndUpdate(req.params.id, { $set: { isActive: true } }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: role + " user reactivated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to reactivate user.", error: error.message });
  }
};

const getHierarchyUsers = async (req, res) => {
  const requestId = `hierarchy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startedAt = Date.now();

  console.log(`[Hierarchy API][${requestId}] GET /api/hierarchy/users received`);
  console.log(`[Hierarchy API][${requestId}] MongoDB readyState: ${mongoose.connection.readyState} (1=connected)`);

  try {
    console.log(`[Hierarchy API][${requestId}] Starting TLM, SLM, FLM and MR queries...`);

    const runQuery = async (role, query) => {
      const queryStartedAt = Date.now();
      console.log(`[Hierarchy API][${requestId}] ${role} query started`);
      try {
        const documents = await query;
        console.log(`[Hierarchy API][${requestId}] ${role} query completed: ${documents.length} records in ${Date.now() - queryStartedAt}ms`);
        return documents;
      } catch (error) {
        console.error(`[Hierarchy API][${requestId}] ${role} query FAILED after ${Date.now() - queryStartedAt}ms:`, error.message);
        throw error;
      }
    };

    const inactiveView = String(req.query.status || "active").toLowerCase() === "inactive";
    const activeQuery = inactiveView ? { isActive: false } : { isActive: { $ne: false } };
    const mrPage = Math.max(1, Number.parseInt(req.query.mrPage, 10) || 1);
    const mrLimit = Math.min(100, Math.max(1, Number.parseInt(req.query.mrLimit, 10) || 50));
    const mrSkip = (mrPage - 1) * mrLimit;

    const [tlms, slms, flms, mrs, totalMRs] = await Promise.all([
      runQuery("TLM", Tlm.find(activeQuery).select("_id TLMEmpID TLMName HQ ZONE BUSINESSUNIT Slm isActive").lean()),
      runQuery("SLM", Slm.find(activeQuery).select("_id SLMEmpID SLMName HQ REGION ZONE BUSINESSUNIT TLM Flm isActive").lean()),
      runQuery("FLM", Flm.find(activeQuery).select("_id FLMEmpID BDMName HQ REGION ZONE BUSINESSUNIT Flm Mrs isActive").lean()),
      runQuery("MR", Mr.find(activeQuery).sort({ _id: -1 }).skip(mrSkip).limit(mrLimit).select("_id MRID USERNAME EMAIL HQ REGION ZONE BUSINESSUNIT isActive status").lean()),
      runQuery("MR count", Mr.countDocuments(activeQuery)),
    ]);

    console.log(`[Hierarchy API][${requestId}] All queries completed; building hierarchy response`);

    const parentByChild = new Map();
    const linkChildren = (parents, field, role) => {
      parents.forEach((parent) => {
        (parent[field] || []).forEach((childId) => {
          parentByChild.set(String(childId), {
            id: String(parent._id),
            role,
            name: parent[ROLE_CONFIG[role].nameField] || parent[ROLE_CONFIG[role].idField] || role,
          });
        });
      });
    };

    linkChildren(tlms, "Slm", "TLM");
    linkChildren(slms, "Flm", "SLM");
    linkChildren(flms, "Mrs", "FLM");

    const normalize = (documents, role) => documents.map((doc) => {
      const config = getByRole(role);
      const parent = parentByChild.get(String(doc._id)) || null;
      const name = doc[config.nameField] || doc[config.idField] || role;
      const userId = doc[config.idField] || "";
      return {
        id: String(doc._id),
        userId: String(userId),
        username: String(userId),
        name: String(name),
        email: role === "MR" ? String(doc.EMAIL || "") : "",
        role,
        hq: String(doc.HQ || ""),
        region: String(doc.REGION || ""),
        zone: String(doc.ZONE || ""),
        businessUnit: String(doc.BUSINESSUNIT || ""),
        managerId: parent ? parent.id : null,
        managerRole: parent ? parent.role : null,
        managerName: parent ? parent.name : "",
        status: doc.isActive === false ? "Inactive" : "Active",
      };
    });

    const users = [
      ...normalize(tlms, "TLM"),
      ...normalize(slms, "SLM"),
      ...normalize(flms, "FLM"),
      ...normalize(mrs, "MR"),
    ];

    console.log(`[Hierarchy API][${requestId}] Responding with ${users.length} users in ${Date.now() - startedAt}ms`);
    return res.status(200).json({
      success: true,
      users,
      pagination: {
        mrPage,
        mrLimit,
        totalMRs,
        totalMRPages: Math.ceil(totalMRs / mrLimit),
        hasMoreMRs: mrSkip + mrs.length < totalMRs,
      },
    });
  } catch (error) {
    console.error(`[Hierarchy API][${requestId}] Request FAILED after ${Date.now() - startedAt}ms:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to load hierarchy users.",
      error: error.message,
      requestId,
    });
  }
};

module.exports = { getHierarchyUsers, updateHierarchyUser, createHierarchyUser, deactivateHierarchyUser, activateHierarchyUser };
