<template>
  <div class="sidebar">
    <!-- Logo 区域 -->
    <div class="logo-area" style="display: flex; align-items: center; padding: 20px;">
      <img src="@/assets/logo.png" alt="Logo" style="width: 32px; margin-right: 10px;" />
      <h3 style="margin: 0; color: #409EFF;">科研助手</h3>
    </div>
    <!-- 新对话按钮 -->
    <el-button type="primary" icon="plus" circle @click="startNewConversation" style="margin: 0 20px;">
      <!-- 使用 Element Plus 图标 -->
      <el-icon><Plus /></el-icon>
    </el-button>

    <!-- 功能模块导航 -->
    <el-menu
      class="el-menu-vertical-demo"
      :default-active="$route.path"
      :collapse="false"
      router
      background-color="#f5f7fa"
      text-color="#333"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/search">智能搜索</el-menu-item>
      <el-menu-item index="/report">报告生成</el-menu-item>
      <el-menu-item index="/knowledge-qa">知识库问答</el-menu-item>
      <el-menu-item index="/ocr">OCR识别</el-menu-item>
      <el-menu-item index="/document-summary">文档摘要</el-menu-item>
      <el-menu-item index="/mind-map">思维导图</el-menu-item>
    </el-menu>

    <!-- 历史对话 -->
    <div style="margin: 20px;">
      <h4>历史对话</h4>
      <el-menu
        class="el-menu-vertical-demo"
        :default-active="$route.path"
        :collapse="false"
        router
        background-color="#ffffff"
        text-color="#333"
        active-text-color="#409EFF"
      >
        <el-menu-item
          v-for="(item, index) in conversationStore.history"
          :key="index"
          :index="`/history/${index}`"
        >
          {{ item }}
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { useConversationStore } from '@/store/conversation';
import { Plus } from '@element-plus/icons-vue';

const conversationStore = useConversationStore();

const startNewConversation = () => {
  // 清空历史或启动新对话逻辑
  conversationStore.clearHistory();
};
</script>

<style scoped>
.sidebar {
  background-color: #f5f7fa;
  height: 100%;
}
</style>
