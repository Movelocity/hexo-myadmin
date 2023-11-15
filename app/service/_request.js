import {ElMessage} from "element-plus";
import axios from "axios";

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
const service = axios.create({"baseURL": "./api", "timeout": 100000});

service.interceptors.response.use(
    (res) => {
        if (
            res.request.responseType === "blob" ||
            res.request.responseType === "arraybuffer"
        ) {
            console.log("type: "+res.request.responseType);
            console.log(Object.keys(res));
            // console.log(Object.keys(res.data));
            return res.data;
        }
        const code = res.data.code;
        if (!code) return res.data;

        const msg = res.data.data || res.data.msg || `系统未知错误: ${code}`;

        ElMessage.error(msg);

        if (code === 401) {
            location.href = "./login.html";
            throw new Error("Illegal login");
        }
        return res.data;
    }, ({message}) => {
        ElMessage.error(message);
        return {"code": -1};
    },
);

export default service;
