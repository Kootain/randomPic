var PATH = './data.json';
var MAXCON = 10;

var express = require('express');
var util = require('util');
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var eventproxy = require('eventproxy');
var async = require('async');
var events = require('events');

var app = express();
var log = [];
var ep = new eventproxy();

if(fs.existsSync(PATH)){
  try{
    log = JSON.parse(fs.readFileSync(PATH, 'utf8'));
    console.log(log.length);
  }catch(e){
    log = [];
  }
}else{

}

var makeImgTag = function(list){
  var result = "";
  var tmpl = '<img src="%s">';
  for(var i=0;i<list.length;i++){
    result = result + util.format(tmpl,list[i].href);
  }
  return result;

};
var compareImg = function(title){
  return function(e){
    if (e.title == title) return 1;
    return 0;
  };
};

var unsplashImg = function(sres,req){
  var $ = cheerio.load(sres.text);
  var items = [];
  $('.photo__image-container').each(function (idx, element) {
    // console.log(element);
    var $element = $(element);
    var src = $element.children('img').attr('src').split('?');
    var title = src[0];
    if(!log.find(compareImg(title))){
      if (src && src.length == 2){
        items.push({
          title: title,
          href: src[0] + '?dpr=1.00&fit=crop&fm=jpg&q=100'
        });
      }
    }else{
      console.log(title+' exsits!');
    }
  });
  return items;
};


app.get('/photo.js', function (req, res, next) {
    if(log.length){
      res.end('var bgimgUrl=\''+log[parseInt(Math.random()*log.length)].href+util.format('&h=%s&w=%s',req.query.h||'',req.query.w||'')+'\'');
    }else{
      res.end('No data!');
    }
});

app.get('/update', function (req, res, next) {
  console.log(log.length);
  if(log.length==0||req.query.hasOwnProperty('p')){
  	var urls=[];
  	for(var i = 1; i<= (req.query.p || 50); i++){
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
  			  console.log('Downloading... '+ count++ +'/'+req.query.p||'unknown' + '('+(count++/(req.query.p||1)*100).toFixed(1)+'%)');
  			  callback(null,items);
  			});
  		},function(err,result){
  			var items=[];
  			result.forEach(function(item){
  				items = items.concat(item);
  			});
        log = log.concat(items)
  			fs.writeFileSync(PATH, JSON.stringify(log), 'utf8');
  			console.log('Done!');
  			res.end('update '+items.length+' pics!');
  	});
  }else{
    var n = log.length;
    var step = 5;
    var done = 0;
    var update = [];
    var ep = new events.EventEmitter();
  ep.on('update',function(page){
      var url = 'https://unsplash.com/?page=' + page;
      superagent.get(url)
        .end(function (err, sres) {
          console.log(page);
          if (err) {
            console.log(err);
            return next(err);
          }
          var items = unsplashImg(sres,req);
          if (items.length) {
            console.log('Downloading... Page' + page + '-' + items.length + 'pics have been found.');
            page = page + step;
            log = log.concat(items);
            ep.emit('update',page);
          }else{
            ep.emit('done');
          }
        });
    });
    ep.on('done',function(){
      done++;
      if(done == step){
        fs.writeFileSync(PATH, JSON.stringify(log), 'utf8');
        res.end('update '+(log.length-n)+' pics!');
        console.log('Done!');
      }
    });
    for(var i = 1; i <= step; i++){
      ep.emit('update',i);
    }
  }

});

app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});