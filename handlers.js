const sms = require('./sms');
const db = require('./tmp_db');
const dlog = require('./logger');
const msg = require('./msg');

// TODO - only allow X subscribers at a time
// TODO - limit the # of service requests per phone num in a specific timeframe

class Handler {

  isin(item, list) {  // checks if item is in list
    // if list == undefined => throw error
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
    let res = this.add(num, db.service_request_pending);
    let provider = this.getRandom(db.providers_available);
    if (provider) {
      dlog(`Creating zoom meeting for provider (${provider}) and receiver (${num})`);
      // TODO - set 30min expiration on zoom link (host can extend as needed)
      let zoom_invite = 'Join Zoom Meeting\n\nhttps://us04web.zoom.us/j/' + 
                        process.env.ZOOM_ID + '?pwd=' + process.env.ZOOM_PASS;
      let status_notification = '\nStatus changed to UNAVAILABLE. Dont forget to make yourself available when you are done with this meeting.'
      sms.send(zoom_invite + status_notification, provider);
      sms.send(zoom_invite, num);
      this.rmv(num, db.service_request_pending);
      this.rmv(provider, db.providers_available);
      db.service_request_completed.push([provider, num, Date.now()]);
      dlog('Service Req Complete: ' + db.service_request_approved);
      return true;
    } else {
      this.rmv(num, db.service_request_pending);
      return false;
    }
  }

  has_pending_service_request(num) {
    dlog(`Looking for ${num} in ${db.service_request_pending}`);
    if (this.isin(num, db.service_request_pending) === false) {
      return false;
    } else {
      return true;
    }
  }

  has_completed_service_request(num) {
    dlog(`Looking for ${num} in ${db.service_request_completed}`);
    if (this.meeting_lookup(num) === false) {
      return false;
    } else {
      return true;
    }
  }

  cancel_service_request(num) {
    // TODO - add if (this.has_pending_service_request()) also to double check
    // TODO - remove hardcodes nums
    if (this.has_completed_service_request(num)) {
      dlog(`Completed request found`);
      let idx = this.meeting_lookup(num);
      let provider = db.service_request_completed[idx][0];
      let startTime = db.service_request_completed[idx][2];
      let currTime = Date.now();
      if (this.diff_mins(currTime, startTime) > 30) {
        dlog('You can not cancel service requests older than 30minutes');
        return false;
      } else {
        db.service_request_completed.splice(idx, 1);  // remove service from completed list
        // let provider know about the cancellation
        sms.send(`${num} just cancelled their request.`, provider)
        // TODO - expire the zoom link
        return true;
      }
    } else {
      dlog('No approved service request found.');
      return false;
    }
  }

  diff_mins(dt2, dt1) {
    let diff_ms = dt2 - dt1;
    return (((diff_ms % 86400000) % 3600000) / 60000);
  }

  diff_hours(dt2, dt1) {
    let diff_ms = dt2 - dt1;
    return Math.floor((diff_ms % 86400000) / 3600000);
  }

  diff_days(dt2, dt1) {
    let diff_ms = dt2 - dt1;
    return Math.floor(diff_ms / 86400000);
  }

  meeting_lookup(num) {
    for (var i = 0; i < db.service_request_completed.length; i++) {
      if (db.service_request_completed[i][0] == num || db.service_request_completed[i][1] == num) {
        return i;
      }
    }
    return false;
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

  is_available(num) {
    let res = this.isin(num, db.providers_available);
    return res;
  }

  add_subscriber(num) {
    let res = this.add(num, db.providers_subscribed);
    return res;
  }

  remove_subscriber(num) {
    let res = this.rmv(num, db.providers_available);
    res = res && this.rmv(num, db.providers_subscribed);
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
    res = res && this.add_subscriber(num);
    sms.send('You have been approved and subscribed', num);
    return res
  }

  deny_provider(num) {
    dlog('Removing from approved list and unsubscribing');
    let res = this.rmv(num, db.providers_approved);
    res = res && this.rmv(num, db.providers_subscribed);
    sms.send('Your subscribe request was denied.', num);
    return res;
  }

  request_admin_approval(num) {
    let res = null;
    for (var i = 0; i < db.admin.length; i++) {
      res = sms.send(`${num} is requesting approval to subscribe.\nReply !approve ${num}\nor\n!deny${num}`, db.admin[i])
    }
    return res;
  }
}

module.exports = new Handler();