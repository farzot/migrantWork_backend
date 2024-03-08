const pool = require("../config/db");
const { applicationValidation } = require("../validations/application.validation");
const { errorHandler } = require("../helpers/error_helper");
const { log } = require("handlebars");


const addApplication = async (req, res) => {
  try {
    const { error, value } = applicationValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const appId = req.body.id;
    const { vacancy_id, worker_id, application_date } = value;
    // console.log(value);
    const existing = await pool.query(`SELECT * FROM application where id=$1`, [
      appId,
    ]);
    // console.log(existing);
    if (existing.rows[0]) {
      return res
        .status(400)
        .send({ message: "Bunday application allaqachon mavjud" });
    }

    const vacancyy = await pool.query(`select * from vacancy where id=$1 returning *`,
        [vacancy_id]
      );

      if (!vacancyy) {
        return res
          .status(400)
          .send({ message: "Bunday id lik vacancy mavjud mavjud emas" });
      }

      const workerr = await pool.query(
        `select * from worker where id=$1 returning *`,
        [vacancy_id]
      );

      if (!workerr) {
        return res
          .status(400)
          .send({ message: "Bunday id lik worker mavjud mavjud emas" });
      }

    const newApplication = await pool.query(
      `INSERT INTO application(
      vacancy_id,
      worker_id,
      application_date)
           VALUES($1, $2, $3) returning *`,
      [vacancy_id, worker_id, application_date]
    );
    res.status(200).send(newApplication.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllApplication = async (req, res) => {
  try {
    const application = await pool.query("SELECT * FROM application");
    res.status(200).send(application.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getApplicationById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const application = await pool.query("SELECT * FROM application WHERE id = $1", [
      id,
    ]);
    if (application.rows[0].length == 0) {
      return res.status(404).send({ message: "Application not found" });
    }
    res.status(200).send(application.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateApplicationById = async (req, res) => {
  const { id } = req.params.id;
  const { vacancy_id, worker_id, application_date } = req.body;
  try {
    const application = await pool.query(
      "SELECT * FROM application WHERE id = $1",
      id
    );
    if (application.rows[0].length == 0) {
      return res.status(404).send({ message: "Application not found" });
    }
    const updatedApplication = await pool.query(
      `
        UPDATE application SET
     vacancy_id=$1,
      worker_id=$2,
      application_date=$3 WHERE id = $4 RETURNING *
        `,
      [vacancy_id, worker_id, application_date,id]
    );
    res.status(200).send(updatedApplication.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteApplicationById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const deletedApplication = await pool.query(
      `
          DELETE FROM application WHERE id = $1
          `,
      [id]
    );
    res.status(200).send(deletedApplication.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addApplication,
  getAllApplication,
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
};
