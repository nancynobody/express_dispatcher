require('dotenv').config();
const db = require('../helpers/db')
const sms = require('../helpers/sms')

const utils = require('../utils/_');
const configs = require('../config/_');

const msg = configs.msg;
const cmd = configs.cmd;

const logger = configs.winston;

// TODO (consider) - only allow X subscribers at a time?
// TODO (consider) - limit the # of service requests per phone num in a specific timeframe?

class Handler {
  
  // HANDLE SERVICE REQUESTS //
  service_request(num, body) {
    if (body == cmd.START_SERVICE_REQ) {
      return this.start_service_request(num);
    } else {
      return this.cancel_service_request(num);
    }
  }

  start_service_request(num) {
    return new Promise((resolve, reject) => {
      if (db.has_pending_service_request(num)) {
        resolve(msg.pending_service_req_found);
      } else if (db.has_completed_service_request(num)) {
        resolve(msg.completed_service_req_found);
      } else {
        utils.lists.add(num, db.service_request_pending);
        let provider = utils.lists.get_random(db.providers_available);
        if (provider) {
          logger.info(`Creating zoom meeting for provider (${provider}) and receiver (${num})`);
          // TODO (consider) - set 30min expiration on zoom link (host can extend as needed)
          let zoom_invite = 'Join Zoom Meeting\n\nhttps://us04web.zoom.us/j/' + 
                            process.env.ZOOM_ID + '?pwd=' + process.env.ZOOM_PASS;
          let status_notification = '\nStatus changed to UNAVAILABLE. Dont forget to make yourself available when you are done with this meeting.';

          let send_provider = sms.send(zoom_invite + status_notification, provider)
                              .then(() => {
                              //  logger.info(message);
                              this.update_subscriber_status(provider, cmd.UNAVAILABLE);
                              });
            
          let send_requester = sms.send(zoom_invite, num)
                              .then(() => {
                                //  logger.info(message);
                                this.rmv(num, db.service_request_pending)
                                });

          Promise.all([send_provider, send_requester])
          .then(() => {
            db.service_request_completed.push([provider, num, Date.now()]);
            logger.info('Service Req Complete: ' + db.service_request_completed);
            resolve(msg.service_request_success);
          })
          .catch((error) => {
            logger.error(`Failed to start service request: ${error}`);
            utils.lists.rmv(provider, db.service_request_pending);
            utils.lists.rmv(num, db.service_request_pending);
            logger.info(`Removed ${provider} and ${num} from pending service requests: ${db.service_request_pending}`);
            // TODO - text admin to notify them perhaps?
            this.update_subscriber_status(provider, cmd.AVAILABLE);
            // TODO - text provider to let them know
            reject('Unable to send SMS request to API.');
          });
        } else {
          utils.lists.rmv(num, db.service_request_pending);
          resolve(msg.no_providers_available);
        }
      }
    });
  }

  cancel_service_request(num) {
    return new Promise((resolve, reject) => {
      if (db.has_pending_service_request(num)) {
        resolve(msg.pending_service_req_found);
      // } else if (db.has_completed_service_request(num)) {
      //   resolve(msg.completed_service_req_found);
      } else {
        let idx = db.meeting_lookup(num)
        if (idx) {
          logger.info(`Completed request found: ${db.service_request_completed[idx]}`);
          let provider = db.service_request_completed[idx][0]; // TODO (imp) - rmv magic nums
          let startTime = db.service_request_completed[idx][2];
          let diff = utils.date_diffs.diff_mins(Date.now(), startTime);
          logger.info(`Minutes since start of service request: ${diff}`);
          if (diff > 30) {  // service request too old to cancel
            resolve(msg.cancel_service_request_too_old + configs.app.service_time);
          } else {  // cancelling
            db.service_request_completed.splice(idx, 1);
            sms.send(`${num} just cancelled their request.`, provider)
            .catch((error) => {
              reject(error);
            });
            // TODO (consider) - expiring the zoom link?
            resolve(msg.canceL_service_request_success);
          }
        } else {
          resolve(msg.completed_service_req_not_found);
        }
      }
    });
  }

  // HANDLE SERVICE PROVIDERS (ie SUBSCRIBERS) //
  update_subscription(num, body) {
    if (body == cmd.SUBSCRIBE) {
      return this.handle_subscribe_request(num);
    } else if (body == cmd.UNSUBSCRIBE) {
      return this.handle_unsubscribe_request(num);
    } else {
      throw new Error(`invalid command: ${body}`);
    }
  }

  handle_subscribe_request(num) {
    return new Promise((resolve, reject) => {
      if (db.is_subscribed(num)) {
        resolve(msg.provider_already_subscribed);
      } else {
        if (db.is_approved(num)) {
          db.add_subscriber(num);
          resolve(msg.provider_subscribed);
        } else {
          handler.request_admin_approval(frm_num);  // TOOD (fix) - silent error potential
          resolve(msg.provider_subscribe_request_pending);
        }
      }
    });
  }

