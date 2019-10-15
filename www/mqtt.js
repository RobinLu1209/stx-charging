logMessage("INFO", "mqtt");

var client = null;
var connected = false;

// called when the client connects
function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  var connectionString = context.invocationContext.host + ":" + context.invocationContext.port + context.invocationContext.path;
  connected = true;
  logMessage("INFO", "Connection Success ", "[URI: ", connectionString, ", ID: ", context.invocationContext.clientId, "]");
}


function onConnected(reconnect, uri) {
  // Once a connection has been made, make a subscription and send a message.
  connected = true;
  if (typeof(mqtt_connect_callback) == 'function') {
    logMessage("DEBUG", "Client Has now connected: [Reconnected: ", reconnect, ", URI: ", uri, "]");
    mqtt_connect_callback(reconnect, uri);
  }else {
    logMessage("INFO", "Client Has now connected: [Reconnected: ", reconnect, ", URI: ", uri, "]");
  }
}

function onFail(context) {
  logMessage("ERROR", "Failed to connect. [Error Message: ", context.errorMessage, "]");
  connected = false;
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    logMessage("INFO", "Connection Lost. [Error Message: ", responseObject.errorMessage, "]");
  }
  connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
  if (typeof(mqtt_message_callback) == 'function') {
    logMessage("DEBUG", "Message Recieved: [Topic: ", message.destinationName, ", Payload: ", message.payloadString, ", QoS: ", message.qos, ", Retained: ", message.retained, ", Duplicate: ", message.duplicate, "]");
    mqtt_message_callback(message);
  }else {
    logMessage("INFO", "Message Recieved: [Topic: ", message.destinationName, ", Payload: ", message.payloadString, ", QoS: ", message.qos, ", Retained: ", message.retained, ", Duplicate: ", message.duplicate, "]");
  }
}

function connect(hostname, port, id) {
  var clientId = id + "-" + makeid();

  client = new Paho.Client(hostname, Number(port), clientId);
  logMessage("INFO", "Connecting to Server: [Host: ", hostname, ", Port: ", port, ", ID: ", clientId, "]");

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.onConnected = onConnected;

  var options = {
    invocationContext: { host: hostname, port: port, path: "", clientId: clientId },
    timeout: 5,
    keepAliveInterval: 60,
    cleanSession: true,
    useSSL: false,
    reconnect: true,
//    options.userName = user;
//    options.password = pass;
    onSuccess: onConnect,
    onFailure: onFail
  };

  client.connect(options);
  logMessage("INFO", "Connectiong...");
}

function disconnect() {
  logMessage("INFO", "Disconnecting from Server.");
  client.disconnect();
  connected = false;
}

function publish(topic, message) {
  var qos = "0";
  var retain = false;
  logMessage("INFO", "Publishing Message: [Topic: ", topic, ", Payload: ", message, ", QoS: ", qos, ", Retain: ", retain, "]");
  message = new Paho.Message(message);
  message.destinationName = topic;
  message.qos = Number(qos);
  message.retained = retain;
  client.send(message);
}

function subscribe(topic) {
  var qos = "0";
  logMessage("INFO", "Subscribing to: [Topic: ", topic, ", QoS: ", qos, "]");
  client.subscribe(topic, { qos: Number(qos) });
}

function unsubscribe(topic) {
  logMessage("INFO", "Unsubscribing: [Topic: ", topic, "]");
  client.unsubscribe(topic, {
    onSuccess: unsubscribeSuccess,
    onFailure: unsubscribeFailure,
    invocationContext: { topic: topic }
  });
}


function unsubscribeSuccess(context) {
  logMessage("INFO", "Unsubscribed. [Topic: ", context.invocationContext.topic, "]");
}

function unsubscribeFailure(context) {
  logMessage("ERROR", "Failed to unsubscribe. [Topic: ", context.invocationContext.topic, ", Error: ", context.errorMessage, "]");
}

// Just in case someone sends html
function safeTagsRegex(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").
    replace(/>/g, "&gt;");
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function logMessage(type, ...content) {
  var consolePre = document.getElementById("consolePre");
  var date = new Date();
  var timeString = date.toUTCString();
  var logMessage = timeString + " - " + type + " - " + content.join("");
  if (consolePre && type != "DEBUG") {
      consolePre.innerHTML = logMessage + "\n" + consolePre.innerHTML;
  }
  if (type === "INFO") {
    console.info(logMessage);
  } else if (type === "ERROR") {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
}

