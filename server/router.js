"use strict";

const {"http":{Router, methods}} = require("director");
const ArticleService = require("./service/article");
const CategoryService = require("./service/tag");
const ConfigService = require("./service/config");
const FileSerivce = require("./service/files");

const articleController = require("./controller/article");
const tagController = require("./controller/tag");
const configController = require("./controller/config");
const authController = require("./controller/auth");
const fileController = require('./controller/files');

const router = new Router();
router.configure({"async": true, "recurse": false, "strict": false});

// rewite methods for async controller
methods.forEach((m) => {
    const _method = router[m];
    router[m] = function (path, asyncHandler){
        _method.call(router, path, async function (...args) {
            // keep `this`
            const params = args.slice(0, -1);
            const nextFn = args[args.length - 1];
            try{
                await asyncHandler.apply(this, params);
            } catch(e) {
                nextFn(e);
            }
        });
    };
});

module.exports = function (hexo) {
    router.attach(function () {
        this.hexo = hexo;
        this.service = {
            "post": new ArticleService(hexo, "Post"),
            "page": new ArticleService(hexo, "Page"),
            "category": new CategoryService(hexo, "Category"),
            "tag": new CategoryService(hexo, "Tag"),
            "config": new ConfigService(hexo),
            "files": new FileSerivce(hexo, "Post"),
        };
    });

    router.param("arttype", /(post|page)/);
    router.post("/login", authController.login);
    router.get("/:arttype", articleController.list);
    router.get("/:arttype/:id", articleController.detail);
    router.get("/:arttype/:id/raw", articleController.raw);
    
    router.post("/:arttype", articleController.create);
    router.put("/:arttype/:id", articleController.update);
    router.delete("/:arttype/:id", articleController.delete);
    router.post("/post/:id/publish", articleController.publishPost);
    router.post("/post/:id/unpublish", articleController.unpublishPost);

    router.param("tagtype", /(tag|category)/);
    router.get("/:tagtype", tagController.list);

    router.get("/config", configController.getConfig);
    router.post("/config", configController.updateConfig);
    router.get("/themeconfig", configController.getThemeConfig);
    router.post("/themeconfig", configController.updateThemeConfig);
    
    // router无法解析带'%'的编码URI，所以部分参数采用 url search params 传入
    router.get('/files/getImage', fileController.getFile);   // ?articleId=xxx&filename=xxx
    router.get("/files/listFiles/:id", fileController.listFiles);
    // router.get('/files/:id/:name', fileController.getFile);
    router.patch('/files/rename', fileController.renameFile); // ?articleId=xxx&oldName=xxx&newName=xxx
    router.patch('/files/delete', fileController.deleteFile)
    router.post('/files/:id', fileController.uploadFile)
    return router.dispatch.bind(router);
};
