const express = require("express");
const server = express();
require("dotenv").config();
const PORT = process.env.PORT ?? 5000;
const cors = require("cors");
const { pathMiddleWare } = require("./utls/RequestTimeInfo");
const { mongooseConnect } = require("./utls/MongooseConnect");
const { auth_router } = require("./Auth");
const cookieParser = require("cookie-parser");
const { course_router } = require("./API/Course");
const { isUserAuthorized } = require("./utls/AuthFunctations");

//middleware
const allowedCorsList = [
  "http://localhost:3000",
  "http://192.168.0.101:3000",
  "http://192.168.0.100:3000",
  "https://www.bangladeshcounsel.com",
];
server.use(
  cors({
    origin: allowedCorsList,
    credentials: true,
  })
);
server.use(express.json());
server.use(cookieParser());
mongooseConnect();
server.get("/", (req, res) => {
  res.send({ message: "Welcome to BD Counsel Backend API" });
});
server.use("/auth", pathMiddleWare, auth_router);
server.use("/courses", pathMiddleWare, isUserAuthorized, course_router);
server.use("/*all", pathMiddleWare, (req, res) => {
  res.send({ error: true, message: "API Path not found", data: {} });
});
server.listen(PORT, () => {
  console.log("Server is running at \n http://localhost:" + PORT);
});

//Api end points/*
/**
 * get courses api --
 * create course api --
 * update course api --
 * delete course api --
 * add images to course api --
 * delete images from course api --
 * create module -
 * update module -
 * delete module -
 * add video to module to api
 * update video of module api
 * delete video from module api
 * add resources to module api
 * update resources of module api
 * delete resources from module api
 */
