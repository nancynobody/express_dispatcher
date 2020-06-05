const _ = require('../helpers/handler');

const msg = require('../configs/messages');
const cmd = require('../configs/commands');

const num_1 = '+13236173969'
const num_invalid_1 = '3236173969'
const num_invalid_2 = '+1 (323) 617-3969'

// TEST SERVICE REQUESTS //

// TEST SUBSCRIPTION UPDATES //

// test subscribe (already subscribed, pending approval, denied, approved )
test(`!subscribe an already subscribed number -> ${msg.provider_already_subscribed}`, () => {
    // setup database to have them in the subscribed list
    expect(_.update_subscription(num_1, cmd.SUBSCRIBE)).toBe(msg.provider_already_subscribed);
});  

// TEST AVAILABILITY UPDATES //