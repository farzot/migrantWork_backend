const pool = require("../config/db");
const {
  worker_jobValidation,
} = require("../validations/worker_job.validation");
const uuid = require("uuid");
const myJwt = require("../services/jwt_service");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../helpers/error_helper");
const mail_service = require("../services/mail_service");
const { to } = require("../helpers/to_promise");
const { log } = require("handlebars");
const config = require("config");

const addWorkerJob = async (req, res) => {
  try {
    const { error, value } = workerJobValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const id = req.body.id;
    const { worker_id, job_id } = value;
    // console.log(value);

    const workerId = await pool.query(`SELECT * FROM worker where id=$1`, [id]);
    if (!workerId) {
      return res
        .status(400)
        .send({ message: "Worker tableda bunday Id lik worker mavjud emas!" });
    }

    const jobId = await pool.query(`SELECT * FROM worker where id=$1`, [id]);
    if (!jobId) {
      return res
        .status(400)
        .send({ message: "Job tableda bunday Id lik worker mavjud emas!" });
    }

    const existing = await pool.query(`SELECT * FROM worker_job where id=$1`, [
      id,
    ]);
    console.log(existing);
    if (existing.rows[0]) {
      return res
        .status(400)
        .send({ message: "Bunday worker_job allaqachon mavjud" });
    }
    const newWorkerJob = await pool.query(
      `INSERT INTO job(
      worker_id,
      job_id,
      ) VALUES($1, $2) returning *`,
      [worker_id, job_id]
    );
    res.status(200).send(newWorkerJob.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllWorkerJob = async (req, res) => {
  try {
    const worker_job = await pool.query("SELECT * FROM worker_job");
    res.status(200).send(worker_job.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getWorkerJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const worker_job = await pool.query(
      "SELECT * FROM worker_job WHERE id = $1",
      [id]
    );
    if (!worker_job.rows) {
      return res.status(404).send({ message: "WorkerJob not found" });
    }
    res.status(200).send(worker_job.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateWorkerJobById = async (req, res) => {
  const { id } = req.params;
  const { worker_id, job_id } = req.body;
  try {
    const worker_job = await pool.query(
      "SELECT * FROM worker_job WHERE id = $1",
      id
    );
    if (!worker_job.rows) {
      return res.status(404).send({ message: "WorkerJob not found" });
    }
    const updatedWorkerJob = await pool.query(
      `
        UPDATE worker_job SET 
   worker_id=$1, job_id=$2  WHERE id = $3 RETURNING *
        `,
      [worker_id, job_id, id]
    );
    res.status(200).send(updatedWorkerJob.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteWorkerJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedWorkerJob = await pool.query(
      `
          DELETE FROM worker_job WHERE id = $1 re
          `,
      [id]
    );
    res.status(200).send(deletedWorkerJob.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addWorkerJob,
  getAllWorkerJob,
  getWorkerJobById,
  updateWorkerJobById,
  deleteWorkerJobById,
};
