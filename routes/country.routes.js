const { Router } = require("express");
const { addCountry, getAllCountry, getCountryById, updateCountryById, deleteCountryById } = require("../controllers/country.controller");
const admin_police = require("../middleware/admin_police");

const router = Router();

router.post("/add", admin_police,addCountry);
router.get("/", getAllCountry);
router.get("/:id", getCountryById);
router.patch("/:id",admin_police, updateCountryById);
router.delete("/:id",admin_police, deleteCountryById);

module.exports = router;
