<template>
  <div class="search-wrapper">
    <div class="search-container">
      <div class="search-input-group">
        <el-input
          v-model="query"
          type="textarea"
          :rows="4"
          placeholder="搜索、提问或发消息"
          resize="none"
          class="custom-input"
        />
      </div>
      <div class="search-options">
        <el-button class="active-option" @click="onSearch">
          <el-icon class="option-icon"><Connection /></el-icon>
          深度思考
        </el-button>
        <el-button>
          <el-icon class="option-icon"><Collection /></el-icon>
          公开库
        </el-button>
        <el-button>
          <el-icon class="option-icon"><Lock /></el-icon>
          私有库
        </el-button>
        <el-button>
          <el-icon class="option-icon"><User /></el-icon>
          团队库
        </el-button>
      </div>
      <el-button class="submit-button" circle @click="onSearch">
        <el-icon><ArrowUp /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowUp, Connection, Collection, Lock, User } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const query = ref('');

const onSearch = () => {
  if (query.value.trim()) {
    // 将查询内容作为参数传递到聊天界面
    router.push({
      path: '/chat',
      query: { initialMessage: query.value }
    });
  }
};
</script>

<style scoped>
.search-wrapper {
  max-width: 650px;
  width: 100%;
}

.search-container {
  width: 100%;
  padding: 12px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: none;
  position: relative;
}

.search-input-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  border: none;
  padding-left: 0;
  margin-left: 0;
}

.search-input-group .el-input {
  flex: 1;
}

/* 使用>>>深度选择器彻底去除边框 */
.search-input-group .custom-input >>> .el-textarea__inner {
  border: 0;
  border-radius: 8px;
  padding: 0;
  box-shadow: none !important;
  resize: none;
  background: transparent;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(144, 147, 153, 0.3) transparent;
}

/* 针对Webkit浏览器（Chrome、Safari等）的滚动条样式 */
.search-input-group .custom-input >>> .el-textarea__inner::-webkit-scrollbar {
  width: 6px;
}

.search-input-group .custom-input >>> .el-textarea__inner::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.search-input-group .custom-input >>> .el-textarea__inner::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 10px;
  border: 1px solid #f1f1f1;
}

.search-input-group .custom-input >>> .el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}

/* 去掉上下箭头 */
.search-input-group .custom-input >>> .el-textarea__inner::-webkit-scrollbar-button {
  display: none;
}

.search-input-group .custom-input >>> .el-textarea__wrapper {
  box-shadow: none !important;
  border: 0;
  padding: 0;
  background: transparent;
}

.search-input-group .custom-input >>> .el-textarea__wrapper.is-focus {
  box-shadow: none !important;
  border: 0;
  background: transparent;
}

.search-options {
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 8px;
  padding-left: 0;
}

.search-options .el-button {
  border-radius: 6px;
  height: 32px;
  padding: 0 16px;
  margin-bottom: 0;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.search-options .el-button.active-option {
  border-color: #409EFF;
  color: #409EFF;
}

.option-icon {
  margin-right: 4px;
  font-size: 14px;
}

.search-options .active-option .option-icon {
  color: #409EFF;
}

.submit-button {
  position: absolute;
  right: 16px;
  bottom: 16px;
  background-color: #f0f7ff;
  border: none;
  color: #409EFF;
}

@media (max-width: 768px) {
  .search-options {
    justify-content: space-between;
  }
  
  .search-options .el-button {
    margin-right: 0;
    flex-grow: 1;
    margin-bottom: 0;
  }
}
</style>
