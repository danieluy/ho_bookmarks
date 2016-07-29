document.addEventListener('DOMContentLoaded', function(){

  document.getElementById('btn_test').addEventListener('click', test);
  var display = document.getElementById('display');
  var ho_folder = null;
  var current_tab = null;
  var local_bookmarks = [];

  function init() {
    chrome.bookmarks.search({'title': 'H&O'}, function (results){
      results = results.filter(function(result){
        return (result.parentId === '1' && result.title === 'H&O');
      });
      if(results.length === 0){
        chrome.bookmarks.create({'parentId': '1', 'title': 'H&O'}, function(new_folder) {
          ho_folder = new_folder;
          getBookmarks(createBookmarks);
        });
      }
      else{
        ho_folder = results[0];
        syncBookmarks();
      }
    });
  }

  function syncBookmarks(){
    var ho_folder_modified = ho_folder.dateGroupModified;
    console.log(ho_folder_modified);
  }

  function getLocalBookmarks(){
    chrome.bookmarks.getChildren(ho_folder.id, function(bookmarks){
      local_bookmarks = bookmarks;
    })
  }

  function createBookmarks(bookmarks){
    local_bookmarks = [];
    for (var i = 0; i < bookmarks.length; i++) {
      createBookmark(bookmarks[i].parentId, bookmarks[i].index, bookmarks[i].title, bookmarks[i].url)
    }
  }

  function createBookmark(/*id,*/ index, parentId, title, url){
    chrome.bookmarks.create(
      {
        /*id: id,*/
        index: index,
        parentId: parentId || ho_folder.id,
        title: title,
        url: url
      }, function(result){
        local_bookmarks.push(result);
      }
    )
  }

  function getBookmarks(callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
      if(xhttp.readyState === 4 && xhttp.status === 200){
        callback(JSON.parse(xhttp.responseText));
      }
    };
    xhttp.open('GET', 'http://localhost:8080/read', true);
    xhttp.send();
  }

  function postBookmarks(){
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://localhost:8080/write");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(local_bookmarks));
  }

  function test(){
    postBookmarks();
    console.log('Test method was called');
  }

  function displayMessage(message, timeout){
    display.innerHTML = message;
    setTimeout(function(){
      display.innerHTML = '';
    }, timeout || 2000);
  }

  // var Bookmark = function(_dateAdded, _id, _index, _parentId, _title, _url){
  //   var dateAdded = _dateAdded;
  //   var id = _id;
  //   var index = _index;
  //   var parentId = _parentId;
  //   var title = _title;
  //   var url = _url;
  // }

  // function getCurrentTab(){
  //   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
  //     current_tab = tabs[0];
  //   });
  // }

  init();

});
