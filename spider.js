var PATH = './data.json';
var MAXCON = 10;

var express = require('express');
var util = require('util')
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var eventproxy = require('eventproxy');
var async = require('async');

var app = express();
var log = {};
var ep = new eventproxy();

if(fs.existsSync(PATH)){
  log = JSON.parse(fs.readFileSync(PATH, 'utf8'));
  console.log(log.length);
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
    var pid = $element.children('img').attr('src').match(/-[0-9]+-[0-9 a-z]+/);
    if (pid && pid[0].length > 20){
      items.push({
        title: pid[0],
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
	var urls=[];
	for(var i = 1; i<=req.query.p; i++){
		urls.push('https://unsplash.com/?page='+i);
	}
	var con = 1,
			count =1;
	async.mapLimit(urls, MAXCON, function(url, callback){
		superagent.get(url)
		  .end(function (err, sres) {
			  if (err) {
			    console.log(err);
			    return next(err);
			  }
			  var items = unsplashImg(sres,req);
			  console.log('Downloading... '+ count+'/'+req.query.p + '('+(count++/req.query.p*100).toFixed(1)+'%)');
			  callback(null,items);
			});
		},function(err,result){
			var items=[];
			result.forEach(function(item){
				items = items.concat(item);
			})
			fs.writeFileSync(PATH, JSON.stringify(items), 'utf8');
			console.log('Done!');
			res.end('update '+items.length+' pics!');
	});
});

app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});