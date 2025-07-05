<template>
  <div class="file-display">
    <div class="file-list">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        <div class="file-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="file-name">{{ file.doc_name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Document } from '@element-plus/icons-vue';

export default {
  name: 'FileDisplay',
  props: {
    files: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Document
  }
};
</script>

<style scoped>
.file-display {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s ease;
  cursor: pointer;
  max-width: 200px;
}

.file-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-icon {
  color: #409EFF;
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
</style> 