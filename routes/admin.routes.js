const { Router } = require("express");
const {
  addAdmin,
  getAllAdmin,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  loginAdmin,
  logOutAdmin,
  refreshAdminToken,
} = require("../controllers/admin.controller");
const admin_police = require("../middleware/admin_police");
const creater_police = require("../middleware/creater_police");

const router = Router();

router.post("/",creater_police, addAdmin);
router.get("/", admin_police, getAllAdmin); 
router.get("/:id", getAdminById);
router.patch("/:id", updateAdminById);
router.delete("/:id", deleteAdminById);
router.post("/login", loginAdmin);
router.post("/logout", admin_police, logOutAdmin);
router.post("/refresh", refreshAdminToken);

module.exports = router;
