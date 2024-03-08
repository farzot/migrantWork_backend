const pool = require("../config/db");
const { adminValidation } = require("../validations/admin.validation");
const uuid = require("uuid");
const myJwt = require("../services/jwt_service");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../helpers/error_helper");
const mail_service = require("../services/mail_service");
const { to } = require("../helpers/to_promise");
const { log } = require("handlebars");
const config = require("config");

const addAdmin = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    const {
      name,
      email,
      hashed_password,
      phone_number,
      tg_link,
      is_active,
      is_creater,
      hashed_refresh_token,
      description,
    } = value;

    const existing = await pool.query(`SELECT * FROM admin where email=$1`, [
      email,
    ]);

    if (existing.rows[0]) {
      return res
        .status(400)
        .send({ message: "Bunday admin allaqachon mavjud" });
    }

    const hashedPassword = bcrypt.hashSync(hashed_password, 7);

    const admin_activation_link = uuid.v4();

    const newAdmin = await pool.query(
      `INSERT INTO admin(name, email, hashed_password, phone_number, tg_link,is_active, is_creater, hashed_refresh_token, description, admin_activation_link)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *`,
      [
        name,
        email,
        hashedPassword,
        phone_number,
        tg_link,
        is_active,
        is_creater,
        hashed_refresh_token,
        description,
        admin_activation_link,
      ]
    );

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/admin/activate/${admin_activation_link}`
    );

    const payload = {
      id: newAdmin.id,
      is_creater: newAdmin.is_creater,
      is_active: newAdmin.is_active,
    };
    const tokens = myJwt.generateTokens(payload);

    newAdmin.hashed_refresh_token = tokens.refreshToken;

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    res.status(201).send({
      message: "Yangi admin muvaffaqiyatli qo'shildi!\n",
      payload,
      ...tokens,
    });

    // res.status(200).send(newAdmin.rows[0]);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const admin = await pool.query("SELECT * FROM admin");
    res.status(200).send(admin.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const getAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await pool.query("SELECT * FROM admin WHERE id = $1", [id]);
    if (!admin.rows) {
      return res.status(404).send({ message: "Admin not found" });
    }
    res.status(200).send(admin.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateAdminById = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    hashed_password,
    phone_number,
    tg_link,
    is_active,
    is_creater,
    hashed_refresh_token,
    description,
  } = req.body;
  try {
    const admin = await pool.query("SELECT * FROM admin WHERE id = $1", id);
    if (admin.rows.length == 0) {
      return res.status(404).send({ message: "Admin not found" });
    }
    const updatedAdmin = await pool.query(
      `
        UPDATE admin SET name = $1, email = $2, hashed_password = $3, phone_number=$4, tg_link=$5, is_active=$6, is_creater=$7, hashed_refresh_token=$8, description=$9  WHERE id = $10 RETURNING *
        `,
      [
        name,
        email,
        hashed_password,
        phone_number,
        tg_link,
        is_active,
        is_creater,
        hashed_refresh_token,
        description,
        id,
      ]
    );
    res.status(200).send(updatedAdmin.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

const deleteAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await pool.query("SELECT * FROM admin WHERE id = $1", [id]);
    if (!admin.rows) {
      return res.status(404).send({ message: "Admin not found" });
    }
    const deletedAdmin = await pool.query(
      `
          DELETE FROM admin WHERE id = $1
          `,
      [id]
    );
    // console.log("******************");
    // console.log(admin.rows);
    res.status(200).send(deletedAdmin.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, hashed_password } = req.body;
    // select * from admin;
    const existing = await pool.query(`select * from admin where email = $1 `, [
      email,
    ]);
    if (!existing.rows[0])
      return res.status(400).send({ message: "Email yoki password xato" });
    const validPassword = bcrypt.compareSync(
      hashed_password,
      existing.rows[0].hashed_password
    );
    // console.log("Alaykum");
    // console.log(2);
    // console.log(validPassword, "validPassword");
    if (!validPassword) {
      return res.status(400).send({ message: "Email yoki password noto'g'ri" });
    }
    const payload = {
      id: existing.rows[0].id,
      is_creater: existing.rows[0].is_creater,
    };

    const tokens = myJwt.generateTokens(payload);
    console.log(tokens.refreshToken, "tokens.refreshToken");
    await pool.query(`update admin set hashed_refresh_token = $1 where id=$2`, [
      tokens.refreshToken,
      5,
    ]);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: config.get("refresh_ms"),
      httpOnly: true,
    });

    console.log(tokens);

    // const token = jwt.sign({ _id: existing._id }, config.get("tokenKey"), {
    //   expiresIn: config.get("tokenTime") /* 5d,1h */,
    // });

    //uncaughtExeption example

    // try{
    //   setTimeout(function(){
    //     var err=new Error("uncaughtExeption example");
    //     throw err;
    //   },1000);
    // }
    // catch(error){
    //   console.log(error);
    // }

    //unhandledRejection example

    // new Promise((_,reject)=>(new Error,("unhandledRejection example")));

    res.status(200).send(tokens);
  } catch (error) {
    errorHandler(res, error);
  }
};

const logOutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    console.log("**********************");
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }
    //  const payload = {
    //    id: existing.rows[0].id,
    //    is_creater: existing.rows[0].is_creater,
    //  };

    // const tokens = myJwt.generateTokens(payload);

    let admin = await pool.query(`Update admin set hashed_refresh_token =$1`, [
      " ",
    ]);

    if (!admin) {
      return res.status(400).send({ message: "Invalid token" });
    }
    res.clearCookie("refreshToken");
    res.send(admin.row);
  } catch (error) {
    errorHandler(res, error);
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    // console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "Cookieda refresh topilmadi" });
    }
    const [error, adminDataFromCookie] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res.status(403).send({ message: "Ruhsat etilmagan (Admin yo'q)" });
    }
    // const authorDataFrompool = await Author.findOne({
    //   author_token: refreshToken,
    // });

    const adminDataFromPg = await pool.query(
      `SELECT * FROM admin where hashed_refresh_token=$1`,
      [refreshToken]
    );

    if (!adminDataFromCookie || !adminDataFromPg) {
      return res.status(403).send({ message: "Ruhsat etilmagan (Admin yo'q)" });
    }
    const payload = {
      id: adminDataFromPg.id,
      is_creater: adminDataFromPg.is_creater,
    };

    const tokens = myJwt.generateTokens(payload);

    adminDataFromPg.hashed_refresh_token = tokens.refreshToken;

    // await adminDataFromPg.save();

    await pool.query(`Update admin set hashed_refresh_token =$1  returning*`, [
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

// const authorActivate = async (req, res) => {
//   try {
//     const author = await Author.findOne({
//       author_activation_link: req.params.link,
//     });
//     if (!author) {
//       return res.status(400).send({ message: "Bunday author topilmadi!" });
//     }

//     if (author.author_is_active) {
//       return res
//         .status(400)
//         .send({ message: "Bunday author allaqachon aktivlashtirilgan!" });
//     }

//     author.author_is_active = true;
//     await author.save();
//     res.send({
//       author_is_active: author.author_is_active,
//       message: "Author aktivlashtirildi",
//     });
//   } catch (error) {
//     errorHandler(res, error);
//   }
// };

module.exports = {
  addAdmin,
  getAllAdmin,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  loginAdmin,
  logOutAdmin,
  refreshAdminToken,
};
