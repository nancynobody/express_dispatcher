const sms = require('./sms');
const db = require('./tmp_db');
const dlog = require('./logger');
const msg = require('./msg');

// TODO - only allow X subscribers at a time
// TODO - limit the # of service requests per phone num in a specific timeframe

class Handler {

  isin(item, list) {  // checks if item is in list
    const index = list.indexOf(item);
    if (index > -1) {
      return index;
    } else {
      return false;
    }
  }

  add(item, list) {  // adds item to list without duplicating
    if (!this.isin(item, list)) {
      list.push(item);
      return list.length;
    } else {
      dlog(`item (${item}) already in list`);
      return true;
    }
  }

  rmv(item, list) {  // removes item from list if exists
    let idx = this.isin(item, list);
    if (typeof(idx) == "number") {
      list.splice(idx, 1);
      return true;
    } else {
      dlog(`item (${item}) not in list`);
      return false;
    }
  }

  getRandom(list) {  // return random item from list
    let res = list[Math.floor(Math.random()*list.length)];
    return res;
  }

  // DB Modifiers (Getters, Isins, Adders, Removers) //
  get_admin() { return db.admin; }
  
  get_providers_approved() { return db.providers_approved; }
  
  get_providers_subscribed() { return db.providers_subscribed; }
  
  get_providers_pending() { return db.providers_pending; }
  
  get_providers_available() { return db.providers_available; }
  
  // HANDLE SERVICE REQUESTERS //
  start_service_request(num) {
    let res = this.add(num, db.service_request_pending)
    
    let provider = this.getRandom(db.providers_available);
    dlog(`Creating zoom meeting for provider (${provider}) and receiver (${num})`);
    
    let zoom_invite = 'Join Zoom Meeting' +
                      '\n\nhttps://us04web.zoom.us/j/' + 
                      process.env.ZOOM_ID + '?pwd=' + process.env.ZOOM_PASS + 
                      '\n\nMeeting ID:' + process.env.ZOOM_ID + '\nPassword: ' + process.env.ZOOM_PASS;

    dlog(`Sending zoom invite to provider (${provider}) and receiver (${num})`);
    // TODO - send zoom invite

    res = res && this.rmv(num, db.service_request_pending);
    res = res && this.add((provider, num), db.service_request_approved);
    return res;

    // TODO - return false if error creating zoom, etc
  }

  is_pending_service_request(num) {
    let res = this.isin(num, db.service_request_pending);
    return res;
  }

  cancel_service_request(num) {
    let res = this.rmv(num, db.service_request_pending);
    return res;
  }

  // HANDLE SERVICE PROVIDERS (ie SUBSCRIBERS) //
  is_subscribed(num) {
    dlog(`Checking for ${num} in subscribers list: ${db.providers_subscribed}`);
    if (this.isin(num, db.providers_subscribed) === false) { return false; } 
    else { return true; }
  }

  is_approved(num) {
    dlog(`Checking for ${num} in approved list: ${db.providers_approved}`);
    if (this.isin(num, db.providers_approved) === false) { return false; } 
    else { return true; }
  }

  add_subscriber(num) {
    let res = this.add(num, db.providers_subscribed);
    return res;
  }

  remove_subscriber(num) {
    let res = this.rmv(num, db.providers_subscribed);
    return res;
  }

  is_available(num) {
    let res = this.isin(num, db.providers_available);
    return res;
  }

  update_subscriber_status(num, status) {
    dlog(`Updating status to ${status}`)
    let idx = this.is_available(num);
    if (status === 1) {
      this.add(num, db.providers_available);
    } else if (status === 0) {
      this.rmv(num, db.providers_available);
    } else {
      dlog('invalid status update request');
    }
  }

  // HANDLE ADMIN //
  is_admin(num) {
    dlog(`Checking if ${num} is in admin list: ${db.admin}`);
    if (this.isin(num, db.admin) === false) { return false; } 
    else { return true; }
  }

  approve_provider(num) {
    let res = this.add(num, db.providers_approved);
    // TODO - txt them to let them know they are approved and subscribed
    return res && this.add_subscriber(num);
  }

  deny_provider(num) {
    // unapprove and unsubscribe
    dlog('Removing from approved list and unsubscribing');
    let res = this.rmv(num, db.providers_approved);
    res = res && this.rmv(num, db.providers_subscribed);
    return res;
  }

  request_admin_approval(num) {
    // TODO send msg to admin requesting to approve/deny this request
    dlog('TODO - text admin')
    return true;
  }
}

module.exports = new Handler();