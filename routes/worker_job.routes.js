const { Router } = require("express");
const { addWorkerJob, getAllWorkerJob, getWorkerJobById, updateWorkerJobById, deleteWorkerJobById } = require("../controllers/worker_job.controller");
const admin_police = require("../middleware/admin_police");

const router = Router();

router.post("/add",admin_police, addWorkerJob);
router.get("/", getAllWorkerJob);
router.get("/:id", getWorkerJobById);
router.patch("/:id",admin_police, updateWorkerJobById);
router.delete("/:id",admin_police, deleteWorkerJobById);

module.exports = router;
