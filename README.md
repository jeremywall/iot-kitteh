# iot-kitteh
An AWS IoT connected vest for cats with GPS and cellular capabilities.

## Commands
Here are the commands that can be sent from an MQTT client like MQTT.fx to instruct the iot-kitteh application to perform certain tasks.

### Make a phone call
```javascript
{"type":"phone", "cmd":"dial", "to":"5551234567"}
```

### Hangup the current phone call
```javascript
{"type":"phone", "cmd":"hangup"}
```

### Get the cellular signal quality
```javascript
{"type":"phone", "cmd":"signal"}
```

### Get the modem battery level
```javascript
{"type":"phone", "cmd":"battery"}
```

### Send a text message
```javascript
{"type":"phone", "cmd":"sms", "to":"5551234567", "message":"hi there"}
```

### Turn GPS on
```javascript
{"type":"gps", "cmd":"on"}
```

### Turn GPS off
```javascript
{"type":"gps", "cmd":"off"}
```

### Get the current GPS power state
```javascript
{"type":"gps", "cmd":"power"}
```

### Get the latest GPS information string
```javascript
{"type":"gps", "cmd":"info"}
```
