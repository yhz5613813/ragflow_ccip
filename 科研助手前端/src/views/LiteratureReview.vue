<template>
  <div>
    <h2>文献研读</h2>
    <p>提炼大纲，总结摘要</p>
    
    <!-- 文献上传区域 -->
    <el-upload
      class="upload-area"
      drag
      action="#"
      :auto-upload="false"
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文献拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 PDF、Word、TXT 等格式文件
        </div>
      </template>
    </el-upload>

    <!-- 文献分析选项 -->
    <div class="analysis-options" style="margin-top: 20px;">
      <el-checkbox-group v-model="selectedOptions">
        <el-checkbox label="outline">生成大纲</el-checkbox>
        <el-checkbox label="summary">生成摘要</el-checkbox>
        <el-checkbox label="keywords">提取关键词</el-checkbox>
        <el-checkbox label="citations">引用分析</el-checkbox>
      </el-checkbox-group>
    </div>

    <el-button type="primary" @click="analyzeLiterature" style="margin-top: 20px;">
      开始分析
    </el-button>

    <!-- 分析结果展示 -->
    <div v-if="analysisResult" style="margin-top: 20px;">
      <h3>分析结果：</h3>
      <el-card class="box-card">
        <div v-html="analysisResult"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';

const selectedOptions = ref(['outline', 'summary']);
const analysisResult = ref('');

const handleFileChange = (file) => {
  console.log('Selected file:', file);
  // 这里可以处理文件上传逻辑
};

const analyzeLiterature = () => {
  if (selectedOptions.value.length === 0) {
    alert('请选择至少一个分析选项');
    return;
  }
  // 这里可以调用API接口进行文献分析（示例留空）
  analysisResult.value = '这是文献分析的结果（示例）。';
};
</script>

<style scoped>
h2 {
  margin-bottom: 0;
}
p {
  color: #606266;
  margin-top: 5px;
}
.upload-area {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
}
.analysis-options {
  display: flex;
  justify-content: center;
}
.box-card {
  white-space: pre-wrap;
}
</style> 