const { Config } = require("drizzle-kit");

module.exports = Config({
  dialect: "postgresql",
  schema: "./db-schema",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
});
