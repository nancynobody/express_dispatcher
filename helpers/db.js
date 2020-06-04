const utils = require('../utils/_');
const logger = require('../config/winston');

// TODO (consider) - migrate to an actual db (or serverless persistant storage)?
// TODO (consider) - reset service request_completed each day
// TODO (consider) - reset providers each week (fish out old or unused numbers)
// TODO (consider) - create an email at the end of each day to let admin know who is receiving service

var admin = ['+13236173969'];
var providers_approved = ['+13236173969'];

var providers_subscribed = ['+13236173969'];
var providers_pending = [];  // providers pending approval from admin
var providers_available = ['+13236173969'];

var service_request_completed = [];  // list of list
var service_request_pending = [];

// DB Modifiers (Isins, Adders, Removers) //

function is_subscribed(num) {
  logger.info(`Checking for ${num} in subscribers list: ${providers_subscribed}`);
  if (utils.lists.isin(num, providers_subscribed) === false) { return false; } 
  else { return true; }
}

function is_approved(num) {
  logger.info(`Checking for ${num} in approved list: ${providers_approved}`);
  if (utils.lists.isin(num, providers_approved) === false) { return false; } 
  else { return true; }
}

function is_available(num) {
  let res = utils.lists.isin(num, providers_available);
  return res;
}

function add_subscriber(num) {
  let res = utils.lists.add(num, providers_subscribed);
  return res;
  }

function remove_subscriber(num) {
  let res = utils.lists.rmv(num, providers_available);
  res = res && utils.lists.rmv(num, providers_subscribed);
  return res;
}

function is_admin(num) {
  logger.info(`Checking if ${num} is in admin list: ${admin}`);
  if (utils.lists.isin(num, admin) === false) { return false; } 
  else { return true; }
}

function meeting_lookup(num) {
  for (let i = 0; i < service_request_completed.length; i++) {
    if (service_request_completed[i][0] == num || service_request_completed[i][1] == num) {
      return i;
    }
  }
  return false;
}

function has_pending_service_request(num) {
  logger.info(`Looking for ${num} in pending service requests: ${service_request_pending}`);
  if (utils.lists.isin(num, service_request_pending) === false) {
    return false;
  } else {
    return true;
  }
}

function has_completed_service_request(num) {
  logger.info(`Looking for ${num} in completed service requests: ${service_request_completed}`);
  if (meeting_lookup(num) === false) {
    return false;
  } else {
    return true;
  }
}

module.exports = {
    admin,
    providers_approved,
    providers_subscribed,
    providers_pending,
    providers_available,
    service_request_completed,
    service_request_pending,
    is_subscribed,
    is_approved,
    is_available,
    add_subscriber,
    remove_subscriber,
    is_admin,
    meeting_lookup,
    has_completed_service_request,
    has_pending_service_request,
}