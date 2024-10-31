require("dotenv").config({ path: ".env.test" });
process.env.NODE_ENV = "test";

const { tearDownDB } = require("./test/config/seed");

async function tearDown() {
  await tearDownDB();
}

module.exports = tearDown;
