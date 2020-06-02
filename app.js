const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const dlog = require('./logger');
const handler = require('./handlers');
const config = require('./config');
const msg = config.messages;
const cmd = config.commands;

const status = {
  'QUEUED': 'queued',  // API request to send a message was successful and the message is queued to be sent out
  'SENT': 'sent',  // The nearest upstream carrier accepted the message
  'FAILED': 'failed',  // The message could not be sent
  'DELIVERED': 'delivered',  // Twilio has received confirmation of message delivery from the upstream carrier
  'UNDELIVERED': 'undelivered',  // Twilio has received a delivery receipt indicating that the message was not delivered
};

const app = express();

const approve_regex = /!approve\s?\+[0-9]{11}/i;
const deny_regex = /!deny\s?\+[0-9]{11}/i;
var m = null;

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));

// TODO - test/validate configs (make sure reqd vars are there, etc)
// TODO - consider only allow !showall cmd in debug/dev env?

// POST - sms messages (webhook via ngrok)
app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  let frm_num = req.body.From 
  if (!frm_num) throw new Error('req.body.From is undefined');

  switch (req.body.Body.toLowerCase()) {
    
    case cmd.CANCEL_SERVICE_REQ:    // cancel service request
      dlog('Service cancellation requested.');
      handler.cancel_service_request(frm_num)
        .then(message => {
          dlog(`Cancel service request result: ${message}`);
          twiml.message(message);
        })
        .catch((error) => {
          dlog('Sending nice error message to requester.');
          twiml.message(msg.error);
        });
      break;
    
      case cmd.START_SERVICE_REQ:    // start service request
        if (handler.has_pending_service_request(frm_num)) {
          dlog(`${frm_num} already has pending service request.`);
          twiml.message('This number already has a pending service request.');
        } else if (handler.has_completed_service_request(frm_num)) {
          dlog(`${frm_num} already has approved/active service request.`);
          twiml.message('This number already has an active service request.');
        } else { 
          handler.start_service_request(frm_num)
          .then((message) => {  // no providers available or null
            twiml.message(message);
          })
          .catch((error) => {  // internal error
            dlog('Sending nice error message to requester.');
            twiml.message(msg.error);
          });
        }
        break;
    
      case cmd.SHOW_ALL:    // show db
        if (handler.is_admin(frm_num)) {
          let str = 'Admin:' + handler.get_admin() +
                    '\nProviders Approved: ' + handler.get_providers_approved() +
                    '\nProviders Subscribed: ' + handler.get_providers_subscribed() +
                    '\nProviders Pending: ' + handler.get_providers_pending() +
                    '\nProviders Available: ' + handler.get_providers_available();
          dlog(str);
          twiml.message(str);
        } else {
          dlog(msg.admin_only);
          twiml.message(msg.admin_only);
        }
        break;
      
      case cmd.SUBSCRIBE:    // subscribe as a provider
        if (handler.is_subscribed(frm_num)) {
          dlog(msg.provider_already_subscribed);
          twiml.message(msg.provider_already_subscribed);
        } else {
          if (handler.is_approved(frm_num)) {
            handler.add_subscriber(frm_num);
            dlog(msg.provider_subscribed);
            twiml.message(msg.provider_subscribed);
          } else {
            dlog(msg.provider_subscribe_request_pending);
            twiml.message(msg.provider_subscribe_request_pending);
            handler.request_admin_approval(frm_num);
          }
        }
        break;

      case cmd.UNSUBSCRIBE:    // unsubscribe as a provider
        if (handler.is_subscribed(frm_num)) {
          handler.remove_subscriber(frm_num);
          dlog(msg.provider_unsubscribed);
          twiml.message(msg.provider_unsubscribed);
        } else {
          dlog(msg.provider_not_subscribed);
          twiml.message(msg.provider_not_unsubscribed);
        }
        break;

      case cmd.AVAILABLE:    // update subscriber status to AVAILABLE
        if (handler.is_subscribed(frm_num)) {
          handler.update_subscriber_status(frm_num, 1);
          twiml.message(msg.provider_status_update_available);
        } else {
          dlog(msg.provider_status_update_error);
          twiml.message(msg.provider_status_update_error);
        }
        break;

      case cmd.UNAVAILABLE:    // update subscriber status to UNAVAILABLE
        if (handler.is_subscribed(frm_num)) {
          handler.update_subscriber_status(frm_num, 0);
          twiml.message(msg.provider_status_update_unavailable);
        } else {
          dlog(provider_status_update_error);
          twiml.message(msg.provider_status_update_error);
        }
        break;

      case cmd.APPROVE:    // approve a provider (ADMIN ONLY)
      // if ((m = approve_regex.exec(req.body.Body.toLowerCase())) !== null) {  // approve a provider (ADMIN ONLY)
      //   let num = null;
      //   m.forEach((match, groupIndex) => {
      //     dlog(`Matched APPROVE cmd - group ${groupIndex}: ${match}`);
      //     num = '+' + match.split('+')[1];
      //   });
      //   dlog(`Provider number is: ${num}`);
      //   if (handler.is_admin(frm_num)) {
      //     dlog(`Source (${frm_num}) is admin`);
      //     if (handler.is_approved(num)) {
      //       dlog(msg.provider_already_approved); 
      //       twiml.message(msg.provider_already_approved); 
      //     } else {
      //       handler.approve_provider(num);
      //       dlog(msg.provider_approve_success);
      //       twiml.message(msg.provider_approve_success);
      //     }
      //   } else {
      //     dlog(msg.admin_only);
      //     twiml.message(msg.admin_only);
      //   }
        break;

      case cmd.DENY:    // deny a provider (ADMIN ONLY)
      // if ((m = deny_regex.exec(req.body.Body.toLowerCase())) !== null) {  // deny a provider (ADMIN ONLY)
      //   let num = null;
      //   m.forEach((match, groupIndex) => {
      //     dlog(`Matched DENY cmd - group ${groupIndex}: ${match}`);
      //     num = '+' + match.split('+')[1];
      //   });
      //   if (handler.is_admin(frm_num)) {
      //     dlog(`Source (${frm_num}) is admin`);
      //     if (handler.deny_provider(num)) {
      //       twiml.message(msg.provider_denied_success);
      //     } else {
      //       dlog(`There was an issue denying provider ${num}.`);
      //     }
      //   } else {
      //     dlog(msg.admin_only);
      //     twiml.message(msg.admin_only);
      //   }
        break;

      default:    // display help menu for anything else
        dlog(msg.help_menu);
        twiml.message(msg.help_menu);
  }
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// POST - status update rte
app.post('/status', function (req, res) {
  dlog(`Status Update Received: ${JSON.stringify(req.body)}`);
  switch (req.body.SmsStatus.toLowerCase()) {
    // Unused...by default assume success, only handle issues+cleanup 
    // case status.QUEUED:
    // case status.SENT:
    // case status.DELIVERED:
    case status.FAILED:
      // fall through
    case status.UNDELIVERED:
      handler.cleanup_sms_delivery_failure(req.body)
      .then(dlog('Sms delivery issue resolved.'))
      .catch('TODO - Sms delivery issue unresolved.')
      break;
  }
  res.end();
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
