// TODO - move to db + serverless
// TODO - reset service request_completed each day

// TODO (NTH) - create an email at the end of each day to let admin know who is receiving service
var admin = ['+13236173969'];
var providers_approved = ['+13236173969'];

var providers_subscribed = ['+13236173969'];
var providers_pending = [];  // providers pending approval from admin
var providers_available = ['+13236173969'];

var service_request_completed = [];  // list of list
var service_request_pending = [];

module.exports = {
    admin,
    providers_approved,
    providers_subscribed,
    providers_pending,
    providers_available,
    service_request_completed,
    service_request_pending,
}