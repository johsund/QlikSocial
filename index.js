var express = require('express');
var d3 = require('d3');
var app = express();

var qsocks = require('qsocks');
var fs = require('fs');
var request = require('request');

var config = require('./public/config');

app.use(express.static('public'));

app.listen(3000, function () {
	//var config = require('./config');
  console.log('Example app listening on port 3000!');
});


function getTicket(req, res, next) {

	var r = request.defaults({
	  rejectUnauthorized: false,
	  host: config.qlik.hostname,
	  pfx: fs.readFileSync(__dirname + '\\client.pfx')
	})

	//  Authenticate whatever user you want
	var b = JSON.stringify({
	  "UserDirectory": config.qlik.userdirectory,
	  "UserId": config.qlik.username,
	  "Attributes": []
	});

//  Get ticket for user - refer to the QPS API documentation for more information on different authentication methods.
	r.post({
	  uri: 'https://sgsin-jsn1.qliktech.com:4243/qps/'+config.qlik.virtualproxy+'/ticket?xrfkey=abcdefghijklmnop',
	  body: b,
	  headers: {
		'x-qlik-xrfkey': 'abcdefghijklmnop',
		'content-type': 'application/json'
	  }
	},
	function(err, response, body) {
		if(err) //handle err;
		console.log(req);
		req.qlikTicket = JSON.parse(body)['Ticket'];
		//console.log(req.qlikTicket);
		next();
		}

	);
};	

// function removeApp(req, res, next) {
	
	// var https = require('https');
	
	// var certPath = config.qlik.certificatepath;
	
	// var app = req.query.app;
	// req.qlikTicket = (req.headers.referer.substr(req.headers.referer.length-16));
	
	// var options = {
	   // hostname: config.qlik.hostname,
	   // port: 4242,
	   // path: '/qrs/app/'+ app +'?xrfkey=abcdefghijklmnop',
	   // method: 'DELETE',
	   // headers: {
		  // 'x-qlik-xrfkey' : 'abcdefghijklmnop',
		  // 'X-Qlik-User' : 'UserDirectory= Internal; UserId= sa_repository'
	   // },
	   // key: fs.readFileSync(certPath + "client_key.pem"),
	   // cert: fs.readFileSync(certPath + "client.pem"),
	   // ca: fs.readFileSync(certPath + "root.pem")
	// };

	// https.get(options, function(res) {
	   // console.log("Got response: " + res.statusCode);
	   // res.on("data", function(chunk) {
		  // console.log("BODY: " + chunk);  
	   // });
	   // }).on('error', function(e) {
		  // console.log("Got error: " + e.message);
	// });
	
	// next();	
	
// };

app.get('/auth', getTicket, function(req, res) {
  res.redirect('/?qlikTicket=' + req.qlikTicket)
});

// app.get('/remove', removeApp, function(req, res) {
  // res.redirect('/?qlikTicket=' + req.qlikTicket);
// });