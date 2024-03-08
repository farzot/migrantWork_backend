const { Router } = require("express");
const { addJob, getAllJob, getJobById, updateJobById, deleteJobById } = require("../controllers/job.controller");
const admin_police = require("../middleware/admin_police");


const router = Router();

router.post("/add",admin_police, addJob);
router.get("/", getAllJob);
router.get("/:id", getJobById);
router.patch("/:id", admin_police,updateJobById);
router.delete("/:id",admin_police, deleteJobById);

module.exports = router;
