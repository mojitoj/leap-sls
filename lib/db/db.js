const knexConfig = require("../../knexfile");
const config = knexConfig[process.env.NODE_ENV || "production"];
const knex = require("knex")(config);

module.exports = { knex };
