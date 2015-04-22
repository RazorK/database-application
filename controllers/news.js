var Promise = require('bluebird');
var lib_request = require('../lib/request.js');
var sjtu_pt = require('../models/news.js').sjtu_pt;

module.exports = {
	pt_redistri: function(link) {
    var cat = link.split('=')[1];
    var board = '';
    switch (cat) {
      case '401':
      case '402':
      case '403':
      case '406':
        return board += 'movie';
      case '407':
      case '408':
      case '409':
      case '410':
        return board += 'tvplay';
      case '411':
      case '412':
      case '413':
      case '414':
        return board += 'show';
      case '420':
      case '421':
      case '422':
      case '423':
      case '425':
      case '426':
        return board += 'music';
      case '427':
        return board += 'mv';
      case '429':
        return board += 'game';
      case '431':
        return board += 'cartoon';
      case '432':
        return board += 'sport';
      case '434':
        return board += 'software';
      case '435':
        return board += 'study';
      case '440':
        return board += 'mac';
      case '451':
        return board += 'campus';
      case '450':
        return board += 'other';
    }
  },
  pt_distri: function(board) {
    var link = '';
    switch (board) {
      case 'movie':
        link += '&cat401=1&cat402=1&cat403=1&cat406=1';
        break;
      case 'tvplay':
        link += '&cat407=1&cat408=1&cat409=1&cat410=1';
        break;
      case 'show':
        link += '&cat411=1&cat412=1&cat413=1&cat414=1';
        break;
      case 'music':
        link += '&cat420=1&cat421=1&cat422=1&cat423=1&cat425=1&cat426=1';
        break;
      case 'mv':
        link += '&cat427=1';
        break;
      case 'game':
        link += '&cat429=1';
        break;
      case 'cartoon':
        link += '&cat431=1';
        break;
      case 'sport':
        link += '&cat432=1';
        break;
      case 'software':
        link += '&cat434=1';
        break;
      case 'study':
        link += '&cat435=1';
        break;
      case 'mac':
        link += '&cat440=1';
        break;
      case 'campus':
        link += '&cat451=1';
        break;
      case 'other':
        link += '&cat450=1';
        break;
    }
    return link;
  },
  pt_link: function(num, array) {
    var link = 'https://pt.sjtu.edu.cn/torrentrss.php?';
    link += 'rows=' + num;
    for (var dis in array) {
      if (array.hasOwnProperty(dis)) {
        link += module.exports.pt_distri(array[dis]);
      }
    }
    return link;
  },
  pt_update: function(req, res, next) {
    var boards = [];
    var number = req.body.number || 20;
    var board = req.body.board || req.params.board || '';
    boards = board.split('&');
    var link = module.exports.pt_link(number, boards);
    var rss = [{
      url: link,
      decode: 'utf8'
    }];
    lib_request.rss(rss, function(result) {
      var results = result.rss.channel[0].item;
      Promise.each(results, function(obj) {
        var item = {};
        for (var name in obj) {
          if (obj.hasOwnProperty(name)) {
            if (name === 'guid')
              continue;
            if (name === 'category') {
              item.category = obj.category[0]._;
              item.domain = obj.category[0]['$'].domain;
              continue;
            }
            if (name === 'description') {
              item.description=obj.description[0].text();
            }
            var names = '';
            names += name;
            item[names] = obj[names][0];
          }
        }
        item.board = module.exports.pt_redistri(item.domain);
        sjtu_pt.findOneAsync({
          link: item.link
        }).then(function(result) {
          if (!result) {
            new sjtu_pt(item).saveAsync().catch(res.err);
          } else {
            result.save(function(err) {
              if (err) {
                console.log(err);
              }
            });
          }
        });
      });
      next();
    });
  },
  pt_res: function(req, res) {
    sjtu_pt.find({
      board: req.params.board
    }).select('title link description author category domain comments pubDate board').sort('-updatedAt').limit(20).exec(function(err, result) {
      res.json(result);
    });
  },
  pt_post: function(req, res) {
    var boards = [];
    boards = req.body.board.split('&');
    var num = req.body.number || 20;
    sjtu_pt.find({
      'board': {
        '$in': boards
      }
    }).select('title link description author category domain comments pubDate board').sort('-updatedAt').limit(num).exec(function(err, result) {
      res.json(result);
    });
  },
}