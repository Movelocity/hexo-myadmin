/* global hexo */
"use strict";

const path = require("path");
const session = require("express-session");
const serveStatic = require("serve-static");
const bodyParser = require("body-parser");
const connectQuery = require("connect-query");

const createRouter = require("./router");
const middleware = require("./middleware");

if (hexo.config.admin) {
    if (!hexo.config.admin.username) {
        throw new Error("admin username config error");
    }
    if (!hexo.config.admin.password_hash || hexo.config.admin.password_hash.length <= 32) {
        throw new Error("admin password_hash config error");
    }
    if (!hexo.config.admin.secret) {
        throw new Error("admin secret config error");
    }
}


hexo.extend.filter.register("server_middleware", function (app) {
    const adminRoot = hexo.config.root + "admin";
    const apiRoot = adminRoot + "/api";

    // main route. 访问 /admin 就会来到 vue 编译结果的 dist 文件夹
    app.use(adminRoot, serveStatic(path.join(__dirname, "../dist")));

    // params
    app.use(apiRoot, connectQuery());  // Parse query parameters in Connect or Express
    app.use(apiRoot, bodyParser.json({"limit": "50mb"})); // 限制 50Mb body

    // helper
    app.use(apiRoot, middleware.helper);
    app.use(apiRoot, middleware.multipart);

    // auth
    if (hexo.config.admin) {
        app.use(apiRoot, session({
            "resave": false,
            "saveUninitialized": false,
            "rolling": true,
            "cookie": { maxAge: 1000 * 60 * 60 * 24 * 365 },
            "secret": hexo.config.admin.secret,
        }));
        app.use(apiRoot, middleware.auth);
    }

    // api router
    app.use(apiRoot, createRouter(hexo));

    // error handler
    app.use(apiRoot, middleware.errorHandler);
});

