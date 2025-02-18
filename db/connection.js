const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

let config = {};

const fs = require("fs");
const pg = require("pg");

if (ENV === 'production') {
  config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 10026,
    database: "defaultdb",
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync("db/seeds/ca.pem").toString(),
    },
  };
  config.max = 2;
}

const client = new pg.Client(config);
client.connect(function (err) {
  if (err) throw err;
  client.query("SELECT VERSION()", [], function (err, result) {
    if (err) throw err;
    console.log(result.rows[0]);
    client.end(function (err) {
      if (err) throw err;
    });
  });
});


module.exports = new Pool(config);
