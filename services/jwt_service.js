const config = require("config");
const jwt = require("jsonwebtoken");

class JwtService {
  constructor(accesKey, refreshKey, accesTime, refreshTime) {
    this.accesKey = accesKey;
    this.refreshKey = refreshKey;
    this.accesTime = accesTime;
    this.refreshTime = refreshTime;
  }

  generateTokens(payload) {
    const accesToken = jwt.sign(payload, this.accesKey, {
      expiresIn: this.accesTime,
    });

    const refreshToken = jwt.sign(payload, this.refreshKey, {
      expiresIn: this.refreshTime,
    });
    return {
      accesToken,
      refreshToken,
    };
  }
  async verifyAccessToken(token) {
    return jwt.verify(token, this.accesKey);
  }
  async verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshKey);
  }
}

module.exports = new JwtService(
  config.get("access_key"),
  config.get("refresh_key"),
  config.get("access_time"),
  config.get("refresh_time")
);
