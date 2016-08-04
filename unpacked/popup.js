/////  Event listeners  /////
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById('btn_test').addEventListener('click', bmark.test);
  document.getElementById('btn_upload').addEventListener('click', bmark.uploadBookmarks);
  document.getElementById('btn_download').addEventListener('click', bmark.downloadBookmarks);
});


var bmark = (function(){

  /////  Init  /////
  var g_ho_folder = null;
  var g_local_bookmarks = [];
  var g_server = 'localhost:8080';
  var display = document.getElementById('display');
  //Check if H&O folder exists in the bookmarks bar
  chrome.bookmarks.search({'title': 'H&O'}, function (results){
    results = results.filter(function(result){
      return (result.parentId === '1' && result.title === 'H&O');
    });
    if(results.length === 0){//If it doesn't => create it and set it as the app's bookmark folder
      chrome.bookmarks.create({'parentId': '1', 'title': 'H&O'}, function(new_folder) {
        g_ho_folder = new_folder;
      });
    }
    else if(results.length === 1){//If it does => set it as the app's bookmark folder and fetch the local bookmarks
      g_ho_folder = results[0];
      getLocalBookmarks();
    }
    else{//If there is more than one => let the user know this
      displayMessage('Existe más de una carpeta "H&O" en la barra de marcadores', 10000);
    }
  });

  /////  Private Methods  /////
  function downloadBookmarks(){
    g_local_bookmarks = [];
    setServerUrl();
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

  function uploadBookmarks(){
    setServerUrl();
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", 'http://' + g_server + "/write");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(g_local_bookmarks));
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
    var server = document.getElementById('server_url').value;
    if(server != '') g_server = server;
    console.log(g_server);
  }

  function displayMessage(message, timeout){
    display.innerHTML = message;
    if(timeout){
      setTimeout(function(){
        display.innerHTML = '';
      }, timeout);
    }
  }

  /////  Public Methods  /////
  return {
    test: test,
    uploadBookmarks: uploadBookmarks,
    downloadBookmarks: downloadBookmarks
  }
}())
