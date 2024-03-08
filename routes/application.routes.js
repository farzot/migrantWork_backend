const { Router } = require("express");
const { addApplication, getAllApplication, getApplicationById, updateApplicationById, deleteApplicationById } = require("../controllers/application.controller");
const router = Router();

router.post("/add",addApplication);
router.get("/", getAllApplication);
router.get("/:id", getApplicationById);
router.patch("/:id", updateApplicationById);
router.delete("/:id", deleteApplicationById);

module.exports = router;
