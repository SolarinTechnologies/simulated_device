'use strict';
const chalk = require('chalk');
var connectionString = 'HostName=STIotHub43.azure-devices.net;DeviceId=MyNodeDevice;SharedAccessKey=RycOSmNNP3tCZ2TidEwU4RGpBUAyTqDBrJBReo0HlKg=';
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);
var intervalLoop = null;
function onSetTelemetryInterval(request, response) {
  function directMethodResponse(err) {
    if(err) {
      console.error(chalk.red('An error ocurred when sending a method response:\n' + err.toString()));
    } else {
        console.log(chalk.green('Response to method \'' + request.methodName + '\' sent successfully.' ));
    }
  }
  console.log(chalk.green('Direct method payload received:'));
  console.log(chalk.green(request.payload));
  if (isNaN(request.payload)) {
    console.log(chalk.red('Invalid interval response received in payload'));
    response.send(400, 'Invalid direct method parameter: ' + request.payload, directMethodResponse);

  } else {
    clearInterval(intervalLoop);
    intervalLoop = setInterval(sendMessage, request.payload * 1000);
    response.send(200, 'Telemetry interval set: ' + request.payload, directMethodResponse);
  }
}
function sendMessage(){
  var visible = 20 + (Math.random() * 15);
  var ultraviolet = 20 + (Math.random() * 15);
  var infrared = 20 + (Math.random() * 15);
  var message = new Message(JSON.stringify({
    visible: visible,
    ultraviolet: ultraviolet,
    infrared: infrared,
  }));
  message.properties.add('UV Alert', (ultraviolet > 30) ? 'true' : 'false');
  console.log('Sending message: ' + message.getData());
  client.sendEvent(message, function (err) {
    if (err) {
      console.error('send error: ' + err.toString());
    } else {
      console.log('message sent');
    }
  });
}
client.onDeviceMethod('SetTelemetryInterval', onSetTelemetryInterval);
sendMessage();
intervalLoop = setInterval(sendMessage, 3000);
