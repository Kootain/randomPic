var PATH = './data.json';

var express = require('express');
var util = require('util')
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var eventproxy = require('eventproxy');

var app = express();
var log = {};
var ep = new eventproxy();

if(fs.existsSync(PATH)){
  log = JSON.parse(fs.readFileSync(PATH, 'utf8'));
}else{

}

var makeImgTag = function(list){
  var result = "";
  var tmpl = '<img src="%s">';
  for(var i=0;i<list.length;i++){
    result = result + util.format(tmpl,list[i].href);
  }
  return result;

}

var unsplashImg = function(sres,req){
  var $ = cheerio.load(sres.text);
  var items = [];
  $('.photo__image-container').each(function (idx, element) {
    // console.log(element);
    var $element = $(element);
    var pid = $element.children('img').attr('src').match(/-[0-9 a-z -]+/);
    if (pid[0].length > 20){
      items.push({
        title: pid,
        href: 'https://images.unsplash.com/photo' + pid + '?dpr=1.00&fit=crop&fm=jpg&q=100'
      });
    }
  });
  return items;
}


app.get('/photo.js', function (req, res, next) {
  
    res.end('var bgimgUrl=\''+log[parseInt(Math.random()*log.length)].href+util.format('&h=%s&w=%s',req.query.h||'',req.query.w||'')+'\'');
});

app.get('/update', function (req, res, next) {

	ep.after('data', req.query.p||1, function(items){
		fs.writeFileSync(PATH, JSON.stringify(items), 'utf8');
		es.end('update '+items.length+' pics!');
	});

	for(var i = 1; i<= req.query.p||1; i++){
		superagent.get('https://unsplash.com/')
		  .end(function (err, sres) {
		    if (err) {
		      console.log(err);
		      return next(err);
		    }
		    var items = unsplashImg(sres,req);
		    eq.emit('data',items);
		    // fs.writeFileSync(PATH, JSON.stringify(items), 'utf8');
		    // res.end('update '+items.length+' pics!');
		  });
	}
});

app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});

//dpr=1.00&fit=crop&fm=jpg&h=280&q=100&w=1200
