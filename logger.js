/* 
* Logging Module that prints console messages only if debug is true
*/

const debug = true;

function dlog(message) {
  if (debug) { 
    console.log('**DEBUG: ' + message);
  }
}

module.exports = dlog;