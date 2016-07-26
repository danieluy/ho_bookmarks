document.addEventListener('DOMContentLoaded', function() {
  var display = document.getElementById('display');
  var folder_id = null;
  chrome.bookmarks.search({'title': 'H&O'}, function (results){
    results = results.filter(function(result){
      return (result.parentId === '1' && result.title === 'H&O');
    });
    if(results.length === 0){
      chrome.bookmarks.create({'parentId': '1', 'title': 'H&O'}, function(newFolder) {
        folder_id = newFolder.id;
      });
      displayMessage('Se ha creado la carpeta "H&O"');
    }
    else{
      displayMessage('Ya existe la carpeta "H&O"');
    }
  });

  function displayMessage(message, timeout){
    display.innerHTML = message;
    setTimeout(function(){
      display.innerHTML = '';
    }, timeout || 2000);
  }
  
});
// document.addEventListener('DOMContentLoaded', function() {
//   chrome.bookmarks.create({'title': 'Extension bookmarks'}, function(newFolder) {
//     console.log("added folder: " + newFolder.title);
//   });
//   // chrome.bookmarks.getTree(function (results){
//   //   console.log(results);
//   // })
// });
