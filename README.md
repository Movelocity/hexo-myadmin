# hexo-myadmin

a hexo dashboard plugin, for live hexo server.

![example](./example.gif)

## What is new in this fork?

Check out `app/components/FileList.vue`, `server/controller/files.js`, `server/service/files.js`.

You can manage blog pictures in each edit page in this fork. 

## USAGE

Node.js >= 12.0.0 required.

```bash
    # install hexo-myadmin
    # npm i hexo-myadmin --save
    npm install https://github.com/Movelocity/hexo-myadmin.git --save

    # start server with global hexo-cli
    hexo server -p 4000

    # or with pm2 as deamon
    pm2 start node_modules/.bin/hexo -- server  # not tested in this fork

    # visit localhost:4000/admin
```


## Password Protection

you can add a few config variables to your hexo `_config.yml`:

```
admin:
  username: myfavoritename
  password_hash: be121740bf988b2225a313fa1f107ca1
  secret: a secret something
```

The `password_hash` is the bcrypt hash of your password. You can use [this
site](https://www.bcrypt-generator.com/) to come up with that, or whatever you
want. The `secret` is used to make the cookies secure, so it's a good idea to
have it be long and complicated.

## Thanks

[hexo-admin](https://www.npmjs.com/hexo-admin)

### Contribute
- let me know how it can be improved in the [github issues](https://github.com/thesadabc/hexo-myadmin/issues)
- [fork](https://github.com/thesadabc/hexo-myadmin) and pull-request
