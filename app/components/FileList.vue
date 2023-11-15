<template>
  <div class="file-management">
    <ul class="imglist">

    <li style="margin-right: 0; align-self: end; display:flex; flex-direction: row;">
      <input type="file" @change="handleFileUpload" ref="fileInput" hidden accept="image/*"/>
      <el-button size="small" @click.stop="triggerFileInput" round>Add</el-button>
      <el-button size="small" @click.stop="triggerRefreshList" round>Refresh</el-button>
    </li>

    <div class="list-view">
      <div class="list-item" v-for="item in imgList" :key="item.name">
        <div class="column">{{ truncateString(item.name, 12) }}</div>
        <div class="column" style="color:gray; font-size:small;">{{ item.size }}</div>
        <el-button class="column" type="default" @click.stop="showImgDetail(item)" round>view</el-button>
      </div>
    </div>
    </ul>
  </div>

  <el-dialog v-model="preview.dialogVisible" title="" width="80%">
    <div>
      <el-container direction="vertical">
        <el-main style="border-bottom: 1px solid #eee6e6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin: .5em;">
            <div>
              <el-input v-model="preview.editName" :placeholder="preview.imgItem.name" class="s-2"/>
            </div>
            <div>
              <el-button type="default" @click.stop="toClipboard(preview.imgItem.name)" style="margin-left: .5em">Copy to clipboard</el-button>
              <el-button type="primary" @click.stop="renameImage(preview.imgItem.name)">Rename</el-button>
              <el-button @click.stop="deleteImage(preview.imgItem.name)" type="danger">Delete</el-button>
            </div>
          </div>
        </el-main>
        <el-main class="img-container">
          <el-image :src="preview.imgItem.url" alt="Dynamic Image" fit="scale-down"/>
        </el-main>
      </el-container>
    </div>
  </el-dialog>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {ElMessage, ElButton, ElMessageBox} from "element-plus";
import {Delete, Edit, Search} from '@element-plus/icons-vue'
import { debounce } from 'lodash';

const props = defineProps(["articleId", "articleApi"]);
const api = props.articleApi;

const preview = ref({
  dialogVisible: false,
  imgItem: null,
  editName: "",  // editable
  upfile: false,
});

const imgList = ref([]); // This will store the list of files.
const fileInput = ref(null); // remain null, and the engine will asigne the input element to it

const refreshList = ()=>{
  imgList.value = [];
  api.listFiles(props.articleId).then((obj)=>{
    console.log(obj.data);
    obj.data.forEach((imgItem)=>{
      imgList.value.push({
        name: imgItem.name,
        size: imgItem.size,
        url: null,
        shortName: imgItem.name.length<10?imgItem.name:imgItem.name.slice(0, 9)+"..."
      })
    });
  });
}
// Set the minimum call interval to 3000 milliseconds (1 second)
const triggerRefreshList = debounce(()=>{
    refreshList();
    ElMessage({
      message: 'Image files refreshed.',
      type: 'success',
    })
  }, 
  3000
);

onMounted(async () => {
  // image preview
  refreshList();
});

const ensureImg = async (imgItem) => {
  if(imgItem.url == null){
    const imgfile = await api.getFile(props.articleId, imgItem.name);
    if (imgfile){
      const url = `data:image/${imgItem.name.split('.').pop()};base64,` + btoa(
        new Uint8Array(imgfile).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      imgItem.url = url;
    }
  }
}

async function showImgDetail(imgItem) {
  if (!props.articleId) return;

  ensureImg(imgItem);

  preview.value.imgItem = imgItem;
  preview.value.editName = imgItem.name;
  preview.value.dialogVisible = true;
}

// 文件管理函数
async function renameImage(filename) {
  if(!props.articleId) return;

  const newName = preview.value.editName;
  const isConflic = imgList.value.filter((item) => item.name === newName);
  if(isConflic.length > 0){
    ElMessage({message: `${newName} 未修改，或者和已有文件重名`,type: 'warning'});
    return;
  }

  const {code, data} = await api.renameFile(props.articleId, filename, preview.value.editName);
  console.log(data);
  if(!code) {
    for(let i=0; i<imgList.value.length; i++){
      console.log(imgList.value[i].name);
      if(imgList.value[i].name == filename){
        imgList.value[i].name = newName;
        imgList.value[i].shortName = newName.length<10? newName: newName.slice(0, 9)+"..."
        console.log(imgList.value[i].name);
        break;
      }
    }
    ElMessage({message: data.msg, type: "success"});
  }
}

async function deleteImage(filename) {
  // await api.deleteFile(fileId);
  // Remove the deleted file from the files list
  // 要换一种方式去除数组元素，这种方式可能导致剩下的发生混乱。
  imgList.value = imgList.value.filter(imgItem => imgItem.name !== filename);
  console.log("try to delete file: "+filename);
  preview.value.dialogVisible = false;
}

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

const uploadFile = async (file) => {
  /**
   * file: {name, lastModified, lastModifiedDate, size, type: "image/jpeg", webkitRelativePath, Prototype}
   */
  console.log(file);

  if(!props.articleId){
    // 先初始化文章。涉及从pageAddPage路由到PageDetailPage, 也许有潜在问题
    handleSave();
  }
  console.log(`props.articleId: ${props.articleId}`);  // 再检查一遍

  const formData = new FormData();
  formData.append('image', file); // 这里的 'image' 属于表单1field, 需要对应后端 multer().single(fieldname)

  try{
    const {data} = api.uploadFile(props.articleId, formData);
    
    imgList.value.push({
      name: file.name,
      shortName: file.name.length<10? file.name : file.name.slice(0, 9) + "...",
      size: formatSize(file.size),
      url: URL.createObjectURL(file)
    })
  }catch(err){
    console.log(err);
  }
}

const handleFileUpload = async (e) => {
  const singleFile = fileInput.value.files[0];
  uploadFile(singleFile);
}

const triggerFileInput = ()=>{
  // console.log(fileInput.value);
  fileInput.value.click();
}

function truncateString(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
}

const toClipboard = (strValue)=>{
  const textarea = document.createElement('textarea');  // Create a temporary textarea element
  textarea.value = `<div style='display:flex; flex-direction:row; justify-content:center'>\n  <img src='${strValue}' width="80%">\n</div>`;
  document.body.appendChild(textarea);  // Append the textarea to the document
  textarea.select();  // Select the content of the textarea
  document.execCommand('copy');  // Copy the selected text to the clipboard
  document.body.removeChild(textarea);  // Remove the temporary textarea from the document

  preview.value.dialogVisible = false;
}
</script>
<style>
  .file-management {
    border-top: 1px solid #ccc;
    margin-top: 10px;
  }
  .imglist{
    display: flex;
    flex-direction: column;
    width: 95%;
    height: calc(100% - 50px); 
    overflow: auto;
    padding-left: 1em;
  }
  .imglist li{
    list-style: none;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eee6e6;
    padding: 1px;
  }

  .list-view {
    display: flex;
    flex-direction: column;
  }
  .list-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .column {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>