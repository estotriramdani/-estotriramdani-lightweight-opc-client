const mysql = require('mysql2');

const queryBuiler = ({ databaseConfigs, query }) => {
  const promise = new Promise((resolve, reject) => {
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
  return promise;
};

module.exports = queryBuiler;
