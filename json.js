var result={};
$.ajax({
  url: 'http://localhost:3000/',
  data: null,
  success: function(data){
    alert('ok2');
  },
  error: function(a,b){
    console.log(a);
  },
  timeout: 90000,
  dataType: 'json'
});

