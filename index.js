const express = require("express");
const server = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

//middleware
const { allowedCorsList } = require("./modeConfig");
server.use(
  cors({
    origin: allowedCorsList,
    credentials: true,
  }),
);
server.use(express.json());
server.use(cookieParser());

//utility functions
const { pathMiddleWare } = require("./utls/RequestTimeInfo");
const { mongooseConnect } = require("./utls/MongooseConnect");
const {
  isUserAuthorized,
  accessTokenValidation,
} = require("./utls/AuthFunctations");

//Routes
const { auth_router } = require("./Auth");
const { course_router } = require("./API/Course");
const { common_router } = require("./API/common");
const { Authentication_Route } = require("./API/Auth");
const { testRouter } = require("./test/test");

//PORT Configurations
const PORT = process.env.PORT ?? 5000;

//DB Connect
mongooseConnect();

server.get("/", (req, res) => {
  res.send({ message: "Welcome to BD Counsel Backend API" });
});
server.use("/auth", pathMiddleWare, auth_router);
server.use("/authv2", pathMiddleWare, Authentication_Route);

server.use("/common", pathMiddleWare, common_router);
server.use("/courses",pathMiddleWare,course_router);

server.use("/user", pathMiddleWare, (req, res) => {
  res.send({ message: "Welcome to User Panel" });
});
server.use("/admin", pathMiddleWare, isUserAuthorized, (req, res) => {
  res.send({ message: "Welcome to Admin Panel" });
});

server.use("/test", pathMiddleWare, testRouter);
server.use("/*all", pathMiddleWare, (req, res) => {
  res.send({ error: true, message: "API Path not found", data: {} });
});


server.listen(PORT, () => {
  console.log("Server is running at \n http://localhost:" + PORT);
});
