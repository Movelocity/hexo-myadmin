<template>
  <el-container
    class="page"
    @keydown.ctrl.s.prevent.stop="handleSave"
    @keydown.meta.s.prevent.stop="handleSave"
  >
    <el-container class="page-body">
      <el-aside :style="{width: sideMenuWidth}">
        <!-- 文章属性编辑 -->
        <codemirror
          v-model="articleDetail.meta"
          placeholder="input something"
          :extensions="yamlExtensions"
        />
        <!-- 文章图片列表 -->
        <file-list
          :article-api="props.articleApi"
          :article-id="props.articleId"
        />
      </el-aside>
      <el-main>
        <!--文章内容编辑-->
        <codemirror
          v-model="articleDetail.content"
          placeholder="input something"
          :extensions="markdownExtensions"
        />
      </el-main>
    </el-container>
    <el-footer class="page-footer">
      <el-button type="default" @click="toggleSide">Toggle Side</el-button>
      <el-button type="primary" @click="handleSave">Save (⌃/⌘+S)</el-button>
    </el-footer>
  </el-container>
</template>

<script setup>
import {yamlExtensions, markdownExtensions} from "../helper/codemirror";

import {ref, onMounted} from "vue";
//import {ElMessage} from "element-plus";
import {ElMessage, ElButton, ElMessageBox} from "element-plus";

import fileList from "./FileList.vue";

const emit = defineEmits(["save"]);
// 获取加载此组件时在标签内指定的参数
const props = defineProps(["articleId", "articleApi"]);

const api = props.articleApi;
const articleDetail = ref({}); // keys: meta, content

const sideMenuWidth = ref('300px');

onMounted(async () => {
  // Fetching the list of files on mount
  if (props.articleId){
    const {data} = await api.raw(props.articleId);  // 根据文章id获取文章json {"meta":"...", "content": ""}
    articleDetail.value = data;
    // pageConfig.value.articleDetail = data;
  } else {
    // pageConfig.value.articleMeta = "title: \"untitled\"\ncategories: \"uncategorized\"\ntags:\n  - \"tag1\"\n  - \"tag2\"\n";
    // pageConfig.value.articleDetail = "\n\n\n\n\n\n\n\n\n\n";
    articleDetail.value = {
        "meta": "title: \"untitled\"\ncategories: \"uncategorized\"\ntags:\n  - \"tag1\"\n  - \"tag2\"\n",
        "content": "\n\n\n\n\n",
    };
  }
});

async function handleSave() {
  if (props.articleId){
    const {code} = await api.update(props.articleId, articleDetail.value);
    if (!code) ElMessage.success("success");
  } else {
    const {code, data} = await api.create(articleDetail.value);
    if (code) return;
    ElMessage.success("success");
    emit("save", data);
  }
}

const toggleSide = () => {
  if(sideMenuWidth.value == '300px'){
    sideMenuWidth.value = '0px';
  }else if(sideMenuWidth.value == '0px'){
    sideMenuWidth.value = '300px';
  }
}
</script>
<style>
  .page-footer {text-align: right;}
  .v-codemirror :deep(.cm-editor) {min-height: 100%; font-family: consolas !important;}
  .cm-scroller {font-family: consolas !important;}
</style>
