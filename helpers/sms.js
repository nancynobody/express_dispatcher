require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH;
const smsUrl = process.env.SMS_URL;

const client = require('twilio')(accountSid, authToken);

function send(msg, to) {
  return new Promise((resolve, reject) => {
    // TODO - perhaps update 'to' to send to a single or list of numbers
    client.messages
    .create({
      body: msg,
      from: process.env.TWILIO_NUM,
      statusCallback: smsUrl + '/status',
      to: to
    })
    .then(message => {  // API request sent
      logger.info(JSON.stringify(message, null, 2));
      resolve(message);
    })
    .catch(error => { // API request failure
      reject(error);
    });
  });
}

module.exports = {
  send,
};