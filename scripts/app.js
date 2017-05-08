(function() {
  'use strict';
  var form = document.getElementById('imageForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData(form);
    fetch("https://31w7u6bill.execute-api.us-east-1.amazonaws.com/prod/selfie/create", {
      method: "POST",
      body: fd
    }).then(function(res) {
      console.log(res);
    }).catch(function(err) {
      console.log(err);
    });
    console.log(e);
  });
})();
