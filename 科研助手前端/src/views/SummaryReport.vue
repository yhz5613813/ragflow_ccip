<template>
  <div>
    <h2>总结汇报</h2>
    <p>凝练你的工作成效</p>

    <!-- 内容输入 -->
    <el-input
      v-model="content"
      type="textarea"
      :rows="6"
      placeholder="请输入需要总结的内容..."
    ></el-input>

    <!-- 总结选项 -->
    <div class="summary-options" style="margin-top: 20px;">
      <el-form :model="summaryOptions" label-width="100px">
        <el-form-item label="总结类型">
          <el-select v-model="summaryOptions.type" placeholder="请选择总结类型">
            <el-option label="工作汇报" value="work" />
            <el-option label="会议纪要" value="meeting" />
            <el-option label="项目总结" value="project" />
            <el-option label="学习笔记" value="study" />
          </el-select>
        </el-form-item>
        <el-form-item label="总结重点">
          <el-checkbox-group v-model="summaryOptions.highlights">
            <el-checkbox label="achievements">成果展示</el-checkbox>
            <el-checkbox label="problems">问题分析</el-checkbox>
            <el-checkbox label="solutions">解决方案</el-checkbox>
            <el-checkbox label="nextSteps">后续计划</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="总结长度">
          <el-radio-group v-model="summaryOptions.length">
            <el-radio label="short">简短</el-radio>
            <el-radio label="medium">适中</el-radio>
            <el-radio label="long">详细</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" @click="generateSummary" style="margin-top: 20px;">
      生成总结
    </el-button>

    <!-- 总结结果 -->
    <div v-if="summaryResult" style="margin-top: 20px;">
      <h3>总结结果：</h3>
      <el-card class="box-card">
        <div v-html="summaryResult"></div>
        <div style="margin-top: 10px;">
          <el-button type="success" @click="copySummary">复制总结</el-button>
          <el-button type="primary" @click="exportSummary">导出文档</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const content = ref('');
const summaryResult = ref('');

const summaryOptions = reactive({
  type: 'work',
  highlights: ['achievements', 'nextSteps'],
  length: 'medium'
});

const generateSummary = () => {
  if (content.value.trim() === '') {
    alert('请输入需要总结的内容');
    return;
  }
  // 这里可以调用API接口生成总结（示例留空）
  summaryResult.value = '这是生成的总结内容（示例）。';
};

const copySummary = () => {
  if (summaryResult.value) {
    navigator.clipboard.writeText(summaryResult.value)
      .then(() => alert('总结已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err));
  }
};

const exportSummary = () => {
  // 这里可以实现导出文档的功能
  alert('导出功能开发中...');
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
.summary-options {
  max-width: 600px;
  margin: 0 auto;
}
.box-card {
  white-space: pre-wrap;
}
</style> 