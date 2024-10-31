require("dotenv").config({ path: ".env.test" });
process.env.NODE_ENV = "test";

const { seedData } = require("./test/config/seed");

async function setUp() {
  await seedData();
}

module.exports = setUp;
