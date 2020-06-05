const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// HELPERS, UTILS, CONFIGS
const handler = require('./helpers/handler');
const utils = require('./utils/_');
const configs = require('./config/_');

const msg = configs.msg;
const cmd = configs.cmd;
const logger = config.winston;

const app = express();

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));

// POST - sms messages
app.post('/sms', (req, res) => {
  let msg_response = new MessagingResponse();
  let frm_num = req.body.From;
  let body = req.body.Body.toLowerCase();
  if (!frm_num) throw new Error('req.body.From is undefined');

  logger.info(`New sms from ${frm_num}: ${req.body.Body}`);

  switch (body) {

    case cmd.START_SERVICE_REQ:    // START/CANCEL service request
    case cmd.CANCEL_SERVICE_REQ:
      handler.service_request(frm_num, body)
      .then((message) => {
        msg_response.message(message);
        logger.info(`Result: \n${msg_response.toString()}`);
      })
      .catch((error) => {  // internal error
        logger.error(error);
        logger.info('Sending nice error message to requester.');
        msg_response.message(msg.error);
        logger.info(`Result: \n${msg_response.toString()}`);
      });
      break;
      
      case cmd.SUBSCRIBE:    // SUBSCRIBE/UNSIBSCRIBE as a provider
      case cmd.UNSUBSCRIBE:
        handler.update_subscription(frm_num, body)
        .then((message) => {
          msg_response.message(message);
          logger.info(`Result: \n${msg_response.toString()}`);
        })
        .catch((error) => {  // internal error
          logger.error(error);
          logger.info('Sending nice error message to requester.');
          msg_response.message(msg.error);
          logger.info(`Result: \n${msg_response.toString()}`);
        });
        break;

      case cmd.AVAILABLE:  // update subscriber status to AVAILABLE/UNAVAILABLE
      case cmd.UNAVAILABLE:
        handler.update_availability(frm_num, body)
        .then((message) => {
          msg_response.message(message);
          logger.info(`Result: \n${msg_response.toString()}`);
        })
        .catch((error) => {  // internal error
          logger.error(error);
          logger.info('Sending nice error message to requester.');
          msg_response.message(msg.error);
          logger.info(`Result: \n${msg_response.toString()}`);
        });
        break;

      // TODO (fix)
      case configs.app.approve_regex.test(cmd.APPROVE):    // APPROVE/DENY a providers subscription request (ADMIN ONLY)
      case configs.app.deny_regex.test(cmd.DENY):
        handler.respond_to_subscription_request(frm_num, body)
        .then((message) => {
          msg_response.message(message);
          logger.info(`Result: \n${msg_response.toString()}`);
        })
        .catch((error) => {  // internal error
          logger.error(error);
          logger.info('Sending nice error message to requester.');
          msg_response.message(msg.error);
          logger.info(`Result: \n${msg_response.toString()}`);
        });
        break;

      case cmd.SHOW_ALL:    // show db
        handler.handle_show_db(frm_num)
        .then((message) => {
          msg_response.message(message);
          logger.info(`Result: \n${msg_response.toString()}`);
        })
        .catch((error) => {  // internal error
          logger.error(error);
          logger.info('Sending nice error message to requester.');
          msg_response.message(msg.error);
          logger.info(`Result: \n${msg_response.toString()}`);
        });
        break;

      default:    // display HELP for anything else
        logger.info('Unrecognized sms input command...displaying help menu.');
        msg_response.message(msg.help_menu);
        logger.info(`Result: \n${msg_response.toString()}`);
  }
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(msg_response.toString());
});

// POST - status update rte
app.post('/status', function (req, res) {
  logger.info(`Status Update Received: ${JSON.stringify(req.body)}`);
  switch (req.body.SmsStatus.toLowerCase()) {
    // Unused...by default assume success, only handle issues+cleanup 
    // case status.QUEUED:
    // case status.SENT:
    // case status.DELIVERED:
    case status.FAILED:
      // fall through
    case status.UNDELIVERED:
      handler.cleanup_sms_delivery_failure(req.body)
      .then(logger.info('Sms delivery issue resolved.'))
      .catch('TODO - Sms delivery issue unresolved.')
      break;
  }
  res.end();
});

http.createServer(app).listen(1337, () => {
  logger.info('Express server listening on port 1337');
});
