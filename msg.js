module.exports = {
    help_menu:  'HELP MENU' +
                '\nThis automated service is used to connect service providers and receivers. ' +
                '\n\nRECEIVERS ' +
                '\nReply "1" to connect with a service provider now. ' +
                '\nReply "0" to cancel a previous request to meet with a service provider. ' +
                '\n\nPROVIDERS ' +
                '\nReply "!subscribe" to subscribe to the list of service providers. ' +
                'Note that your subscription request will have to be verified by an admin.' +
                '\nReply "!unsubscribe" to unsubscribe from the list of service providers. ' +
                '\n\nPressing anything else will just display this help menu. ',
    cancel_service_request_success: 'Your request has been cancelled.',
    cancel_service_request_fail: 'No pending service request found for this number.',
    service_request_started:  'SERVICE REQUEST RECEIVED' +
                               '\nChecking with service providers to see who is available to meet with you.' +
                               '\n\nWhen we find someone to connect you with, we will send you a Zoom link which you can access via video or voice call.' +
                               'Please note that you can cancel your service request any time by replying "0".',
    service_request_pending:  'Service request already started. Please wait.',
    service_request_fail:  'We were not able to start your service request.',
    service_request_success:   'Carly Napelson can meet with you now. ' +
                                '\nClick the following Zoom link to start your session or use the meeting ID and password provided below.' +
                                '\nZOOM INFO HERE',
    provider_subscribed: 'You are now SUBSCRIBED as a provider.',
    provider_unsubscribed: 'You are now UNSUBSCRIBED as a provider.',
    provider_not_subscribed: 'You are not currently SUBSCRIBED as a provider',
    provider_already_subscribed: 'You are already SUBSCRIBED as a provider',
    provider_subscribe_request_pending: 'Your subscribe request is pending admin approval.',
    provider_subscribe_request_denied: 'Your request to subscribe as a provider has been denied. Contact X if you have any questions.',
    provider_status_update_available: 'You are now marked as AVAILABLE and may receive service requests.',
    provider_status_update_unavailable: 'You are now marked as UNAVAILABLE and will NOT receive service requests.',
    provider_status_update_error: 'You must be subscribed as a provider to update your status.',
    admin_only: 'Sorry, you dont have permission to use this command.',
    provider_approve_success: 'Provider approved.',
    provider_already_approved: 'Provider already approved.',
    provider_denied_success: 'Provider removed from approved list.',
    error: 'TODO - error'
}