  handle_unsubscribe_request(num) {
    return new Promise((resolve, reject) => {
      if (db.is_subscribed(num)) {
        db.remove_subscriber(num);
        resolve(msg.provider_unsubscribed);
      } else {
        resolve(msg.provider_not_subscribed);
      }
    });
  }

  update_availability(num, status) {
    return new Promise((resolve, reject) => {
      if (db.is_subscribed(num)) {
        if (status === cmd.AVAILABLE) {
          utils.lists.add(num, db.providers_available);
        } else if (status === cmd.UNAVAILABLE) {
          utils.lists.rmv(num, db.providers_available);
        }
        resolve(msg.availability_updated);
      } else {
        resolve(msg.availability_update_fail);
      }
    });
  }

  // HANDLE ADMIN //
  respond_to_subscribtion_request(num, body) {
    return new Promise((resolve, reject) => {
      resolve('TODO')
    });
    // if ((m = approve_regex.exec(req.body.Body.toLowerCase())) !== null) {  // approve a provider (ADMIN ONLY)
    //   let num = null;
    //   m.forEach((match, groupIndex) => {
    //     logger.info(`Matched APPROVE cmd - group ${groupIndex}: ${match}`);
    //     num = '+' + match.split('+')[1];
    //   });
    //   logger.info(`Provider number is: ${num}`);
    //   if (handler.is_admin(frm_num)) {
    //     logger.info(`Source (${frm_num}) is admin`);
    //     if (handler.is_approved(num)) {
    //       logger.info(msg.provider_already_approved); 
    //       msg_response.message(msg.provider_already_approved); 
    //     } else {
    //       handler.approve_provider(num);
    //       logger.info(msg.provider_approve_success);
    //       msg_response.message(msg.provider_approve_success);
    //     }
    //   } else {
    //     logger.info(msg.admin_only);
    //     msg_response.message(msg.admin_only);
    //   }

    // if ((m = deny_regex.exec(req.body.Body.toLowerCase())) !== null) {  // deny a provider (ADMIN ONLY)
    //   let num = null;
    //   m.forEach((match, groupIndex) => {
    //     logger.info(`Matched DENY cmd - group ${groupIndex}: ${match}`);
    //     num = '+' + match.split('+')[1];
    //   });
    //   if (handler.is_admin(frm_num)) {
    //     logger.info(`Source (${frm_num}) is admin`);
    //     if (handler.deny_provider(num)) {
    //       msg_response.message(msg.provider_denied_success);
    //     } else {
    //       logger.info(`There was an issue denying provider ${num}.`);
    //     }
    //   } else {
    //     logger.info(msg.admin_only);
    //     msg_response.message(msg.admin_only);
    //   }
  }

  handle_show_db(num) {
    // TODO - consider only allowing !showall cmd in debug/dev env?
    return new Promise((resolve, reject) => {
      if (db.is_admin(num)) {
        let str = 'Admin:' + db.admin +
                  '\nProviders Approved: ' + db.providers_approved +
                  '\nProviders Subscribed: ' + db.providers_subscribed +
                  '\nProviders Pending: ' + db.providers_pending +
                  '\nProviders Available: ' + db.providers_available;
        resolve(str);
      } else {
        resolve(msg.admin_only);
      }
    });
  }

  approve_provider(num) {
    let res = utils.lists.add(num, db.providers_approved);
    res = res && db.add_subscriber(num);
    sms.send('You have been approved and subscribed', num)
    .catch((error) => {
      logger.error(`Unable to make API request to notify provider: ${error}`);
    });
    return res
  }

  deny_provider(num) {
    logger.info('Removing from approved list and unsubscribing');
    let res = utils.lists.rmv(num, db.providers_approved);
    res = res && utils.lists.rmv(num, db.providers_subscribed);
    sms.send('Your subscribe request was denied.', num)
    .catch((error) => {
      logger.error(`Unable to make API request to notify provider: ${error}`);
    });
    return res;
  }

  request_admin_approval(num) {
    for (var i = 0; i < db.admin.length; i++) {
      sms.send(`${num} is requesting approval to subscribe.\nReply !approve ${num}\nor\n!deny${num}`, db.admin[i])
      .catch((error) => {
        logger.error(`Unable to make API request to request_admin_approval: ${error}`);
      });
    }
  }

  // SMS FAILURE CLEANUP //
  cleanup_sms_delivery_failure(status) {
    // TODO
    // If a message can't be delivered check all lists and remove the number from the list
    // also let provider know if client had a delivery problem
    // let admin know about the failure?
    logger.info(JSON.stringify(status, null, 2));
  }
}

module.exports = new Handler();