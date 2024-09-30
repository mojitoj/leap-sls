module.exports = {
  test: {
    client: "postgresql",
    connection: `${process.env.PG_CONNECTION_STRING}`,
    pool: {
      min: 1,
      max: 1
    },
    migrations: {
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds/test"
    }
  },
  production: {
    client: "postgresql",
    connection: `${process.env.PG_CONNECTION_STRING}`,
    pool: {
      min: 1,
      max: 1
    },
    migrations: {
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds/production"
    }
  }
};
