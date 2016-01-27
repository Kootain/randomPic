var PATH = 'd:/data.json';

var express = require('express');
var util = require('util')
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var app = express();
var log = {};
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
        href: 'https://images.unsplash.com/photo' + pid + util.format('?dpr=1.00&fit=crop&fm=jpg&h=%s&q=100&w=%s',req.query.h||'',req.query.w||'')
      });
    }
  });
  return items;
}


app.get('/photo.js', function (req, res, next) {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  
    res.end('var bgimgUrl=\''+log[parseInt(Math.random()*log.length)].href+'\'');
});

app.get('/update', function (req, res, next) {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('https://unsplash.com/')
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        console.log(err);
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var items = unsplashImg(sres,req);
      fs.writeFileSync(PATH, JSON.stringify(items), 'utf8');
      res.end('update '+items.length+' pics!');
    });
});

app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});

//dpr=1.00&fit=crop&fm=jpg&h=280&q=100&w=1200
