//////////////////////////////////////////
// 
// GEM meter simulator for Aquicore
//
// Define meters here:
//
var meters = [
	{
		host: 'dev.aquicore.com',
		serialNumber: '09809811'
	}
];

var sendingPeriodInSec = 10;
var secondCounterIncrement = 10;
var energyChannelsIncrement = 10;
var pulseChannelsIncrement = 1;
//////////////////////////////////////////

var _ = require('underscore');
var request = require('request');
var express = require("express");


console.log('GEM Simulator started');
console.log('Meters: ');
console.log(meters);

var sendRequest = function(meter) {
	meter.sc += secondCounterIncrement;
	meter.energyChannels = _.map(meter.energyChannels, function(c, i) { return c + (energyChannelsIncrement * (i+1)) });
	meter.pulseChannels = _.map(meter.pulseChannels, function(c, i) { return c + (pulseChannelsIncrement * (i+1)) });
	
	var query = {
		'SN': meter.serialNumber,
		'SC': meter.sc,
		'V': '110',
		'T': '0'
	};
	_.each(meter.energyChannels, function (c, i) { query['c' + (i + 1)] = c; });
	query['PL'] = meter.pulseChannels.join();

	// console.log(query);
	request.get({
		url: 'http://' + meter.host + '/GEM/',
		qs: query
	}, function (error, response, body) {
		console.log(( response == null ? 'ERROR' : response.statusCode) + " - " + meter.host + " : " + meter.serialNumber + " (SC: " + meter.sc + ")");
	});
}

var sendRequests = function() {
	_.each(meters, sendRequest);
}

_.each(meters, function(meter) {
	meter.sc = 0;
	meter.energyChannels = _.map(_.range(32), function () { return 0 });
	meter.pulseChannels = _.map(_.range(4), function() { return 0});
});

setInterval(sendRequests, sendingPeriodInSec * 1000);

// Web server

var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  response.send("Meters: " + meters);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
