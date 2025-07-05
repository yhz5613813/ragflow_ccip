<template>
  <div class="knowledge-qa-view">
    <div class="header">
      <h2 class="main-title">知识库问答</h2>
      <p class="subtitle">基于知识库的智能问答，快速获取准确信息</p>
    </div>

    <!-- 搜索输入区域 -->
    <div class="search-section">
      <div class="search-container">
        <el-input
          v-model="query"
          type="textarea"
          :rows="4"
          placeholder="请输入您的问题..."
          resize="none"
          class="search-input"
          @keyup.enter.ctrl="handleSearch"
        />
        <div class="search-actions">
          <el-button 
            type="primary" 
            :loading="isLoading"
            @click="handleSearch"
            class="search-button"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="instructions-section">
      <el-card class="instructions-card">
        <template #header>
          <div class="card-header">
            <span>使用说明</span>
          </div>
        </template>
        <div class="instructions-content">
          <ul>
            <li>在搜索框中输入您的问题，支持多行输入</li>
            <li>点击搜索按钮或按 Ctrl+Enter 开始搜索</li>
            <li>系统将基于知识库内容为您提供准确答案</li>
            <li>同时展示相关文档和问题建议</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';

const router = useRouter();

// 响应式数据
const query = ref('');
const isLoading = ref(false);

// 处理搜索
const handleSearch = () => {
  if (!query.value.trim() || isLoading.value) return;

  isLoading.value = true;
  
  // 跳转到结果页面，传递问题参数
  router.push({
    path: '/knowledge-qa-result',
    query: { question: query.value.trim() }
  });
};
</script>

<style scoped>
.knowledge-qa-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.subtitle {
  font-size: 1rem;
  color: #999;
  margin: 0;
}

.search-section {
  margin-bottom: 40px;
}

.search-container {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input {
  margin-bottom: 16px;
}

.search-input :deep(.el-textarea__inner) {
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  resize: none;
  background: #f8f9fa;
}

.search-input :deep(.el-textarea__inner:focus) {
  background: #fff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-actions {
  display: flex;
  justify-content: flex-end;
}

.search-button {
  padding: 12px 24px;
  font-size: 16px;
}

.instructions-section {
  margin-top: 40px;
}

.instructions-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: 600;
  color: #333;
}

.instructions-content ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
  line-height: 1.8;
}

.instructions-content li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .knowledge-qa-view {
    padding: 16px;
  }
  
  .main-title {
    font-size: 1.8rem;
  }
  
  .search-container {
    padding: 16px;
  }
}
</style> 