var g_ho_folder = null;
var g_local_bookmarks = [];
var g_server = 'localhost:8080';

document.addEventListener('DOMContentLoaded', function(){

  var display = document.getElementById('display');
  document.getElementById('btn_test').addEventListener('click', test);
  document.getElementById('btn_upload').addEventListener('click', uploadBookmarks);
  document.getElementById('btn_download').addEventListener('click', downloadBookmarks);
  document.getElementById('btn_connect').addEventListener('click', setServerUrl);


  (function init() {
    console.log(g_server);
    chrome.bookmarks.search({'title': 'H&O'}, function (results){
      results = results.filter(function(result){
        return (result.parentId === '1' && result.title === 'H&O');
      });
      if(results.length === 0){
        chrome.bookmarks.create({'parentId': '1', 'title': 'H&O'}, function(new_folder) {
          g_ho_folder = new_folder;
          // getBookmarks(createBookmarks);
          // getLocalBookmarks();
        });
      }
      else if(results.length === 1){
        g_ho_folder = results[0];
        getLocalBookmarks();
      }
      else{
        displayMessage('Existe más de una carpeta "H&O" en la barra de marcadores', 10000);
      }
    });
    setServerUrl();
  }());

  function setServerUrl(){
    var server = document.getElementById('server_url').value;
    if(server != '') g_server = server;
  }

  function downloadBookmarks(){
    g_local_bookmarks = [];
    getBookmarks(function(server_bookmarks){
      createBookmarks(server_bookmarks, null);
    });
  }

  function getBookmarks(callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
      if(xhttp.readyState === 4 && xhttp.status === 200){
        callback(JSON.parse(xhttp.responseText));
      }
    };
    xhttp.open('GET', 'http://' + g_server + '/read', true);
    xhttp.send();
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

  function uploadBookmarks(){
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", 'http://' + g_server + "/write");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(g_local_bookmarks));
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

  function test(){
    uploadBookmarks();
    console.log('Test method was called');
  }

  function displayMessage(message, timeout){
    display.innerHTML = message;
    if(timeout){
      setTimeout(function(){
        display.innerHTML = '';
      }, timeout);
    }
  }

});
