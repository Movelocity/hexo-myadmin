"use strict";
var concat = require('concat-stream')
var is = require('type-is')
var BusBoy = require('busboy')
const fs = require("hexo-fs");

module.exports.helper = function (req, resp, next) {
  // 若前面步骤res发送字符串、对象、数字，则统一格式化为携带部分默认信息的 json
  // response 自带 write, end 等发送消息的函数，但是没有 send，我们可以自定义这个方法
  resp.send = function (data) {
    resp.setHeader('Access-Control-Allow-Origin', '*'); // 允许跨域
    resp.setHeader("Content-Type", "application/json");
    const ret = {"msg": "unknow error", "code": -1};
    switch (typeof(data)) {
      case "string":
        ret.code = 1;
        ret.msg = data;
        break;
      case "undefined":
      case "object":
        ret.code = 0;
        ret.msg = "ok";
        ret.data = data;
        break;
      case "number":
        ret.code = data;
        ret.msg = "error: " + data;
        break;
    }
    resp.end(JSON.stringify(ret));
  };
  next();
};

module.exports.multipart = (req, res, next) => {
  // 仅截获 multipart 数据，其它的交给 next
  if (is(req, ['multipart'])){
    req.body = Object.create(null);
    const busboy = BusBoy({ headers: req.headers, limits:{files: 1}, defParamCharset:'utf-8'});
    busboy.on('file', (fieldname, fileStream, { filename, encoding, mimeType }) => {
      console.log(`${fieldname}, ${filename}`);
      if(fieldname == 'image'){
        fileStream.pipe(concat({ encoding: 'buffer' }, (data) => {
          req.file = {name: filename, buffer:data, encoding: 'buffer'};1
        }))
      }
    });
    // busboy.on('field', (name, val, info)=>{
    //   console.log(`field: [${name}]: value: ${val}`);
    // })
    // on close 可能在 Writable 类里面初始化 streamOpts = {emitClose: true}，当 writable 结束才会触发这个
    busboy.on('close', () => {
      console.log('close');
      req.unpipe(busboy);
      busboy.removeAllListeners();
      next();
    });
    req.pipe(busboy);
  }else{
    next();
  }
}

module.exports.auth = function (req, resp, next) {
    if (req.url.includes("/login")) return next();
    if (req.session && req.session.login) return next();
    resp.send(401);
};

module.exports.errorHandler = function (err, req, resp, next) {
    console.error("Global ErrorHandler ", err);
    resp.send(err.toString());
    next();
};
