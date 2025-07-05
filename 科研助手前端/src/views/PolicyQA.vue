<template>
  <div>
    <h2>政策问答</h2>
    <p>理解政策，解读政策</p>
    <el-input
      v-model="policyQuery"
      type="textarea"
      :rows="4"
      placeholder="请输入政策相关问题..."
    ></el-input>
    <el-button type="primary" @click="getPolicyAnswer" style="margin-top: 10px;">
      获取解答
    </el-button>

    <div v-if="policyAnswer" style="margin-top: 20px;">
      <h3>政策解读：</h3>
      <el-card class="box-card">
        <div v-html="policyAnswer"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const policyQuery = ref('');
const policyAnswer = ref('');

const getPolicyAnswer = () => {
  if (policyQuery.value.trim() === '') {
    alert('请输入政策相关问题');
    return;
  }
  // 这里可以调用API接口获取政策解读（示例留空）
  policyAnswer.value = '这是根据问题生成的政策解读内容（示例）。';
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