/**
 * 总结所有的功能
 */
const express=require('express');
const static=require('express-static'); //读取静态数据
const cookieParser=require('cookie-parser'); //解析cookie
const cookieSession=require('cookie-session');//解析sessiong
const bodyParser=require('body-parser'); //解析数据(只能解析数据类的post，不能解析文件上传的数据)
const multer=require('multer') //解析post上传数据，可以解析文件上传
const ejs=require('ejs');
const jade=require('jade');

const consolidate=require('consolidate'); //配置模板引擎

var server=express();
server.listen(8080);

//1:解析cookie
server.use(cookieParser('sdfgvewgewtedh'))

var arr=[]
for(var i=0;i<100000;i++){
  arr.push('keys_'+Math.random())
}
//2:使用session
server.use(cookieSession({name:'hyt_id',keys:arr,maxAge:20*3600*1000}));

//3:post数据
server.use(bodyParser.urlencoded({extended:false})); //解析数据
server.use(multer({dest:'./www/upload'}).any()) //解析文件(具体操作见server_file.js文件)

//4:配置模板引擎
//输出什么东西
server.set('view engine','html');
//模板文件放在哪里
server.set('views','./views');
//哪种模板引擎
server.engine('html',consolidate.ejs);

//5:用户请求(拿东西，请求页面，请求数据)
server.get('/index',function(req,res){
 res.render('1.ejs',{name:'blue'})
})


//5:用户请求(存东西)
server.use('/ggg',function(req,res,next){
    //req.query(get)
    //req.body(post)
  console.log(req.query,req.body,req.cookies,req.session)
})
//6:static
server.use(static('./www'))
