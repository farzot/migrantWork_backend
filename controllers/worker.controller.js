const pool = require("../config/db");
const { workerValidation } = require("../validations/worker.validation");
const uuid = require("uuid");
const myJwt = require("../services/jwt_service");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../helpers/error_helper");
const mail_service = require("../services/mail_service");
const { to } = require("../helpers/to_promise");
const { log } = require("handlebars");
const config = require("config");

const addWorker = async (req, res) => {
  try {
    const { error, value } = workerValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const {
      first_name,
      last_name,
      birth_date,
      gender,
      passport,
      phone_number,
      email,
      hashed_password,
      hashed_refresh_token,
      is_active,
      education,
      skills,
      experience,
    } = value;
    console.log(value);
    const existing = await pool.query(`SELECT * FROM worker where email=$1`, [
      email,
    ]);
    // console.log(existing);
    if (existing.rows[email]) {
      return res
        .status(400)
        .send({ message: "Bunday worker allaqachon mavjud" });
    }

    const hashedPassword = bcrypt.hashSync(hashed_password, 7);

    const worker_activation_link = uuid.v4();

    const newWorker = await pool.query(
      `INSERT INTO worker(first_name,
      last_name,
      birth_date,
      gender,
      passport,
      phone_number,
      email,
      hashed_password,
      hashed_refresh_token,
      is_active,
      education,
      skills,
      experience,
      worker_activation_link)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 ) returning *`,
      [
        first_name,
        last_name,
        birth_date,
        gender,
        passport,
        phone_number,
        email,
        hashedPassword,
        hashed_refresh_token,
        is_active,
        education,
        skills,
        experience,
        worker_activation_link,
      ]
    );

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/worker/activate/${worker_activation_link}`
    );

    const payload = {
      id: newWorker.id,
      is_active: newWorker.is_active,
    };
    const tokens = myJwt.generateTokens(payload);

    newWorker.hashed_refresh_token = tokens.refreshToken;

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.status(201).send({
      message: "Yangi worker muvaffaqiyatli qo'shildi!\n",
      payload,
      ...tokens,
    });

    // res.status(200).send(newWorker.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllWorker = async (req, res) => {
  try {
    const worker = await pool.query("SELECT * FROM worker");
    console.log("******************");
    console.log(worker);
    res.status(200).send(worker.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getWorkerById = async (req, res) => {
  const { id } = req.params;
  try {
    const worker = await pool.query("SELECT * FROM worker WHERE id = $1", [id]);
    if (!worker.rows) {
      return res.status(404).send({ message: "Worker not found" });
    }
    res.status(200).send(worker.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateWorkerById = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    passport,
    phone_number,
    email,
    hashed_password,
    hashed_refresh_token,
    is_active,
    education,
    skills,
    experience,
  } = req.body;
  try {
    const worker = await pool.query("SELECT * FROM worker WHERE id = $1", id);
    if (!worker.rows) {
      return res.status(404).send({ message: "Worker not found" });
    }
    const updatedWorker = await pool.query(
      `
        UPDATE worker SET first_name=$1,
      last_name=$2,
      birth_date=$3,
      gender=$4,
      passport=$5,
      phone_number=$6,
      email=$7,
      hashed_password=$8,
      hashed_refresh_token=$9,
      is_active=$10,
      education=$11,
      skills=$12,
      experience=$13  WHERE id = $14 RETURNING *
        `,
      [
        first_name,
        last_name,
        birth_date,
        gender,
        passport,
        phone_number,
        email,
        hashed_password,
        hashed_refresh_token,
        is_active,
        education,
        skills,
        experience,
        id,
      ]
    );
    res.status(200).send(updatedWorker.rows);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteWorkerById = async (req, res) => {
  try {
    const worker = await pool.query("SELECT * FROM worker WHERE id = $1", [id]);
    if (!worker.rows) {
      return res.status(404).send({ message: "Worker not found" });
    }
    const { id } = req.params;
    const deletedWorker = await pool.query(
      `
          DELETE FROM worker WHERE id = $1
          `,
      [id]
    );
    res.status(200).send(deletedWorker.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const loginWorker = async (req, res) => {
  try {
    const { email, hashed_password } = req.body;
    const existing = await pool.query(`SELECT * FROM worker where email=$1`, [
      email,
    ]);
    if (!existing.rows[0])
      return res.status(400).send({ message: "Email yoki password xato" });
    const validPassword = bcrypt.compareSync(
      hashed_password,
      existing.rows[0].hashed_password
    );
    // console.log(2);
    if (!validPassword) {
      return res.status(400).send({ message: "Email yoki password noto'g'ri" });
    }
    const payload = {
      id: existing.rows[0].id,
      is_active: existing.rows[0].is_active,
    };

    const tokens = myJwt.generateTokens(payload);

    existing.hashed_refresh_token = tokens.refreshToken;

    await pool.query(`Update worker set hashed_refresh_token = $1`, [
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

const logOutWorker = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }
    // let author = await Author.findOneAndUpdate(
    //   {
    //     author_token: refreshToken,
    //   },
    //   { author_token: "" },
    //   { new: true }
    // );

    let worker = await pool.query(
      `Update worker set hashed_refresh_token = " "`[tokens.refreshToken]
    );

    if (!worker.rows[0]) {
      return res.status(400).send({ message: "Invalid token" });
    }
    res.clearCookie("refreshToken");
    res.send(worker.rows[0]);
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshWorkerToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    // console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }
    const [error, workerDataFromCookie] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res
        .status(403)
        .send({ message: "Ruhsat etilmagan (Worker yo'q)" });
    }
    // const authorDataFrompool = await Author.findOne({
    //   author_token: refreshToken,
    // });

    const workerDataFromPg = await pool.query(
      `SELECT * FROM worker where hashed_refresh_token=$1`,
      [refreshToken]
    );

    if (!workerDataFromCookie || !workerDataFromPg) {
      return res
        .status(403)
        .send({ message: "Ruhsat etilmagan (Worker yo'q)" });
    }
    const payload = {
      id: workerDataFromPg.id,
      is_active: workerDataFromPg.is_active,
    };

    const tokens = myJwt.generateTokens(payload);

    workerDataFromPg.hashed_refresh_token = tokens.refreshToken;

    // await workerDataFromPg.save();

    await pool.query(`Update worker set hashed_refresh_token =$1`, [
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

const workerActivate = async (req, res) => {
  try {
    const link = req.params.link;
    const existing = await pool.query(
      `SELECT * FROM worker where worker_activation_link=$1`,
      [link]
    );

    if (!existing.rows[0]) {
      return res.status(400).send({ message: "Bunday worker topilmadi!" });
    }

    if (existing.rows[0].is_active) {
      return res
        .status(400)
        .send({ message: "Bunday worker allaqachon aktivlashtirilgan!" });
    }

    await pool.query(`Update worker set is_active = $1 returning *`, [true]);

    res.send({
      is_active: existing.rows[0].is_active,
      message: "Worker aktivlashtirildi",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addWorker,
  getAllWorker,
  getWorkerById,
  updateWorkerById,
  deleteWorkerById,
  loginWorker,
  logOutWorker,
  refreshWorkerToken,
  workerActivate,
};
