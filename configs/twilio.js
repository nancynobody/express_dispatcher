const msg_status = {
    'QUEUED': 'queued',  // API request to send a message was successful and the message is queued to be sent out
    'SENT': 'sent',  // The nearest upstream carrier accepted the message
    'FAILED': 'failed',  // The message could not be sent
    'DELIVERED': 'delivered',  // Twilio has received confirmation of message delivery from the upstream carrier
    'UNDELIVERED': 'undelivered',  // Twilio has received a delivery receipt indicating that the message was not delivered
};

module.exports = msg_status;