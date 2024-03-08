const { Router } = require("express");
const { addWorker, getAllWorker, getWorkerById, updateWorkerById, deleteWorkerById, loginWorker, logOutWorker, refreshWorkerToken, workerActivate } = require("../controllers/worker.controller");


const router = Router();

router.post("/add", addWorker);
router.get("/", getAllWorker);
router.get("/:id", getWorkerById);
router.patch("/:id", updateWorkerById);
router.delete("/:id", deleteWorkerById);
router.post("/login", loginWorker);
router.post("/logout", logOutWorker);
router.post("/refresh", refreshWorkerToken);
router.get("/activate/:link",workerActivate);

module.exports = router;
