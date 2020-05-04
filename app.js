const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const dlog = require('./logger');
const handler = require('./handlers');
const msg = require('./msg');

const app = express();

const approve_regex = /!approve\s?\+[0-9]{11}/i;
const deny_regex = /!deny\s?\+[0-9]{11}/i;
var m = null;

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));

// TODO - only all !showall cmd in debug/dev env
// TODO - Add error handling
// TODO - Add async smss

// Incoming sms messages (webhook via ngrok)
app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  // TODO - if frm_num == undefined => throw error
  let frm_num = req.body.From

  if (req.body.Body == '0') {  // 0 - cancel service request
    dlog('Service cancellation requested.');
    if (handler.cancel_service_request(frm_num)) {
      dlog(msg.cancel_service_request_success);
      twiml.message(msg.cancel_service_request_success);
    } else {
      dlog(msg.cancel_service_request_fail)
      twiml.message(msg.cancel_service_request_fail);
    }
  } else if (req.body.Body == '1') {  // 1 - start service request
    if (handler.has_pending_service_request(frm_num)) {
      dlog(`${frm_num} already has pending service request.`);
    } else if (handler.has_completed_service_request(frm_num)) {
      dlog(`${frm_num} already has approved/active service request.`);
    } else {
      if (handler.start_service_request(frm_num)) {
        dlog('Service request successfully completed.');
      } else {
        dlog(msg.service_request_fail);
        twiml.message(msg.service_request_fail);
      }
    }
  } else if (req.body.Body.toLowerCase() == '!showall') {  // show db
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
  } else if (req.body.Body.toLowerCase() == '!subscribe') {  // subscribe as a provider
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
  } else if (req.body.Body.toLowerCase() == '!unsubscribe') {  // unsubscribe as a provider
    if (handler.is_subscribed(frm_num)) {
      handler.remove_subscriber(frm_num);
      dlog(msg.provider_unsubscribed);
      twiml.message(msg.provider_unsubscribed);
    } else {
      dlog(msg.provider_not_subscribed);
      twiml.message(msg.provider_not_unsubscribed);
    }
  } else if (req.body.Body.toLowerCase() == '!available') {  // update subscriber status to AVAILABLE
    if (handler.is_subscribed(frm_num)) {
      handler.update_subscriber_status(frm_num, 1);
      twiml.message(msg.provider_status_update_available);
    } else {
      dlog(msg.provider_status_update_error);
      twiml.message(msg.provider_status_update_error);
    }
  } else if (req.body.Body.toLowerCase() == '!unavailable') {  // update subscriber status to UNAVAILABLE
    if (handler.is_subscribed(frm_num)) {
      handler.update_subscriber_status(frm_num, 0);
      twiml.message(msg.provider_status_update_unavailable);
    } else {
      dlog(provider_status_update_error);
      twiml.message(msg.provider_status_update_error);
    }
  } else if ((m = approve_regex.exec(req.body.Body.toLowerCase())) !== null) {  // approve a provider (ADMIN ONLY)
    let num = null;
    m.forEach((match, groupIndex) => {
      dlog(`Matched APPROVE cmd - group ${groupIndex}: ${match}`);
      num = '+' + match.split('+')[1];
    });
    dlog(`Provider number is: ${num}`);
    if (handler.is_admin(frm_num)) {
      dlog(`Source (${frm_num}) is admin`);
      if (handler.is_approved(num)) {
        dlog(msg.provider_already_approved); 
        twiml.message(msg.provider_already_approved); 
      } else {
        handler.approve_provider(num);
        dlog(msg.provider_approve_success);
        twiml.message(msg.provider_approve_success);
      }
    } else {
      dlog(msg.admin_only);
      twiml.message(msg.admin_only);
    }
  } else if ((m = deny_regex.exec(req.body.Body.toLowerCase())) !== null) {  // deny a provider (ADMIN ONLY)
    let num = null;
    m.forEach((match, groupIndex) => {
      dlog(`Matched DENY cmd - group ${groupIndex}: ${match}`);
      num = '+' + match.split('+')[1];
    });
    if (handler.is_admin(frm_num)) {
      dlog(`Source (${frm_num}) is admin`);
      if (handler.deny_provider(num)) {
        twiml.message(msg.provider_denied_success);
      } else {
        dlog(`There was an issue denying provider ${num}.`);
      }
    } else {
      dlog(msg.admin_only);
      twiml.message(msg.admin_only);
    }
  } else {  // display help menu for anything else
    dlog(msg.help_menu);
    twiml.message(msg.help_menu);
  }
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
