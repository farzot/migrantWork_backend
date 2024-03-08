const pool = require("../config/db");
const { jobValidation } = require("../validations/job.validation");
const { errorHandler } = require("../helpers/error_helper");
const { log } = require("handlebars");


const addJob = async (req, res) => {
  try {
    const { error, value } = jobValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const appId = req.body.id;
    const { name, description, icon } = value;
    // console.log(value);
    const existing = await pool.query(`SELECT * FROM job where id=$1`, [appId]);
    // console.log(existing);
    if (existing.rows[0]) {
      return res.status(400).send({ message: "Bunday job allaqachon mavjud" });
    }
    const newJob = await pool.query(
      `INSERT INTO job(
      name,
      description,
      icon
      ) VALUES($1, $2, $3) returning *`,
      [name, description, icon]
    );
    res.status(200).send(newJob.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllJob = async (req, res) => {
  try {
    const job = await pool.query("SELECT * FROM job");
    res.status(200).send(job.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getJobById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const job = await pool.query("SELECT * FROM job WHERE id = $1", [id]);
    if (job.rows[0].length == 0) {
      return res.status(404).send({ message: "Job not found" });
    }
    res.status(200).send(job.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateJobById = async (req, res) => {
  const { id } = req.params.id;
  const { name, description, icon } = req.body;
  try {
    const job = await pool.query("SELECT * FROM job WHERE id = $1", id);
    if (job.rows[0].length == 0) {
      return res.status(404).send({ message: "Job not found" });
    }
    const updatedJob = await pool.query(
      `
        UPDATE job SET 
      name=$1,
      description=$2,
      icon=$3 WHERE id = $4 RETURNING *
        `,
      [name, description, icon, id]
    );
    res.status(200).send(updatedJob.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteJobById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const deletedJob = await pool.query(
      `
          DELETE FROM job WHERE id = $1
          `,
      [id]
    );
    res.status(200).send(deletedJob.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addJob,
  getAllJob,
  getJobById,
  updateJobById,
  deleteJobById,
};
