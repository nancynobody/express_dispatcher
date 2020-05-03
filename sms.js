const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTH;

// const client = require('twilio')(accountSid, authToken);

// function send(msg, to) {  // update so 'to' can be a list of multiple numbers
//   client.messages
//   .create({
//      body: msg,
//      from: process.env.TWILIO_NUM,
//      to: to
//    })
//   .then(message => dlog(`Message (sid: ${message.sid} sent to ${to}`));
// }

// module.exports = {
//   send,
// };