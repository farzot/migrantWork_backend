const express = require("express");
const mainRouter = require("./routes/index.routes");
const config = require("config");
const cookieParser = require("cookie-parser");
const { yozish, xatolar } = require("./services/express_winsdom");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const error_handing_middleware = require("./middleware/error_handing_middleware");
const {
  expressWinstonLogger,
  expressWinstonErrorLogger,
} = require("./middleware/loggerMiddleware");

const PORT = config.get("port") || 4001;

const server = express();
server.use(cookieParser());
server.use(express.json());

server.use(yozish);
server.use(xatolar);

server.use(expressWinstonLogger);

server.use("/api", mainRouter);

server.use(expressWinstonErrorLogger);

server.use(error_handing_middleware);

async function start() {
  try {
    server.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
