document.getElementById('btn_test').addEventListener('click', test);
document.addEventListener('DOMContentLoaded', init);

var display = document.getElementById('display');
var folder_id = null;
var current_tab = null;

function init() {
  chrome.bookmarks.search({'title': 'H&O'}, function (results){
    results = results.filter(function(result){
      return (result.parentId === '1' && result.title === 'H&O');
    });
    if(results.length === 0){
      chrome.bookmarks.create({'parentId': '1', 'title': 'H&O'}, function(new_folder) {
        folder_id = new_folder.id;
        displayMessage('Id:' + folder_id);
      });
    }
    else{
      folder_id = results[0].id;
      displayMessage('Id:' + folder_id);
    }
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
    current_tab = tabs[0];
  });

}

function displayMessage(message, timeout){
  display.innerHTML = message;
  setTimeout(function(){
    display.innerHTML = '';
  }, timeout || 2000);
}
function createBookmark(parentId, index, title, url){
  chrome.bookmarks.create({'parentId': parentId, /*'index': index,*/ 'title': title, 'url': url}, function(result){
    console.log('tab created');
    console.log(result);
  })
}
function test(){
  console.log('test()');
  createBookmark(folder_id, null, 'Marcador de prueba', current_tab.url)
}


// document.addEventListener('DOMContentLoaded', function() {
//   chrome.bookmarks.create({'title': 'Extension bookmarks'}, function(new_folder) {
//     console.log("added folder: " + new_folder.title);
//   });
//   // chrome.bookmarks.getTree(function (results){
//   //   console.log(results);
//   // })
// });
