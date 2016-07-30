'use strict'

const fs = require('fs')
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

// var bookmarks_data = require('./data/bookmarks.json');

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/read', function(req, res){
  fs.readdir('./data/', (err, files) => {
    if(err) console.log(err);
    else{
      const dates = files.map((file) => parseInt(file.slice(0,-5)));
      fs.readFile(('./data/' + max(dates) + '.json'), (err, data) => {
        if(err) console.log(err);
        else{
          console.log(data.toString());
          res.json(JSON.parse(data.toString()));
        }
      });
    }
  });
});

app.post('/write', function(req, res){
  let bookmarks_tree = createBookmarksTree(req.body);
  let file_name = new Date().getTime();
  fs.writeFileSync(('./data/' + file_name + '.json'), JSON.stringify(bookmarks_tree, null, 4));
});

// 404 -------------------------------------------------------------------------
app.get('*', function(req, res){
  res.send('This is a 404 error code');
});

const createBookmarksTree = (raw_bookmarks) => {
  const root_folder = [];

  const folders = raw_bookmarks
  .filter(bookmark => bookmark.dateGroupModified)
  .map((folder) => {
    folder.children = [];
    return folder;
  })

  const bookmarks = raw_bookmarks
  .filter(bookmark => !bookmark.dateGroupModified)
  .forEach((bookmark) => {
    //change for a while loop
    let is_children = false;
    folders.forEach((folder) => {
      if(folder.id === bookmark.parentId){
        folder.children.push(bookmark);
        is_children = true;
      }
    });
    if(!is_children)
      root_folder.push(bookmark);
  });

  folders.forEach((folder) => {
    root_folder.push(folder);
  });

  return root_folder;
}

const max = (values) => {
  let max = values[0];
  for (var i = 1; i < values.length; i++) {
    if(values[i] > max) max = values[i];
  }
  return max;
}

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
