const express = require("express");
const server = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

//middleware
const { allowedCorsList } = require("./src/config/mode.Config");
server.use(
  cors({
    origin: allowedCorsList,
    credentials: true,
  }),
);
server.use(express.json());
server.use(cookieParser());


const { testRouter } = require("./test/test");
//new update routes
const AuthRoute = require("./src/auth/auth.route");
// const UserRoute = require("./src/modules/user/user.route");
const courseRoute = require("./src/modules/courses/course.route");
// const commonRoute = require("./src/modules/common/common.route");
const {
  isUserAdmin,
  accessTokenValidation,
} = require("./src/shared/utility/cryptic/AuthFunctations");
const adminRoute = require("./src/modules/admin/admin.route");
const { pathMiddleWare } = require("./src/shared/utility/RequestTimeInfo");

//PORT Configurations
const PORT = process.env.PORT ?? 5000;

//ROUTES 
server.get("/", (req, res) => {
  res.send({ message: "Welcome to BD Counsel Backend API" });
});
server.use("/auth", pathMiddleWare, AuthRoute);
server.use("/authv3", pathMiddleWare, AuthRoute);


// server.use("/commonv2", pathMiddleWare, commonRoute);
server.use("/coursesv2", pathMiddleWare, courseRoute);

// server.use("/user", pathMiddleWare, UserRoute);
server.use(
  "/admin",
  pathMiddleWare,
  accessTokenValidation,
  isUserAdmin,
  adminRoute,
);

server.use("/test", pathMiddleWare, testRouter);
server.use("/*all", pathMiddleWare, (req, res) => {
  res.send({ error: true, message: "API Path not found", data: {} });
});

server.listen(PORT, () => {
  console.log("Server is running at \n http://localhost:" + PORT);
});
