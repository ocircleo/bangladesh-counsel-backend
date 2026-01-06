const mode = "lan1"; //local, lan1, lan2, prod

const config = {
  local: "localhost",
  lan1: "192.168.0.100",
  lan2: "192.168.0.120",
  prod: ".bangladeshcounsel.com",
};
const domain = config[mode];
const prodMode = mode === "prod" ? true : false;

const allowedCorsList = [
  "http://localhost:3000",
  "http://10.239.45.108:3000",
  "http://192.168.0.101:3000",
  "http://192.168.0.100:3000",
  "https://www.bangladeshcounsel.com",
];
const cookieOptions = {
  httpOnly: true,
  secure: prodMode,
  sameSite: prodMode ? "none" : "lax",
  domain: domain,
};
module.exports = { prodMode, domain, allowedCorsList, cookieOptions };
