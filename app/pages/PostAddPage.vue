<template>
  <article-detail
    :article-api="postApi"
    :default-category="defaultCategory"
    @save="handleSave"
  />
</template>

<script setup>
import {useRoute} from "vue-router";
import articleDetail from "../components/ArticleEditorCom.vue";
import postApi from "../service/post";
import router from "../router";

const route = useRoute();

let defaultCategory = route.query.defaultCategory || "misc";
console.log(route.query)

function handleSave(data){
    router.replace({"name":"PostDetail", "params":{"postId": data._id}});
}
</script>
