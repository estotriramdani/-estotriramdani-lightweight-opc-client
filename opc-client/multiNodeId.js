const chalk = require('chalk');
const bcrypt = require('bcrypt');

const {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  ClientSubscription,
  TimestampsToReturn,
  ClientMonitoredItem,
} = require('node-opcua');
const insertToTableWithField = require('../database/insertToTableWithField');
const { logger, getToday } = require('../helpers');

async function multiNodeId({
  credentials,
  insertTimes = [],
  endpointUrl,
  nodeIds = [],
  infinite = false,
  applicationName = 'MyClient',
  databaseConfigs = {
    host: '',
    user: '',
    password: '9121h23hui12h31jk23hjk12',
    database: '',
  },
  timestampField = '',
  monitorTime = 10 * 1000,
  isInsertToDatabase = false,
}) {
  const match = await bcrypt.compare(
    credentials,
    '$2b$10$BAmleuG11iOXjkyEnvJq4ehLuRIp1k.rKlt2bx9YI0nLYXs9ZkivS'
  );
  if (!match) {
    throw Error('Please provide a correct credentials');
  }
  if (!endpointUrl) {
    throw Error('Please provide endpointUrl');
  }
  const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1,
  };
  const options = {
    applicationName,
    connectionStrategy,
    securityMode: MessageSecurityMode.None,
    securityPolicy: SecurityPolicy.None,
    endpointMustExist: true,
  };

  const client = OPCUAClient.create(options);
  await client.connect(endpointUrl);
  console.log(chalk.cyan('Connected to OPC!'));

  const session = await client.createSession();
  console.log('session created!');

  if (!nodeIds || nodeIds.length === 0) {
    await client.disconnect();
    throw Error('Please provide at least one nodeId');
  }
  nodeIds.forEach(async ({ nodeId, fieldName, tableName, aliases }) => {
    const value = 0;
    const nodeToRead = {
      nodeId,
      attributeId: AttributeIds.Value,
    };
    const dataValue = await session.read(nodeToRead, value);

    console.log(
      `Initial value of ${chalk.bgRed.white(aliases)} -> ${chalk.bgBlue.white(
        dataValue.value.value
      )}`
    );

    const subscription = ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 100,
      publishingEnabled: true,
      priority: 10,
    });

    let currentValue = dataValue.value.value;
    const values = [currentValue];

    subscription
      .on('started', () => {
        console.log(
          'subscription started for 2 seconds - subscriptionId=',
          subscription.subscriptionId
        );
        if (isInsertToDatabase) {
          logger(
            chalk.bgGreen.white(
              `The value will be stored to database ${
                insertTimes !== '-' ? `at ${insertTimes}` : ''
              }.`
            )
          );
          logger(chalk.green(`Fieldname => ${fieldName}`));
          logger(chalk.green(`Timestamp field => ${timestampField}`));
          logger(chalk.green(`Table name => ${tableName}`));
          logger(chalk.cyan('--------------------------------------'));
        }
      })
      .on('keepalive', async () => {
        if (values.length > 1) {
          const prevValue = values[values.length - 2];
          console.log(
            chalk.bgRed.white(`[${aliases}] Prev. Value: ${prevValue}`)
          );
          const currentTime = getToday().substring(11);
          if (insertTimes.includes(currentTime)) {
            const data = await insertToTableWithField({
              databaseConfigs,
              tableName,
              fieldName,
              value: prevValue,
              timestampField,
            });
            console.log(data);
            console.log(
              chalk.bgGreen.black(
                `Previous value was successfully inserted to database ${fieldName} with value ${prevValue}!`
              )
            );
            console.log(
              chalk.white('--------------------------------------------')
            );
          }
        }
        console.log(
          chalk.bgWhite.black(`[${getToday()}]`),
          chalk.bgYellow.black(
            `[${aliases}] No value change occurs. Keep alive.`
          )
        );
      })
      .on('terminated', () => {
        console.log('terminated');
        return null;
      });

    const itemToMonitor = {
      nodeId,
      attributeId: AttributeIds.Value,
    };
    const parameters = {
      samplingInterval: 100,
      discardOldest: true,
      queueSize: 10,
    };

    const monitoredItem = ClientMonitoredItem.create(
      subscription,
      itemToMonitor,
      parameters,
      TimestampsToReturn.Both
    );

    monitoredItem.on('changed', async (dValue) => {
      currentValue = dValue.value.value;
      values.push(currentValue);
      console.log(
        chalk.bgWhite.black(`[${getToday()}]`),
        chalk.bgWhite.blue(`[${aliases}]`),
        chalk.bgCyan.black(`New value: ${dValue.value}`)
      );
      if (isInsertToDatabase) {
        try {
          if (insertTimes.length !== 0) {
            const currentTime = getToday().substring(11);
            if (insertTimes.includes(currentTime)) {
              const data = await insertToTableWithField({
                databaseConfigs,
                tableName,
                fieldName,
                value: dValue.value.value,
                timestampField,
              });
              console.log(data);
              console.log(
                chalk.bgGreen.black(
                  `Value was successfully inserted to database ${fieldName} with value ${dValue.value.value}!`
                )
              );
              console.log(
                chalk.white('--------------------------------------------')
              );
            }
          } else {
            const data = await insertToTableWithField({
              databaseConfigs,
              tableName,
              fieldName,
              value: dValue.value.value,
              timestampField,
            });
            console.log(data);
            console.log(
              chalk.bgGreen.black(
                `Value was successfully inserted to database ${fieldName} with value ${dValue.value.value}!`
              )
            );
            console.log(
              chalk.white('--------------------------------------------')
            );
          }
        } catch (error) {
          await client.disconnect();
          throw Error(error);
        }
      }
    });

    if (!infinite) {
      const timeout = async (ms) => {
        const promise = new Promise((resolve) => setTimeout(resolve, ms));
        return promise;
      };
      await timeout(monitorTime);

      console.log('now terminating subscription');
      await subscription.terminate();

      // close session
      await session.close();

      // disconnecting
      await client.disconnect();
      console.log('done !');
      return null;
    }
  });
}

module.exports = multiNodeId;
