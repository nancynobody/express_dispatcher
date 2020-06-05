// General application configs
// const app = {
//   "admin": {
//     "min": 1,
//     "max": 3
//   },
//   "providers_approved": {
//     "min": 0,
//     "max": 30
//   },
//   "providers_subscribed": {
//     "min": 0,
//     "max": 30
//   },
//   "providers_available": {
//     "min": 0,
//     "max": 30
//   },
//   "max_daily_serivce_requests": 3,
// };

const service_time = 30;
const approve_regex = /!approve\s?\+[0-9]{11}/i;
const deny_regex = /!deny\s?\+[0-9]{11}/i;

module.exports = {
  service_time
  // app,
  approve_regex,
  deny_regex,
};