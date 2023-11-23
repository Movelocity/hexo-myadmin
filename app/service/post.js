import request from "./_request";

export default {
    list({page, title, category, tag}) {
        const params = {page, title, category, tag};
        return request.get("post", {params});
    },
    detail(id) {
        return request.get(`post/${id}`);
    },
    raw(id) {
        return request.get(`post/${id}/raw`);
    },
    update(id, post) {
        return request.put(`post/${id}`, post);
    },
    create(post) {
        return request.post("post", post);
    },
    remove(id) {
        return request.delete(`post/${id}`);
    },
    publish(id) {
        return request.post(`post/${id}/publish`);
    },
    unpublish(id) {
        return request.post(`post/${id}/unpublish`);
    },
    // file options
    listFiles(articleId) {
        return request.get(`files/listFiles/${articleId}`);
    },
    getFile(articleId, filename){
        // /files/getImage/
        // return request.get(`files/${articleId}/${filename}`, {responseType: "arraybuffer"});
        return request.get(`files/getImage?articleId=${articleId}&filename=${filename}`, {responseType: "arraybuffer"});
    },
    renameFile(articleId, oldName, newName){
        return request.patch(`files/rename?articleId=${articleId}&oldName=${oldName}&newName=${newName}`);
    },
    deleteFile(articleId, filename){
        return request.patch(`files/delete?articleId=${articleId}&filename=${filename}`);
    },
    uploadFile(articleId, formData){
        return request.post(`files/${articleId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
};