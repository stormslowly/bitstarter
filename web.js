var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  fs.readFile('./index.html', function (err, data) {
  var str
  if (err) str = "Server error";
  str = data.toString();
  response.send(str);
});
  
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});