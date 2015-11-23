var crypto = require('crypto');
 
exports.md5Sign = function(data){
	var str = (new Buffer(data)).toString("binary");
  	var md5 = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
	var str2 = new Buffer(md5).toString('base64');
   	return str2; 
}
