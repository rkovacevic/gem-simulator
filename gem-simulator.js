//////////////////////////////////////////
// 
// GEM meter simulator for Aquicore
//
// Define meters here:
//
var meters = [
	{
		host: 'xdev.aquicore.com',
		serialNumber: '99000001'
	},
	{
		host: 'xmy.aquicore.com',
		serialNumber: '99000002'
	}
];

var sendingPeriodInSec = 2;
var secondCounterIncrement = 10;
var energyChannelsIncrement = 10;
var pulseChannelsIncrement = 1;
//////////////////////////////////////////

var _ = require('underscore');
var request = require('request');

console.log('GEM Simulator started');
console.log('Meters: ');
console.log(meters);

var channelName = function(prefix, index) {
	return prefix + ((index < 9) ? '0' : '') + (index + 1);
}

var sendRequest = function(meter) {
	meter.sc += secondCounterIncrement;
	meter.energyChannels = _.map(meter.energyChannels, function(c, i) { return c + (energyChannelsIncrement * (i+1)) });
	meter.pulseChannels = _.map(meter.pulseChannels, function(c, i) { return c + (pulseChannelsIncrement * (i+1)) });
	
	var query = {
		'SN': meter.serialNumber,
		'SC': meter.sc,
		'V': '110'
	};
	_.each(meter.energyChannels, function (c, i) { query[channelName('C', i)] = c; });
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