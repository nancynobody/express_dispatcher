# Express Dispatcher
A fast, minimalistic sms dispatching service using Twilio and Zoom

## How it Works
Originally created for virtual dynamic dispatching of therapists for healthcare workers during the COVID-19 Pandemic. The healthcare workers ("receivers") can request a session from a therapist ("providers") by texting "1" to a specific number and then service will find an available therapist and text each of them a Zoom link so they can have a virtual session. 

The avialability of the therapists is also maintained by the system and once subscribed (required admin approval to subscribe) they can mark themselves as available or unavailable at any time.

The code is general enough that it can be used/modified for many dispatch-like applications where there are service providers and service receivers. Feel free to use it, modify it, etc.

## Setup Instructions

### Step 1: Software Spin-up
Create a Twilio account (+number) then fork the repo and update configs to use your configs + .env file

### Step 2: Test your use case
Update the text messages / replies to suit your specific needs. 

#### Setup Admin
Provide at least one admin number. Admins are responsible for managing the providers and their number will be displayed by the help menu in case providers or receivers have trouble.

**Admin Command/Text Examples**
If you are an admin you can text any of the following "commands" to the Twilio number
| Command | Description | Example Result |
|---|---|---|
| **!showall** | Shows the current list of providers, subscribers, admin, etc. | <img src="img/showall.png" style="width:500px;"/> |
| **!approve +18505555555** | Approves the +18505555555 number as a provider| <img src="img/approve.png" style="width:500px;"/> |
| **!deny +18505555555**  | Removed the +18505555555 number from the list of approved providers | <img src="img/deny.png" style="width:500px;"/> |

#### Setup Service Providers (therapists, etc)
Service providers should text **!subscribe** to subscribe to the service. If they are not already on the admin's list of approved providers, they will have to wait for admin approval.

**Service Providers Command/Text Examples**
If you are a service provider you can text any of the following "commands" to the Twilio number
| Command | Description | Example Result |
|---|---|---|
| **!subscribe** | This will subscribe you as a service provider (Note: the admin will have to approve you)  | <img src="img/subscribe.png" style="width:500px;"/> |
| **!unsubscribe** | This will unsubscribe you as a service provider | <img src="img/unsubscribe.png" style="width:500px;"/> |
| **!available**  | This will mark you as available so you may be selected to provide your virtual/Zoom service (ie start a therapy session, etc) | <img src="img/available.png" style="width:500px;"/> |
| **!unavailable**  | This will mark you as unavailable so you will NOT be selected to provide your service. Note that you will will remain subscribed but unavilable. | <img src="img/unavailable.png" style="width:500px;"/> |

#### Setup Service Receivers (healthcare workers, etc)
Service receivers are the healthcare workers or whoever is receiving the virtual service.

**Service Providers Command/Text Examples**
If you are a service provider you can text any of the following "commands" to the Twilio number
| Command | Description | Example Result |
|---|---|---|
| **0** | This will cancel any pending service requests.  | <img src="img/cancel.png" style="width:500px;"/> |
| **1** | This will start a service request. | <img src="img/start.png" style="width:500px;"/> |

## Developer Notes

**Technologies**

* [Twilio](https://www.twilio.com/)
* [Node.js](https://nodejs.org/en/) + [Express.js](https://expressjs.com/)
* [Serverless](https://www.serverless.com/) - You can use whatever server or serverless service you want here
* [Zoom](https://zoom.us/)

### Developer Setup Instructions
*Note: You will need a paid version of Twilio for this to work because the free trail version only allows usage/verification of 1 number.*

#### Step 0: Setup Twilio
Create a Twilio account and get a Twilio nmber

#### Step 1: Setup Server

- clone the repo
- customize what you want your messages to say
- create .env file and add your Twilio credentials
- run nodejs app