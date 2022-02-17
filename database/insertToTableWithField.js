const queryBuiler = require('./queryBuiler');
const { getToday } = require('../helpers');

const insertToTableWithField = async ({
  databaseConfigs = {
    host: '',
    user: '',
    password: '',
    database: '',
  },
  tableName = '',
  fieldName = '',
  value = '',
  timestampField = 'created_at',
}) => {
  const currentTimeStamp = getToday();
  const queryInsert = `INSERT INTO ${tableName} (${fieldName}) VALUES ('${value}')`;
  const querySelect = `SELECT * FROM ${tableName} WHERE ${timestampField} = '${currentTimeStamp}'`;
  const queryUpdate = `UPDATE ${tableName} SET ${fieldName} = '${value}' WHERE ${timestampField} = '${currentTimeStamp}'`;
  const check = await queryBuiler({
    databaseConfigs,
    query: querySelect,
  });

  if (check) {
    if (check.length === 0) {
      const result = await queryBuiler({
        databaseConfigs,
        query: queryInsert,
      });
      return { query: queryInsert, result };
    } else {
      const result = await queryBuiler({
        databaseConfigs,
        query: queryUpdate,
      });
      return { query: queryUpdate, result };
    }
  }
  return null;
};

module.exports = insertToTableWithField;
