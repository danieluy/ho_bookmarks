document.addEventListener('DOMContentLoaded', function(){

  document.getElementById('btn_test').addEventListener('click', test);
  document.getElementById('btn_upload').addEventListener('click', postBookmarks);
  document.getElementById('btn_download').addEventListener('click', getBookmarks(createBookmarks));
  var display = document.getElementById('display');
  var g_ho_folder = null;
  var g_current_tab = null;
  var g_local_bookmarks = [];

  function init() {
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
  }

  function getBookmarks(callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
      if(xhttp.readyState === 4 && xhttp.status === 200){
        callback(JSON.parse(xhttp.responseText), null);
      }
    };
    xhttp.open('GET', 'http://localhost:8080/read', true);
    xhttp.send();
  }
  //hacer que cree la carpeta cuando la recive!!!!!!!!!!!!!!!!!!!!!!
  //ver por qué no existe g_ho_folder
  function createBookmarks(bookmarks, folder){
    var parent_id = folder ? folder.id : g_ho_folder.id;
    bookmarks.forEach(function(bookmark){
      if(bookmark.dateGroupModified)
        newBookmark(parent_id, bookmark.title, bookmark.url);
      else {
        createBookmarks(bookmark.children, bookmark);
      }
    });
  }

  function postBookmarks(){
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://localhost:8080/write");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(g_local_bookmarks));
  }

  function newBookmark(parentId, title, url){
    chrome.bookmarks.create(
      {
        parentId: parentId || g_ho_folder.id,
        title: title,
        url: url
      }, function(result){
        g_local_bookmarks.push(result);
      }
    )
  }

  function getLocalBookmarks(){
    chrome.bookmarks.getChildren(g_ho_folder.id, function(bookmarks){

      g_local_bookmarks = bookmarks;

      var folders = bookmarks
      .filter(function(bookmark){
        return bookmark.dateGroupModified
      });

      for (var i = 0; i < folders.length; i++) {
        chrome.bookmarks.getChildren(folders[i].id, function(child_bookmarks){
          for (var j = 0; j < child_bookmarks.length; j++) {
            g_local_bookmarks.push(child_bookmarks[j]);
          }
        });
      }

    });
  }

  function test(){
    postBookmarks();
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

  init();

});
