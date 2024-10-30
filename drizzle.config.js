require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "dev"}`
});

module.exports = {
  dialect: "postgresql",
  schema: "./db-schema/*.js",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  verbose: true
};
