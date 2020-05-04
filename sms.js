require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH;

const client = require('twilio')(accountSid, authToken);

function send(msg, to) {
    // TODO - update 'to' to send to a list of numbers
    client.messages
      .create({
         body: msg,
         from: process.env.TWILIO_NUM,
        //  statusCallback: 'http://postb.in/1234abcd',
        // TODO - add status callback handling
         to: to
       })
      .then(message => console.log(message.sid));
}

module.exports = {
  send,
};