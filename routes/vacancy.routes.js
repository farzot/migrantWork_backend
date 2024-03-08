const { Router } = require("express");
const { addVacancy, getAllVacancy, getVacancyById, updateVacancyById, deleteVacancyById } = require("../controllers/vacancy.controller");


const router = Router();

router.post("/add", addVacancy);
router.get("/", getAllVacancy);
router.get("/:id", getVacancyById);
router.patch("/:id", updateVacancyById);
router.delete("/:id", deleteVacancyById);

module.exports = router;
