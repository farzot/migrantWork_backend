const { Router } = require("express");
const { addEmployer, getAllEmployer, getEmployerById, updateEmployerById, deleteEmployerById, loginEmployer, logOutEmployer, refreshEmployerToken } = require("../controllers/employer.controller");

const router = Router();

router.post("/add", addEmployer);
router.get("/", getAllEmployer);
router.get("/:id", getEmployerById);
router.patch("/:id", updateEmployerById);
router.delete("/:id", deleteEmployerById);
router.post("/login", loginEmployer);
router.post("/logout",  logOutEmployer);
router.post("/refresh", refreshEmployerToken);
module.exports = router;
