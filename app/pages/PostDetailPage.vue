<template>
  <article-detail
    :article-id="route.params.postId"
    :article-api="postApi"
  />
</template>

<script setup>
import {useRoute} from "vue-router";
import articleDetail from "../components/ArticleEditorCom.vue";
import postApi from "../service/post";
const route = useRoute();
</script>
