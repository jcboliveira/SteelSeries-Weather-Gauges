
var fs = require('fs');
var chokidar = require('chokidar');
var request = require('request');
var http = require('http');

var parameterlistJSON = '/var/lib/wview/img/ramdisk/json/meteoparameterlist.txt';
var realtimeparameterlistJSON = '/var/lib/wview/img/ramdisk/json/realtimeparameterlist.txt';

var json

http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end(json);
}).listen(8086, '127.0.0.1');
	
chokidar.watch([realtimeparameterlistJSON], {
	usePolling: true,
	interval: 1000
})
	.on('change', (path) => {
				var realtimeparameterlistfileTxt = fs.readFileSync(realtimeparameterlistJSON);
				var parameterlistfileTxt = fs.readFileSync(parameterlistJSON);
				realtimeparameterlist = JSON.parse(realtimeparameterlistfileTxt);
				parameterlist = JSON.parse(parameterlistfileTxt);
				parameterlist.outsideTemp=realtimeparameterlist.outsideTemp;
				parameterlist.hiOutsideTemp=realtimeparameterlist.hiOutsideTemp;
				parameterlist.lowOutsideTemp=realtimeparameterlist.lowOutsideTemp;
				parameterlist.outsideDewPt=realtimeparameterlist.outsideDewPt;
				parameterlist.hiDewpoint=realtimeparameterlist.hiDewpoint;
				parameterlist.lowDewpoint=realtimeparameterlist.lowDewpoint;
				parameterlist.extraTemp1=realtimeparameterlist.extraTemp1;
				parameterlist.hiOutsideATemp=realtimeparameterlist.hiOutsideATemp;
				parameterlist.lowOutsideATemp=realtimeparameterlist.lowOutsideATemp;
				parameterlist.dailyRain=realtimeparameterlist.dailyRain;
				parameterlist.rainRate=realtimeparameterlist.rainRate;
				parameterlist.hiRainRate=realtimeparameterlist.hiRainRate;
				parameterlist.stormRain=realtimeparameterlist.stormRain;
				parameterlist.stormStart=realtimeparameterlist.stormStart;
				parameterlist.outsideHumidity=realtimeparameterlist.outsideHumidity;
				parameterlist.hiHumidity=realtimeparameterlist.hiHumidity;
				parameterlist.lowHumidity=realtimeparameterlist.lowHumidity;
				parameterlist.barometer=realtimeparameterlist.barometer;
				parameterlist.hiBarometer=realtimeparameterlist.hiBarometer;
				parameterlist.lowBarometer=realtimeparameterlist.lowBarometer;
				parameterlist.windSpeed=realtimeparameterlist.windSpeed;
				parameterlist.windGustSpeed=realtimeparameterlist.windGustSpeed;
				parameterlist.hiWindSpeed=realtimeparameterlist.hiWindSpeed;
				parameterlist.windDirectionDegrees=realtimeparameterlist.windDirectionDegrees;
				parameterlist.windGustDirectionDegrees=realtimeparameterlist.windGustDirectionDegrees;
				parameterlist.ET=realtimeparameterlist.ET;
				parameterlist.UV=realtimeparameterlist.UV;
				parameterlist.hiUV=realtimeparameterlist.hiUV;
				parameterlist.solarRad=realtimeparameterlist.solarRad;
				parameterlist.hiRadiation=realtimeparameterlist.hiRadiation;
				parameterlist.tenMinuteAvgWindSpeed=realtimeparameterlist.tenMinuteAvgWindSpeed;
				parameterlist.tenMinuteWindGust=realtimeparameterlist.tenMinuteWindGust;
				parameterlist.twoMinuteAvgWindSpeed=realtimeparameterlist.twoMinuteAvgWindSpeed;
				parameterlist.WinddirtenMinuteWindGust=realtimeparameterlist.WinddirtenMinuteWindGust;
				json = JSON.stringify(parameterlist);
	});
