const {Router}=require("express");

const router=Router();

const routerAdmin=require("./admin.routes");
const routerApplication=require("./application.routes");
const routerCountry=require("./country.routes");
const routerEmployer=require("./employer.routes");
const routerJob=require("./job.routes");
const routerVacancy = require("./vacancy.routes");
const routerWorkerJob = require("./worker_job.routes");
const routerWorker= require("./worker.routes");

router.use("/admin",routerAdmin);
router.use("/application",routerApplication);
router.use("/country",routerCountry);
router.use("/employer",routerEmployer);
router.use("/job",routerJob);
router.use("/vacancy",routerVacancy);
router.use("/workerJob",routerWorkerJob);
router.use("/worker",routerWorker);

module.exports=router;