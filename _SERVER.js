var express    = require("express");
app=express();

var router     = require("./_ROUTER")(app);



app.set("views",__dirname+'/public');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile);


var HTTP_SERVER=app.listen(80,function(){
	console.log(new Date()+"\n로컬서버에 성공적으로 연결되었습니다.\n\n");
});
app.use(express.static('public'));



require('./_BOT.js')(HTTP_SERVER);