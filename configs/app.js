// General application configs
// TODO (nth) - nice to have these checks in place
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
// admin approve/deny command is !approve +13236283344 (or deny keyword for deny)
const approve_deny_regex = /(!approve|!deny)\s?\+[0-9]{11}/i

module.exports = {
  service_time,
  // app,
  approve_deny_regex,
};