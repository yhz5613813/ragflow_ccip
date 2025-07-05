<template>
  <div>
    <h2>PPT生成</h2>
    <p>打造精彩的演讲内容</p>

    <!-- 主题输入 -->
    <el-input
      v-model="presentationTopic"
      placeholder="请输入演讲主题"
      style="width: 400px;"
    ></el-input>

    <!-- PPT选项 -->
    <div class="ppt-options" style="margin-top: 20px;">
      <el-form :model="pptOptions" label-width="100px">
        <el-form-item label="风格">
          <el-select v-model="pptOptions.style" placeholder="请选择PPT风格">
            <el-option label="商务简约" value="business" />
            <el-option label="科技感" value="tech" />
            <el-option label="创意设计" value="creative" />
            <el-option label="学术报告" value="academic" />
          </el-select>
        </el-form-item>
        <el-form-item label="页数">
          <el-input-number v-model="pptOptions.slides" :min="5" :max="50" />
        </el-form-item>
        <el-form-item label="包含内容">
          <el-checkbox-group v-model="pptOptions.contents">
            <el-checkbox label="目录">目录</el-checkbox>
            <el-checkbox label="图表">图表</el-checkbox>
            <el-checkbox label="动画">动画</el-checkbox>
            <el-checkbox label="备注">备注</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" @click="generatePPT" style="margin-top: 20px;">
      生成PPT
    </el-button>

    <!-- 生成结果 -->
    <div v-if="pptPreview" style="margin-top: 20px;">
      <h3>预览：</h3>
      <el-card class="box-card">
        <div class="preview-content">
          <img :src="pptPreview" alt="PPT预览" style="max-width: 100%;" />
        </div>
        <div style="margin-top: 10px;">
          <el-button type="success" @click="downloadPPT">下载PPT</el-button>
          <el-button type="primary" @click="editPPT">在线编辑</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const presentationTopic = ref('');
const pptPreview = ref('');

const pptOptions = reactive({
  style: 'business',
  slides: 10,
  contents: ['目录', '图表']
});

const generatePPT = () => {
  if (presentationTopic.value.trim() === '') {
    alert('请输入演讲主题');
    return;
  }
  // 这里可以调用API接口生成PPT（示例留空）
  pptPreview.value = 'https://example.com/ppt-preview.png';
};

const downloadPPT = () => {
  if (pptPreview.value) {
    const link = document.createElement('a');
    link.href = pptPreview.value;
    link.download = '演讲PPT.pptx';
    link.click();
  }
};

const editPPT = () => {
  // 这里可以实现在线编辑功能
  alert('在线编辑功能开发中...');
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
.ppt-options {
  max-width: 600px;
  margin: 0 auto;
}
.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.box-card {
  white-space: pre-wrap;
}
</style> 