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


const getHierarchyUsers = async (req, res) => {
  try {
    const [tlms, slms, flms, mrs] = await Promise.all([
      Tlm.find().lean(),
      Slm.find().lean(),
      Flm.find().lean(),
      Mr.find().lean(),
    ]);

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
        status: doc.Status || doc.status || (doc.isActive === false ? "Inactive" : "Active"),
      };
    });

    const users = [
      ...normalize(tlms, "TLM"),
      ...normalize(slms, "SLM"),
      ...normalize(flms, "FLM"),
      ...normalize(mrs, "MR"),
    ];

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load hierarchy users.",
      error: error.message,
    });
  }
};

module.exports = { getHierarchyUsers, updateHierarchyUser };
