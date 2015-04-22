var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var xml2js = Promise.promisifyAll(require('xml2js'));
var iconv = Promise.promisifyAll(require('iconv-lite'));
var jsdom = Promise.promisifyAll(require('jsdom'));
var fs = require('fs');
var jquery = fs.readFileSync('./lib/jquery.min.js').toString();

module.exports = {
  rss: function(rss, callback) {
    // all in req.rss
    Promise.each(rss, function(obj) {
      // important: this loop will call callback function serveral times, depend on the length of rss
      request.getAsync({
        url: obj.url,
        encoding: null,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.11 Safari/537.36'
        }
      }).spread(function(response, body) {
        return xml2js.parseStringAsync(iconv.decode(body, obj.decode || 'utf8'));
      }).then(function(json_result) {
        callback(json_result);
      });
    });
  },
  jsdom: function(config, callback) {
    /*
    example:
    request.selector({
      url: http://xxx.com/xxx,
      params: {a:b, c:d}, //optional
      decode: 'gbk', //optional
      cookie: '', //optional
    }, callback($){
      $('.xxx').html();
    });
    */
    var decode = config.decode || 'utf8';
    var url = config.url;
    var jar = request.jar();
    if (config.cookie) jar.setCookie(config.cookie, config.url.match(/http:\/\/.*?\//g)[0], function() {});
    request({
      uri: url,
      method: config.params ? 'POST' : 'GET',
      form: config.params || '',
      encoding: null,
      jar: jar,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2327.5 Safari/537.36',
        'Cookie': config.cookie,
      }
    }, function(err, result, body) {
      var decoded_result = iconv.decode(body, decode);
      jsdom.env({
        html: decoded_result,
        src: [jquery],
        done: function(errors, window) {
          callback(window.$);
        }
      });
    });

  },
};