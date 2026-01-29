const express = require("express");
const { Courses } = require("../Models/Course");
const { slugGenerator } = require("../utls/Slug");
const { default: Delay } = require("../utls/Delay");
const testRouter = express.Router();
testRouter.get("/ping", (req, res) => {
  Test(req);
  res.send({ message: "pong" });
});
testRouter.get("/memory-allocation", (req, res) => {
  let { rss, heapTotal, heapUsed, external, arrayBuffers } =
    process.memoryUsage();

  res.send({
    rss: memoryInGB(rss),
    heapTotal: memoryInGB(heapTotal),
    heapUsed: memoryInGB(heapUsed),
    external: memoryInGB(external),
    arrayBuffers: memoryInGB(arrayBuffers),
  });
});
testRouter.get("/update-slug", async (req, res) => {
  return res.send("finished updateing slug so no need");
  try {
    const courses = await Courses.find({});
    for (let i = 0; i < courses.length; i++) {
      const slug = courses[i]?.slug;
      console.log(slug);
      if (slug && slug.length > 0) continue;
      const newSlug = slugGenerator(courses[i].title);
      let resutlt = await Courses.findByIdAndUpdate(courses[i].id, {
        slug: newSlug,
      });
      console.log(resutlt);
    }
    res.send("ok");
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});
testRouter.get("/delay", async (req, res) => {
  const delay = Number(req.query.delay);
  await Delay(delay);
  res.send({ message: "hello world" });
});
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
const memoryInGB = (bytes) => {
  return (bytes / 1024 ** 2).toFixed(2) + " MB";
};
module.exports = { Test, testRouter };
