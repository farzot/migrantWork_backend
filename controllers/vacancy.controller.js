const pool = require("../config/db");
const { vacancyValidation } = require("../validations/vacancy.validation");
const uuid = require("uuid");
const myJwt = require("../services/jwt_service");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../helpers/error_helper");
const mail_service = require("../services/mail_service");
const { to } = require("../helpers/to_promise");
const { log } = require("handlebars");
const config = require("config");

const addVacancy = async (req, res) => {
  try {
    const { error, value } = vacancyValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const appId = req.body.id;
    const {
      employer_id,
      city,
      job_id,
      salary,
      description,
      requirements,
      internship,
      job_type,
      work_hour,
      is_medicine,
      is_housing,
      gender,
      age_limit,
      education,
      exprience,
      trial_period,
    } = value;


    const employerr = await pool.query(
      `select * from vacancy where id=$1`,
      [employer_id]
    );

    if (!employerr) {
      return res
        .status(400)
        .send({ message: "Bunday id lik employer mavjud mavjud emas" });
    }

    const jobb = await pool.query(
      `select * from worker where id=$1 `,
      [job_id]
    );

    if (!jobb) {
      return res
        .status(400)
        .send({ message: "Bunday id lik job mavjud mavjud emas" });
    }


    // console.log(value);
    const existing = await pool.query(`SELECT * FROM vacancy where id=$1`, [
      appId,
    ]);
    // console.log(existing);
    if (existing.rows[0]) {
      return res
        .status(400)
        .send({ message: "Bunday vacancy allaqachon mavjud" });
    }
    const newVacancy = await pool.query(
      `INSERT INTO job(
      employer_id,
      city,
      job_id,
      salary,
      description,
      requirements,
      internship,
      job_type,
      work_hour,
      is_medicine,
      is_housing,
      gender,
      age_limit,
      education,
      exprience,
      trial_period
      ) VALUES($1, $2) returning *`,
      [
        employer_id,
        city,
        job_id,
        salary,
        description,
        requirements,
        internship,
        job_type,
        work_hour,
        is_medicine,
        is_housing,
        gender,
        age_limit,
        education,
        exprience,
        trial_period,
      ]
    );

    res.status(200).send(newVacancy.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllVacancy = async (req, res) => {
  try {
    const vacancy = await pool.query("SELECT * FROM vacancy");
    res.status(200).send(vacancy.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getVacancyById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const vacancy = await pool.query("SELECT * FROM vacancy WHERE id = $1", [
      id,
    ]);
    if (vacancy.rows[0].length == 0) {
      return res.status(404).send({ message: "Vacancy not found" });
    }
    res.status(200).send(vacancy.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateVacancyById = async (req, res) => {
  const { id } = req.params.id;
  const {
    employer_id,
    city,
    job_id,
    salary,
    description,
    requirements,
    internship,
    job_type,
    work_hour,
    is_medicine,
    is_housing,
    gender,
    age_limit,
    education,
    exprience,
    trial_period,
  } = req.body;
  try {
    const vacancy = await pool.query(
      "SELECT * FROM vacancy WHERE id = $1",
      id
    );
    if (vacancy.rows[0].length == 0) {
      return res.status(404).send({ message: "Vacancy not found" });
    }
    const updatedVacancy = await pool.query(
      `
        UPDATE vacancy SET
   employer_id=$1,
      city=$2,
      job_id=$3,
      salary=$4,
      description=$5,
      requirements=$6,
      internship=$7,
      job_type=$8,
      work_hour=$9,
      is_medicine=$10,
      is_housing$11,
      gender=$12,
      age_limit=$13,
      education=$14,
      exprience=$15,
      trial_period=$16,  WHERE id = $17 RETURNING *
        `,
      [
        employer_id,
        city,
        job_id,
        salary,
        description,
        requirements,
        internship,
        job_type,
        work_hour,
        is_medicine,
        is_housing,
        gender,
        age_limit,
        education,
        exprience,
        trial_period,
        id,
      ]
    );
    res.status(200).send(updatedVacancy.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteVacancyById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const deletedVacancy = await pool.query(
      `
          DELETE FROM vacancy WHERE id = $1
          `,
      [id]
    );
    res.status(200).send(deletedVacancy.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addVacancy,
  getAllVacancy,
  getVacancyById,
  updateVacancyById,
  deleteVacancyById,
};
