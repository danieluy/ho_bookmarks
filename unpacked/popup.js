/////  DOM Elements & Event listeners  /////
document.addEventListener('DOMContentLoaded', function(){
  // document.getElementById('btn_test').addEventListener('click', bmark.test);
  document.getElementById('btn_upload').addEventListener('click', bmark.uploadBookmarks);
  document.getElementById('btn_download').addEventListener('click', bmark.downloadBookmarks);
});


var bmark = (function(){

  /////  Init  /////
  var g_ho_folder = null;
  var g_local_bookmarks = [];
  var g_server = 'localhost:8080';

  function init(){
    checkHoFolder();
    setServerUrl();
  }

  /////  Private Methods  /////
  function checkHoFolder(){
    //Check if H&O folder exists in the bookmarks bar
    chrome.bookmarks.search({'title': 'H&O'}, function (results){
      results = results.filter(function(result){
        return (result.parentId === '1' && result.title === 'H&O');
      });
      if(results.length === 0)//If it doesn't => create it and set it as the app's bookmark folder
        createRootFolder();
      else if(results.length === 1){//If it does => set it as the app's bookmark folder and fetch the local bookmarks
        g_ho_folder = results[0];
        getLocalBookmarks();
      }
      else{//If there is more than one => let the user know this
        message.render('Existe más de una carpeta "H&O" en la barra de marcadores', 10000);
      }
    });
  }

  function createRootFolder(cb){
    chrome.bookmarks.create({'parentId': '1', 'title': 'H&O'}, function(new_folder) {
      g_ho_folder = new_folder;
      if(cb) cb();
    });
  }

  function downloadBookmarks(){
    g_local_bookmarks = [];
    // setServerUrl();
    getBookmarks(function(server_bookmarks){
      chrome.bookmarks.removeTree(g_ho_folder.id, function(){
        createRootFolder(function(){
          createBookmarks(server_bookmarks, null);
        });
      });
    });
  }

  function getBookmarks(cb){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
      if(req.readyState === 4 && req.status === 200){
        console.log(JSON.parse(req.responseText));
        cb(JSON.parse(req.responseText));
      }
    };
    req.open('GET', 'http://' + g_server + '/read', true);
    req.send();
  }

  function uploadBookmarks(){
    // setServerUrl();
    var req = new XMLHttpRequest();   // new HttpRequest instance
    req.onreadystatechange = function(){
      if(req.readyState === 1)
        message.render('Hecho!', 0);
    };
    req.open("POST", 'http://' + g_server + "/write");
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(g_local_bookmarks));
  }

  function createBookmarks(bookmarks, folder){
    var parent_id = folder ? folder.id : g_ho_folder.id;
    bookmarks.forEach(function(bookmark){
      if(bookmark.dateGroupModified){
        chrome.bookmarks.create({'parentId': parent_id, 'title': bookmark.title}, function(new_folder) {
          createBookmarks(bookmark.children, new_folder)
        });
      }
      else {
        chrome.bookmarks.create({parentId: parent_id, title: bookmark.title, url: bookmark.url});
      }
    });
  }

  function getLocalBookmarks(){
    chrome.bookmarks.getChildren(g_ho_folder.id, function(bookmarks){
      g_local_bookmarks = bookmarks;
      bookmarks.filter(function(bookmark){
        return bookmark.dateGroupModified
      })
      .forEach(function(folder) {
        chrome.bookmarks.getChildren(folder.id, function(child_bookmarks){
          child_bookmarks.forEach(function(child_bookmark) {
            g_local_bookmarks.push(child_bookmark);
          });
        });
      });
    });
  }

  function setServerUrl(){
    storage.loadServerAddr(function(data){
      if(data.server){
        g_server = data.server;
        document.getElementById('server_url').value = g_server;
      }
      else{
        var server = document.getElementById('server_url').value;
        if(server != ''){
          g_server = server;
          storage.saveServerAddr(g_server);
        }
      }
    });
  }

  /////  Public Methods  /////
  return {
    init: init,
    uploadBookmarks: uploadBookmarks,
    downloadBookmarks: downloadBookmarks
  }
}())

var storage = (function(){
  function saveServerAddr(server) {
    chrome.storage.sync.set({'server': server}, function() {
      return;
    });
  }
  function loadServerAddr(cb) {
    chrome.storage.sync.get('server', function(data){
      cb(data.server);
    });
  }
  return{
    saveServerAddr: saveServerAddr,
    loadServerAddr: loadServerAddr
  }
}());

var message = (function (){

  var tag_info = document.createElement('p');
  tag_info.innerHTML = 'Click para cerrar';

  var display;
  document.addEventListener('DOMContentLoaded', function(){
    display = document.getElementById('display');
    display.addEventListener('click', function(){
      display.classList.remove('visible');
    });
  });

  var render = function(message, timeout){
    display.innerHTML = message;
    display.appendChild(tag_info);
    display.classList.add('visible');
    if(timeout){
      setTimeout(function(){
        display.innerHTML = '';
        display.classList.remove('visible');
      }, timeout);
    }
  }

  return{
    render: render
  }
}());

bmark.init();
