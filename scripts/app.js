(function() {
  'use strict';
  document.getElementById('imageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData();
    fd.append('imageFile', document.getElementById('imageUpload').files[0]);
    var http = new XMLHttpRequest();
    http.open('POST', 'https://ixxjg97wd7.execute-api.us-east-1.amazonaws.com/dev/selfie/create', true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function() {
      if (http.readyState == XMLHttpRequest.DONE && http.status == 200) {
        alert("Form Submitted");
      }
    };
    http.send(fd);
    console.log(e);
  });
})();
