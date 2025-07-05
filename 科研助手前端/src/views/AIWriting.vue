<template>
  <div>
    <h2>AI 写作</h2>
    <p>分步骤生成文稿</p>
    <el-input
      v-model="inputText"
      type="textarea"
      :rows="6"
      placeholder="请输入写作提示..."
    ></el-input>
    <el-button type="primary" @click="generateContent" style="margin-top: 10px;">
      生成文稿
    </el-button>

    <div v-if="generatedText" style="margin-top: 20px;">
      <h3>生成结果：</h3>
      <el-card class="box-card">
        <pre>{{ generatedText }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const inputText = ref('');
const generatedText = ref('');

const generateContent = () => {
  // 模拟生成逻辑
  if (inputText.value.trim() === '') {
    alert('请输入写作提示');
    return;
  }
  generatedText.value = '这里是根据提示生成的文稿内容（示例）...';
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
.box-card {
  white-space: pre-wrap;
}
</style> 