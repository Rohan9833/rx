const express = require("express");
const router = express.Router();

const { getHierarchyUsers, updateHierarchyUser } = require("../Controllers/HierarchyUserController");

// Dedicated edit endpoint for the TLM -> SLM -> FLM -> MR hierarchy.
// The Super Admin/HO is intentionally outside this route.
router.get("/hierarchy/users", getHierarchyUsers);
router.put("/hierarchy/users/:role/:id", updateHierarchyUser);

module.exports = router;
