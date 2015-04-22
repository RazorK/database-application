var express = require('express');
var router = express.Router();

var news = require('../controllers/news');
/* GET users listing. */
router.get('/:board?', news.pt_update,news.pt_res);

module.exports = router;
