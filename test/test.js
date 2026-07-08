const express = require("express");
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

testRouter.get("/delay", async (req, res) => {
  const delay = Number(req.query.delay);
  await Delay(delay);
  res.send({ message: "hello world" });
});

const memoryInGB = (bytes) => {
  return (bytes / 1024 ** 2).toFixed(2) + " MB";
};
module.exports = { testRouter };
