## Lightweight OPC Client

Install using NPM
`npm install lightweight-opc-client`
or using Yarn
`yarn add lightweight-opc-client`

Require lightWeightOPCClient to your code.

```javascript
const { lightWeightOPCClient } = require('lightweight-opc-client');
```

Then configure the params. The result will displayed on console. You can also store the value to MySQL database.

Params:
| name | description | type | required? | example |
|--|--|--|--|--|
| endpointUrl | URL to OPC server | string | yes | opc.tcp://192.168.1.1:49320 |
| nodeId |OPC node ID | string | yes | ns=2;s=sample-NODE-ID |
| applicationName | your application name you want | string | optional. Default: MyApp | "MyApp" |
| infinite | set monitoring to infinite | boolean | optional. Default: false | true |
| monitorTime | set how long device (in milisecond) to be monitored if infinite is set to false | number | Optional. Default: 10000 | 10000
| databaseConfigs | connect to database if you want save the data to databae | object | Optional | { host: 'databasehost', user: 'username', password: 'your-password', database: 'sample_db' }
| tableName | the name of the table to store the data in database | string | Yes, if databaseConfigs exists | sample_table |
| fieldName | the name of the field to store the data in database | string | Yes, if databaseConfigs exists | sample_field |
| timestampField | field that receive timestamp value | string | Yes, if databaseConfigs exists. Default: created_at | created_at

Example

```javascript
const { lightWeightOPCClient } = require('lightweight-opc-client');

const databaseConfigs = {
  host: 'databasehost',
  user: 'username',
  password: 'your-password',
  database: 'ems_data',
};

const endpointUrl = 'opc.tcp://192.168.1.1:49320';
const nodeId = 'ns=2;s=sample-NODE-ID';
const fieldName = 'value';
const tableName = 'test_table';
const timestampField = 'created_at';

lightWeightOPCClient({
  endpointUrl,
  nodeId,
  applicationName: 'UV Lamp No. 3',
  infinite: true,
  monitorTime: 10 * 1000,
  databaseConfigs,
  fieldName,
  tableName,
  timestampField,
});
```
