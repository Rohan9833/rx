const express = require("express");
const router = express.Router();

const { getHierarchyUsers, updateHierarchyUser, createHierarchyUser, deactivateHierarchyUser, activateHierarchyUser } = require("../Controllers/HierarchyUserController");

// Dedicated edit endpoint for the TLM -> SLM -> FLM -> MR hierarchy.
// The Super Admin/HO is intentionally outside this route.
router.get("/hierarchy/users", getHierarchyUsers);
router.post("/hierarchy/users", createHierarchyUser);
router.put("/hierarchy/users/:role/:id", updateHierarchyUser);
router.patch("/hierarchy/users/:role/:id/deactivate", deactivateHierarchyUser);
router.patch("/hierarchy/users/:role/:id/activate", activateHierarchyUser);

module.exports = router;
