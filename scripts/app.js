(function() {
  'use strict';
  document.getElementById('imageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData();
    fd.append('imageFile', document.getElementById('imageUpload').files[0]);
    var http = new XMLHttpRequest();
    http.open('POST', 'https://ixxjg97wd7.execute-api.us-east-1.amazonaws.com/dev/selfie/create', true);
    http.onload = function() {
      if (http.status == 200) {
        alert("Form Submitted");
      }
    };
    http.send(fd);
    console.log(data);
    console.log(e);
  });
})();
