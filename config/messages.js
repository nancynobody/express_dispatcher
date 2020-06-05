// Auto-reply messages
const messages = {
    help_menu:  'HELP MENU' +
                '\nThis automated service is used to connect service providers and receivers. ' +
                '\n\nRECEIVERS ' +
                '\nReply "1" to connect with a service provider now. ' +
                '\nReply "0" to cancel a previous request to meet with a service provider. ' +
                '\n\nPROVIDERS ' +
                '\nReply "!subscribe" to subscribe to the list of service providers. ' +
                'Note that your subscription request will have to be verified by an admin.' +
                '\nReply "!unsubscribe" to unsubscribe from the list of service providers. ' +
                '\n\nPressing anything else will just display this help menu. ' +
                '\n\nCall or text the admin for feeback, help or other inquiries at 555-555-5555',
    // cancel_service_request_success: 'Your request has been cancelled and the provider notified.',
    pending_service_req_found: 'This number already has a pending service request.',
    completed_service_req_found: 'This number already has a completed service request.',
    completed_service_req_not_found: 'This number doesnt have any completed service requests.',
    no_providers_available: 'Sorry, all providers are currently unavailable. Please try again later.',
    service_request_success: 'Service request started successfully.',
    canceL_service_request_success: 'Service request cancelled successfully.',
    cancel_service_request_too_old: 'You cant cancel service requests older than:',
    availability_updated: 'Availability updated.',
    availability_update_error: 'You must be subscribed as a provider to update your availability.',
    provider_subscribed: 'You are now SUBSCRIBED as a provider.',
    provider_unsubscribed: 'You are now UNSUBSCRIBED as a provider.',
    provider_not_subscribed: 'You are not currently SUBSCRIBED as a provider',
    provider_already_subscribed: 'You are already SUBSCRIBED as a provider',
    provider_subscribe_request_pending: 'Your subscribe request is pending admin approval.',
    provider_subscribe_request_denied: 'Your request to subscribe as a provider has been denied. Contact X if you have any questions.',
    provider_status_update_available: 'You are now marked as AVAILABLE and may receive service requests.',
    provider_status_update_unavailable: 'You are now marked as UNAVAILABLE and will NOT receive service requests.',
    admin_only: 'Sorry, you dont have permission to use this command.',
    provider_approve_success: 'Provider approved.',
    provider_already_approved: 'Provider already approved.',
    provider_denied_success: 'Provider removed from approved list.',
    error: 'Sorry...we are experiencing difficulties. This issue has been reported and is being evaluated. Thank you for your patience.'
  };

  module.exports = messages;