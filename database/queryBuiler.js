const mysql = require('mysql');

const queryBuiler = ({ databaseConfigs, query }) =>
  new Promise((resolve, reject) => {
    const con = mysql.createConnection(databaseConfigs);
    con.connect((err) => {
      if (err) {
        reject(err);
      }
    });
    con.query(query, (err, result) => {
      if (err) reject(err);
      con.end();
      resolve(result);
    });
  });

module.exports = queryBuiler;
