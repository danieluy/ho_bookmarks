const fs = require('fs')
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

var bookmarks_data = require('./data/bookmarks.json');

app.use(bodyParser.json());

// app.GET  ////////////////////////////////////////////////////////////////////

// app.get('/', function(req, res){
//    res.send('Nothing to see here');
// });

// Access-Control-Allow-Origin: *  /////////////////////////////////////////////
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

// app.GET/API /////////////////////////////////////////////////////////////////

app.get('/read', function(req, res){
   res.json(bookmarks_data);
});

// app.get('/API/hello/:name', function(req, res){
//    res.send(
//       '<style>*{font-family: monospace}</style>' +
//       '<h1>Bienvenid@</h1>' +
//       '<h2>' + req.params.name + '</h2>');
// });
//
// app.get('/API/hello/:name/:lastname', function(req, res){
//    res.send(
//       '<style>*{font-family: monospace}</style>' +
//       '<h1>Bienvenid@</h1>' +
//       '<h2>' + req.params.name + ' ' + req.params.lastname + '</h2>');
// });

app.post('/write', function(req, res){
  console.log(req.body);
});

// 404 -------------------------------------------------------------------------
app.get('*', function(req, res){
   res.send('This is a 404 error code');
});

app.listen(8080, function(){
   console.log(
      '/////////////////////////////////////////////\n' +
      '//                                         //\n' +
      '//   Server listening on: localhost:8080   //\n' +
      '//       Press Ctrl-C to terminate         //\n' +
      '//                                         //\n' +
      '/////////////////////////////////////////////'
   );
});
