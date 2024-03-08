const pool = require("../config/db");
const { employerValidation } = require("../validations/employer.validation");
const uuid = require("uuid");
const myJwt = require("../services/jwt_service");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../helpers/error_helper");
const mail_service = require("../services/mail_service");
const { to } = require("../helpers/to_promise");
const { log } = require("handlebars");
const config = require("config");

const addEmployer = async (req, res) => {
  try {
    const { error, value } = employerValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    console.log("--------------*********************************");
    // console.log(country_id);

    const {
      company_name,
      country_id,
      address,
      location,
      contact_name,
      contact_passport,
      contact_email,
      contact_phone,
      hashed_password,
      hashed_refresh_token,
    } = value;
    // console.log(value);

    const existing = await pool.query(
      `SELECT * FROM employer where contact_email=$1`,
      [contact_email]
    );

    if (existing.rows[0]) {
      return res
        .status(400)
        .send({ message: "Bunday employer allaqachon mavjud" });
    }
    console.log("*******************************");
    const hashedPassword = bcrypt.hashSync(hashed_password, 7);

    // const employer_activation_link = uuid.v4();

    const countryId = await pool.query(
      `select * from country where id=$1 `,
      [country_id]
    );

    console.log(countryId);

    if (!countryId) {
      return res
        .status(400)
        .send({ message: "Bunday country mavjud mavjud emas" });
    }

    const newEmployer = await pool.query(
      `INSERT INTO employer( company_name,
      country_id,
      address,
      location,
      contact_name,
      contact_passport,
      contact_email,
      contact_phone,
      hashed_password,
      hashed_refresh_token)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *`,
      [
        company_name,
        country_id,
        address,
        location,
        contact_name,
        contact_passport,
        contact_email,
        contact_phone,
        hashedPassword,
        hashed_refresh_token,
      ]
    );

    // await mail_service.sendActivationMail(
    //   email,
    //   `${config.get("api_url")}:${config.get(
    //     "port"
    //   )}/api/employer/activate/${employer_activation_link}`
    // );

    const payload = {
      id: newEmployer.id,
    };
    console.log("--------------------------------");
    const tokens = myJwt.generateTokens(payload);

    newEmployer.hashed_refresh_token = tokens.refreshToken;

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.status(201).send({
      message: "Yangi employer muvaffaqiyatli qo'shildi!\n",
      payload,
      ...tokens,
    });

    // res.status(200).send(newEmployer.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllEmployer = async (req, res) => {
  try {
    const employer = await pool.query("SELECT * FROM employer");
    res.status(200).send(employer.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getEmployerById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const employer = await pool.query("SELECT * FROM employer WHERE id = $1", [
      id,
    ]);
    if (employer.rows[id].length == 0) {
      return res.status(404).send({ message: "Employer not found" });
    }
    res.status(200).send(employer.rows[id]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateEmployerById = async (req, res) => {
  const { id } = req.params.id;
  const {
    company_name,
    country_id,
    address,
    location,
    contact_name,
    contact_passport,
    contact_email,
    contact_phone,
    hashed_password,
    hashed_refresh_token,
  } = req.body;
  try {
    const employer = await pool.query(
      "SELECT * FROM employer WHERE id = $1",
      id
    );
    if (employer.rows[0].length == 0) {
      return res.status(404).send({ message: "Employer not found" });
    }
    const updatedEmployer = await pool.query(
      `
        UPDATE employer SET company_name=$1,
    country_id=$2,
    address=$3,
    location=$4,
    contact_name=$5,
    contact_passport=$6,
    contact_email=$7,
    contact_phone=$8,
    hashed_password=$9,
    hashed_refresh_token=$10,  WHERE id = $11 RETURNING *
        `,
      [
        company_name,
        country_id,
        address,
        location,
        contact_name,
        contact_passport,
        contact_email,
        contact_phone,
        hashed_password,
        hashed_refresh_token,
        id,
      ]
    );
    res.status(200).send(updatedEmployer.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteEmployerById = async (req, res) => {
  const { id } = req.params.id;
  try {
    const deletedEmployer = await pool.query(
      `
          DELETE FROM employer WHERE id = $1
          `,
      [id]
    );
    res.status(200).send(deletedEmployer.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const loginEmployer = async (req, res) => {
  try {
    const { contact_email, hashed_password } = req.body;
    const existing = await pool.query(
      `SELECT * FROM employer where contact_email=$1`,
      [contact_email]
    );
    if (!existing.rows[0])
      return res.status(400).send({ message: "Email yoki password xato" });
    // console.log(1);
    const validPassword = bcrypt.compareSync(
      hashed_password,
      existing.rows[0].hashed_password
    );
    console.log(2);
    if (!validPassword) {
      return res.status(400).send({ message: "Email yoki password noto'g'ri" });
    }
    const payload = {
      id: existing.rows[0].id,
    };

    const tokens = myJwt.generateTokens(payload);

    // existing.hashed_refresh_token = tokens.refreshToken;

    await pool.query(`Update employer set hashed_refresh_token = $1`, [
      tokens.refreshToken,
    ]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    console.log(tokens);
    res.status(200).send(tokens);
  } catch (error) {
    errorHandler(res, error);
  }
};

const logOutEmployer = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    console.log("***************************");
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }
    let employer = await pool.query(
      `Update employer set hashed_refresh_token = $1 where hashed_refresh_token=$2 returning*`,
      [" ", refreshToken]
    );

    if (!employer) {
      return res.status(400).send({ message: "Invalid token" });
    }
    res.clearCookie("refreshToken");
    res.send(employer.rows[0]);
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshEmployerToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }
    const [error, employerDataFromCookie] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res
        .status(403)
        .send({ message: "Ruhsat etilmagan (Employer yo'q)" });
    }
    const employerDataFromPg = await pool.query(
      `SELECT * FROM employer where hashed_refresh_token=$1`,
      [refreshToken]
    );

    if (!employerDataFromCookie || !employerDataFromPg) {
      return res
        .status(403)
        .send({ message: "Ruhsat etilmagan (Employer yo'q)" });
    }
    const payload = {
      id: employerDataFromPg.id,
    };

    const tokens = myJwt.generateTokens(payload);

    employerDataFromPg.hashed_refresh_token = tokens.refreshToken;
    await pool.query(`Update employer set hashed_refresh_token =$1`, [
      tokens.refreshToken,
    ]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.status(200).send(tokens);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
};

module.exports = {
  addEmployer,
  getAllEmployer,
  getEmployerById,
  updateEmployerById,
  deleteEmployerById,
  loginEmployer,
  logOutEmployer,
  refreshEmployerToken,
};
