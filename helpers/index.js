const transformToTwoDigits = ({ number }) => {
  return number.toLocaleString('en-US', { minimumIntegerDigits: 2 });
};

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = transformToTwoDigits({ number: today.getMonth() + 1 });
  const date = transformToTwoDigits({ number: today.getDate() });
  const hour = transformToTwoDigits({ number: today.getHours() });
  const minute = transformToTwoDigits({ number: today.getMinutes() });
  const second = transformToTwoDigits({ number: today.getSeconds() });

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
};

const logger = (message) => {
  return console.log(message);
};

module.exports = { getToday, transformToTwoDigits, logger };
