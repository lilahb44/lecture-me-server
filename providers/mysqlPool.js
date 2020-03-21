const mysql = require("mysql");
const pool = mysql.createPool(process.env.DATABASE_URL);

exports.asyncQuery = (...args) =>
  new Promise((res, rej) =>
    pool.query(...args, (err, result) => {
      if (err) rej(err);
      else res(result);
    })
  );

exports.pool = pool;
