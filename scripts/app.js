(function() {
  'use strict';
  document.getElementById('imageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData();
    fd.append('imageFile', document.getElementById('imageUpload').files[0]);
//     var xhr = new XMLHttpRequest;
// xhr.open('POST', '/', true);
// xhr.send(fd);
    console.log(data);
    console.log(e);
  });
})();
