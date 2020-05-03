// TODO - move to db + serverless

// TODO (NTH) - create an email at the end of each day to let admin know who is receiving service
var admin = ['+13236173969'];
var providers_approved = ['+13236173969'];

var providers_subscribed = ['+0000000000', '+0000000001'];
var providers_pending = [];
var providers_available = ['+0000000000'];

var service_request_approved = [];
var service_request_pending = [];

module.exports = {
    admin,
    providers_approved,
    providers_subscribed,
    providers_pending,
    providers_available,
    service_request_approved,
    service_request_pending,
}