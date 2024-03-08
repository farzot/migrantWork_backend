const pool = require("../config/db");
const { countryValidation } = require("../validations/country.validation");
const { errorHandler } = require("../helpers/error_helper");
const { log } = require("handlebars");

const addCountry = async (req, res) => {
  try {
    const { error, value } = countryValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const countryId = req.body.id;
    const { name, flag } = value;
    // console.log(value);
    const existing = await pool.query(`SELECT * FROM country where id=$1`, [
      countryId,
    ]);

    if (existing.rows[0]) {
      return res
        .status(400)
        .send({ message: "Bunday country allaqachon mavjud" });
    }
    const newCountry = await pool.query(
      `INSERT INTO country(
      name,
      flag
      ) VALUES($1, $2) returning *`,
      [name, flag]
    );
    console.log("----------------");

    res.status(200).send(newCountry.rows);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllCountry = async (req, res) => {
  try {
    const country = await pool.query("SELECT * FROM country");
    res.status(200).send(country.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getCountryById = async (req, res) => {
  const { id } = req.params;
  try {
    const country = await pool.query("SELECT * FROM country WHERE id = $1", [
      id,
    ]);
    if (country.rows[id]) {
      return res.status(404).send({ message: "Country not found" });
    }
    console.log("----------------------------");

    res.status(200).send(country.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateCountryById = async (req, res) => {
  const { id } = req.params;
  const { name, flag } = req.body;
  try {
    const country = await pool.query("SELECT * FROM country WHERE id = $1", id);
    if (country.rows[id]) {
      return res.status(404).send({ message: "Country not found" });
    }
    const updatedCountry = await pool.query(
      `
        UPDATE country SET
     name=$1, flag=$2 WHERE id = $3 RETURNING *
        `,
      [name, flag, id]
    );
    res.status(200).send(updatedCountry.rows);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteCountryById = async (req, res) => {
  try {
     const country = await pool.query(
       "SELECT * FROM country WHERE id = $1",
       id
     );
     if (country.rows[id]) {
       return res.status(404).send({ message: "Country not found" });
     }
     
      const { id } = req.params;
    const deletedCountry = await pool.query(
      `
          DELETE FROM country WHERE id = $1
          `,
      [id]
    );
    res.status(200).send(deletedCountry.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  addCountry,
  getAllCountry,
  getCountryById,
  updateCountryById,
  deleteCountryById,
};
