const { to } = require("../helpers/to_promise");
const myJwt = require("../services/jwt_service");

module.exports = async function (req, res, next) {
  // if(req,method="OPTIONS"){
  //     next();
  // }
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(403).json({ message: "Employee ro'yxatdan o'tmagan" });
    }
    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];
    if (bearer != "Bearer" || !token) {
      return res
        .status(403)
        .json({ message: "Employee ro'yxatdan o'tmagan (token berilmagan)" });
    }

    const [error, decodedToken] = await to(
      myJwt.verifyAccessToken(token)
    ); /* AcessToken authorizatsiyaga ruhsat bormi yo'qmi shuni bilish uchun kerak */
    if (error) {
      return res.status(403).json({ message: error.message });
    }
    // console.log(decodedToken);
    req.author = decodedToken;

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ message: "Employee  ro'yxatdan o'tmagan (token noto'g'ri)" });
  }
};
