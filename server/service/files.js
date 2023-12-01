"use strict";

const path = require("path");
const fs = require("hexo-fs");

const formatSize = (size) => {
    let unit = 'B';
    if (size >= 1024) {
      size /= 1024;
      unit = 'KB';
      if (size >= 1024) {
        size /= 1024;
        unit = 'MB';
      }
    }
    return `${size.toFixed(2)} ${unit}`;
};

const isImage = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
};


module.exports = class FileSerivce {
    /**
     *  @param  hexo hexo instance
     */
    constructor(hexo, type) {
        this.hexo = hexo;
        this.model = this.hexo.model(type);
    }

    /**
     *  @param  articleId xxxxx -> "/home/www/blog/source/_posts/hello.md"
     *  @return fullPath "/home/www/blog/source/_posts/hello"
     */
    fellowFolder(articleId) {
        const filePath = this.model.findById(articleId).full_source;
        const directory = path.dirname(filePath);
        const filename = path.basename(filePath, path.extname(filePath));
        const folderPath = path.join(directory, filename);
        return folderPath;
    }

    fullPath(articleId, filename) {
        return path.join(this.fellowFolder(articleId), filename);
    }

    listFiles = (articleId) => {
        try {
            const folderPath = this.fellowFolder(articleId);
            if (!fs.existsSync(folderPath)) return [];
    
            const imageFiles = fs.readdirSync(folderPath)
                .filter(isImage)
                .map(filename => {
                    const filePath = path.join(folderPath, filename);
                    const size = formatSize(fs.statSync(filePath).size);
                    return { name: filename, size: size };
                });
    
            // console.log(`server/files.js: listFiles: ${JSON.stringify(imageFiles)}`);
            return imageFiles;
        } catch (e) {
            // console.error(e); // Log the error
            return [];
        }
    }
    
    /**
     * returns a read file stream.
       the reviever should call stream.pipe(response)
     */
    getFile = (articleId, filename) => {
        const filepath = this.fullPath(articleId, filename);
        return fs.createReadStream(filepath);
        // return {
        //     data: fs.readFileSync(file_path), //, {encoding: "binary"}
        //     ext: path.extname(filename)
        // };
    }

    renameFile = (articleId, oldName, newName) => {
        const folderPath = this.fellowFolder(articleId);
        return fs.rename(path.join(folderPath, oldName), path.join(folderPath, newName));
    }

    saveFile = (articleId, req) => {
        const file = req.file;
        const folderPath = this.fellowFolder(articleId);
        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath);
        }
        const filename = file.name;
        // don't attach to the files object, if there is no file
        if(!filename || filename.length==0){
            return "undefined";
        }
        // const fellowFiles = fs.readdirSync(folderPath);
        // while(fellowFiles.filter((fname)=>fname == filename).length > 0){
        //     filename = '0' + filename;
        // }
        const filepath = path.join(folderPath, filename);
        console.log(`[ service/files.js ] saving file: ${filepath}`);
        fs.writeFileSync(filepath, file.buffer);
        return filename;
        // file.buffer.write(fs.createWriteStream(filepath, {encoding: 'buffer'})); 
        // encoding:'binary', encoding:'base64', encoding:'utf8' 都行
    }

    deleteFile = (articleId, filename) => {
        const folderPath = this.fellowFolder(articleId);
        fs.unlinkSync(path.join(folderPath, filename));
        return "ok";
    }

}
