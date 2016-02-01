// require the libraries used by the application
var iot = require('aws-iot-device-sdk');
var _ = require('lodash');
var SimCom = require('simcom').SimCom;

// connect to the AWS IoT service
var device = iot.device({
   keyPath: '/home/pi/AWSCerts/privateKey.pem',
  certPath: '/home/pi/AWSCerts/cert.pem',
    caPath: '/home/pi/AWSCerts/root.pem',
  clientId: 'rpi01',
    region: 'us-east-1'
});

// establish a serial connection to the USB to TTL serial cable
var simcom = new SimCom('/dev/ttyUSB0');

// called when the serial connection is opened
simcom.on('open', function() {
	console.log('simcom open');
});

// called when the serial connection has an error
simcom.on('error', function() {
	console.log('simcom error');
});

// executes an AT command
function executeAtCmd(atCmd) {
	// log the AT command received
	console.log('Execute AT Command: [' + atCmd + ']');
	// send the AT command to the modem
	simcom.modem.execute(atCmd).then(function(lines) {
		// log the AT command response
		console.log('AT Response', lines);
		// send the AT command response to the admin client
		sendToServer('AT Response: ' + JSON.stringify(lines));
	}, function(error) {
		// log the AT Command error
		console.error('AT Command Error', error);
		// send the AT command error to the admin client
		sendToServer('AT Command Error: ' + JSON.stringify(error));
	});
}

// send an SMS message
function sendSms(to, message) {
	console.log('Sending SMS: ' + to + ' : ' + message);
	simcom.sendSMS(to, message);	
	sendToServer('Sending SMS: ' + to + ' : ' + message);
}

// publish a message to the topic that is subscribed to by the admin client
function sendToServer(message) {
	device.publish('test/topic1', message);
}

// called on connection to the AWS IoT service 
device.on('connect', function() {
	console.log('iot: connect');
	// subscribe to the topic that is used to send commands to the remote device
	device.subscribe('test/topic2');
	// send a message to the admin client that the remote device is connected
	sendToServer('iot: connect');
});

// called when a message is received from AWS IoT
device.on('message', function(topic, payload) {
	// log the message payload
	console.log('iot: message', topic, payload.toString());
	// echo a copy of the message back to the admin client for confirmation
	sendToServer('Received: ' + payload.toString());
	// in this application messages are in JSON so parse it
	var req = JSON.parse(payload.toString());
	// check the type property to handle the message
	switch (_.get(req, 'type', null)) {
		// it's a phone related command
		case 'phone': {
			// check the cmd property to handle the message
			switch (_.get(req, 'cmd', null)) {
				// it's a phone dial command
				case 'dial': {
					// get the phone number to call
					var to = _.get(req, 'to', null);
					if (!_.isNull(to)) {
						// execute the AT command to make the phone call
						executeAtCmd('ATD' + to + ';');
					}
					break;
				}
				// it's a phone hangup command
				case 'hangup': {
					// execute the AT command to hangup the phone call
					executeAtCmd('ATH');
					break;
				}
				// it's a phone signal command
				case 'signal': {
					// execute the AT command to get the phone signal quality
					executeAtCmd('AT+CSQ');
					break;
				}
				// it's a modem battery command
				case 'battery': {
					// execute the AT command to get the battery level of the modem battery
					executeAtCmd('AT+CBC');
					break;
				}
				// it's an SMS command
				case 'sms': {
					// get the to phone number
					var to = _.get(req, 'to', null);
					// get the message text
					var message = _.get(req, 'message', null);
					if (!_.isNull(to) && !_.isNull(message)) {
						// send the SMS message
						sendSms(to, message)
					}
					break;
				}
			}
			break;
		}
		// it's a GPS related command
		case 'gps': {
			// check the cmd property to handle the message
			switch(_.get(req, 'cmd', null)) {
				// turn the GPS on
				case 'on': {
					// execute the AT command to turn GPS on
					executeAtCmd('AT+CGNSPWR=1');
					break;
				}
				// turn the GPS off
				case 'off': {
					// execute the AT command to turn GPS off
					executeAtCmd('AT+CGNSPWR=0');
					break;
				}
				// check the GPS power state
				case 'power': {
					// execute the AT command to get the GPS power state
					executeAtCmd('AT+CGNSPWR?');
					break;
				}
				// get the GPS information string
				case 'info': {
					// execute the AT command to get the GPS information string
					executeAtCmd('AT+CGNSINF');
					break;
				}
			}
			break;
		}
	}
});
