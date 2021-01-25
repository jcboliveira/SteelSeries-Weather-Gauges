
var fs = require('fs');
var chokidar = require('chokidar');
var request = require('request');
var http = require('http');

var parameterlistJSON = '/var/lib/wview/img/ramdisk/json/meteoparameterlist.txt';

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
		var parameterlistfileTxt = fs.readFileSync(parameterlistJSON);
		json = JSON.stringify(parameterlist);
	});
