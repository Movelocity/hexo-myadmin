"use strict";

module.exports = {
    listFiles (articleId) {
        const image_paths = this.service.files.listFiles(articleId);
        if (!image_paths) throw new Error("folder resource " + id + " not found");
        this.res.send(image_paths);  
        // send() 函数不是程序默认的，而是middleware里面被use的helper, 那边的报错可以在这里trycatch到
    },

    getFile () {
        let params = new URL(this.req.url, "http://example.org").searchParams;
        let articleId = params.get('articleId');
        let filename = decodeURI(params.get('filename'));

        console.log(`view: ${filename}`);
        this.res.setHeader("Content-Type", "image/"+filename.split('.').pop());
        const stream = this.service.files.getFile(articleId, filename);
        stream.pipe(this.res);
    },

    renameFile () {
        // articleId, oldName, newName
        let params = new URL(this.req.url, "http://example.org").searchParams;
        let articleId = params.get('articleId')
        let oldName = decodeURI(params.get('oldName'));
        let newName = decodeURI(params.get('newName'));

        console.log(`rename ${articleId}, ${oldName}, ${newName}`);
        try {
            this.service.files.renameFile(articleId, oldName, newName);
            this.res.send({ msg: 'File renamed successfully' });
        } catch (error) {
            console.log(error)
            this.res.send(1);
        }
    },

    deleteFile () {
        // articleId, oldName, newName
        let params = new URL(this.req.url, "http://example.org").searchParams;
        let articleId = params.get('articleId')
        let filename = decodeURI(params.get('filename'));

        console.log(`delete ${articleId}, ${filename}`);
        try {
            this.service.files.deleteFile(articleId, filename);
            this.res.send({ msg: 'File deleted' });
        } catch (error) {
            console.log(error)
            this.res.send(1);
        }
    },

    /**
     * File will be saved to the fellow folder of yhe article.
     * req.pipe(fs.createWriteStream(filepath, {encoding: 'binary'})); 
     */
    uploadFile (articleId){
        // middleware.helper 将 'multipart' 类型的 file 转为 req.file
        console.log(`uploadfile to article: ${articleId}`);
        const filename = this.service.files.saveFile(articleId, this.req);
        this.res.send({msg: `${filename} saved.`});
    }
}

