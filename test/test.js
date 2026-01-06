const express = require("express");
const UAParser = require("ua-parser-js");
const { generateToken, verifyToken } = require("../utls/JWTFunctions");
const testRouter = express.Router();
testRouter.get("/ping", (req, res) => {
  Test(req);
  res.send({ message: "pong" });
});
testRouter.get("/memory-allocation",(req,res)=>{
let { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();


res.send({rss: memoryInGB(rss), heapTotal: memoryInGB(heapTotal), heapUsed: memoryInGB(heapUsed), external: memoryInGB(external), arrayBuffers: memoryInGB(arrayBuffers)})
})
const Test = (req) => {
  // const loginLog = {
  //   identifier: email / phone,
  //   action: "LOGIN", // LOGIN | REGISTER | LOGOUT
  //   status: "SUCCESS", // SUCCESS | FAILED
  //   authMethod: "password",

  //   ipAddress: req.ip,
  //   userAgent: req.headers["user-agent"],

  //   device: {
  //     type: req.useragent?.isMobile ? "mobile" : "desktop",
  //     platform: req.useragent?.platform || "unknown",
  //     browser: req.useragent?.browser || "unknown",
  //   },
  //   isNewDevice: true, // computed by comparing past logs
  // };
  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();
  const log = {
    identifier: email / phone,
    action: "LOGIN", // LOGIN | REGISTER | LOGOUT
    status: "SUCCESS", // SUCCESS | FAILED
    authMethod: "password",
    deviceInfo: {
      ip: req?.ip,
      browser: ua.browser.name,
      os: ua.os.name,
      deviceType: ua.device.type || "desktop",
      userAgent: req.headers["user-agent"],
    },
  };

  console.log(log);
};
const memoryInGB = (bytes)=>{
  return (bytes / (1024 ** 2)).toFixed(2) + ' MB';
}
module.exports = { Test, testRouter };
