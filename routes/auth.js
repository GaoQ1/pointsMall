/**
 * Created by baojx on 2015/9/28.
 */
var express = require('express');
var router = express.Router();
var auth = require("./middleware/auth");
/* GET users listing. */
// /users/addAccount
router.get('/mall', auth.users);
module.exports = router;
