<template>
  <div class="report-generation-view">
    <h2 class="main-title">报告生成</h2>
    <p class="subtitle">基于预设模板快速填充内容，一键生成报告，并支持导出PDF/Word格式</p>

    <!-- 模板选择区域 -->
    <div class="template-selection">
      <h3>选择报告模板</h3>
      <el-radio-group v-model="selectedTemplate" size="large">
        <el-radio-button v-for="template in templates" :key="template.id" :label="template.id">
          {{ template.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 内容填充区域 -->
    <div class="content-area">
      <h3>填充内容</h3>
      <div v-if="selectedTemplate">
        <div v-for="(field, index) in currentTemplate.fields" :key="index" class="field-item">
          <h4>{{ field.label }}</h4>
          <el-input 
            v-if="field.type === 'text'" 
            v-model="fieldValues[field.name]" 
            :placeholder="field.placeholder"
          />
          <el-input 
            v-else-if="field.type === 'textarea'" 
            v-model="fieldValues[field.name]" 
            :placeholder="field.placeholder"
            type="textarea"
            :rows="4"
          />
          <el-upload
            v-else-if="field.type === 'file'"
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                {{ field.placeholder }}
              </div>
            </template>
          </el-upload>
        </div>

        <!-- AI辅助填充按钮 -->
        <div class="ai-assist">
          <el-button type="success" @click="aiAssistFill">
            <el-icon><Magic /></el-icon>
            AI辅助填充
          </el-button>
          <p class="tip">点击使用AI智能填充内容</p>
        </div>
      </div>
      <div v-else class="no-template">
        请先选择一个报告模板
      </div>
    </div>

    <!-- 预览和导出区域 -->
    <div class="action-area">
      <el-button type="primary" @click="previewReport" :disabled="!selectedTemplate">预览报告</el-button>
      <el-dropdown @command="handleExport">
        <el-button type="success" :disabled="!selectedTemplate">
          导出报告
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
            <el-dropdown-item command="word">导出为Word</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 报告预览对话框 -->
    <el-dialog v-model="previewVisible" title="报告预览" width="70%">
      <div class="report-preview">
        <h1>{{ currentTemplate?.name }}</h1>
        <div v-for="(field, index) in currentTemplate?.fields" :key="index" class="preview-field">
          <h3>{{ field.label }}</h3>
          <p>{{ fieldValues[field.name] || '未填写' }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleExport('pdf')">导出PDF</el-button>
          <el-button type="success" @click="handleExport('word')">导出Word</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowDown, Magic } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 模板数据
const templates = [
  { 
    id: 'research-report', 
    name: '科研报告', 
    fields: [
      { name: 'title', label: '报告标题', type: 'text', placeholder: '请输入报告标题' },
      { name: 'abstract', label: '摘要', type: 'textarea', placeholder: '请输入报告摘要' },
      { name: 'introduction', label: '引言', type: 'textarea', placeholder: '请输入引言内容' },
      { name: 'methodology', label: '研究方法', type: 'textarea', placeholder: '请描述研究方法' },
      { name: 'results', label: '研究结果', type: 'textarea', placeholder: '请描述研究结果' },
      { name: 'conclusion', label: '结论', type: 'textarea', placeholder: '请输入结论' },
      { name: 'references', label: '参考文献', type: 'textarea', placeholder: '请输入参考文献' }
    ]
  },
  { 
    id: 'project-proposal', 
    name: '项目提案', 
    fields: [
      { name: 'title', label: '项目名称', type: 'text', placeholder: '请输入项目名称' },
      { name: 'summary', label: '项目概述', type: 'textarea', placeholder: '请概述项目内容' },
      { name: 'objectives', label: '项目目标', type: 'textarea', placeholder: '请描述项目目标' },
      { name: 'methodology', label: '实施方法', type: 'textarea', placeholder: '请描述实施方法' },
      { name: 'timeline', label: '时间线', type: 'textarea', placeholder: '请提供项目时间线' },
      { name: 'budget', label: '预算', type: 'textarea', placeholder: '请提供项目预算' },
      { name: 'team', label: '团队成员', type: 'textarea', placeholder: '请列出团队成员' }
    ]
  },
  { 
    id: 'experiment-report', 
    name: '实验报告', 
    fields: [
      { name: 'title', label: '实验标题', type: 'text', placeholder: '请输入实验标题' },
      { name: 'objective', label: '实验目的', type: 'textarea', placeholder: '请描述实验目的' },
      { name: 'equipment', label: '实验设备', type: 'textarea', placeholder: '请列出实验设备' },
      { name: 'procedure', label: '实验步骤', type: 'textarea', placeholder: '请描述实验步骤' },
      { name: 'data', label: '实验数据', type: 'textarea', placeholder: '请输入实验数据' },
      { name: 'analysis', label: '数据分析', type: 'textarea', placeholder: '请分析实验数据' },
      { name: 'conclusion', label: '实验结论', type: 'textarea', placeholder: '请输入实验结论' }
    ]
  }
];

// 响应式状态
const selectedTemplate = ref('');
const fieldValues = ref({});
const previewVisible = ref(false);
const uploadedFiles = ref([]);

// 计算当前选择的模板
const currentTemplate = computed(() => {
  return templates.find(t => t.id === selectedTemplate.value);
});

// 处理文件上传
const handleFileChange = (file) => {
  uploadedFiles.value.push(file);
  ElMessage.success(`文件 ${file.name} 已选择`);
};

// AI辅助填充
const aiAssistFill = () => {
  ElMessage.info('正在使用AI智能填充内容...');
  // 模拟AI填充过程
  setTimeout(() => {
    if (selectedTemplate.value === 'research-report') {
      fieldValues.value = {
        title: '基于深度学习的图像识别研究',
        abstract: '本研究探讨了深度学习在图像识别领域的应用，通过对比不同模型的性能，提出了一种改进的卷积神经网络结构，实验表明该结构在准确率和处理速度方面均有显著提升。',
        introduction: '随着人工智能技术的快速发展，深度学习在图像识别领域展现出巨大潜力...',
        methodology: '本研究采用了对比实验法，选取了ResNet、VGG和自研模型进行性能对比...',
        results: '实验结果表明，改进后的模型在CIFAR-10数据集上的准确率达到95.7%，比基准模型提高了2.3个百分点...',
        conclusion: '通过本研究，我们证明了所提出的改进模型在图像识别任务中的有效性...',
        references: '1. He, K., et al. (2016). Deep Residual Learning for Image Recognition.\n2. Simonyan, K., & Zisserman, A. (2014). Very Deep Convolutional Networks for Large-Scale Image Recognition.'
      };
    } else if (selectedTemplate.value === 'project-proposal') {
      // 其他模板的AI填充内容
      fieldValues.value = {
        title: '智能城市交通流量优化系统',
        summary: '本项目旨在开发一套基于AI的城市交通流量优化系统，通过实时数据分析和预测，为城市交通管理提供决策支持。',
        objectives: '1. 减少交通拥堵时间30%\n2. 降低交通事故率15%\n3. 提高公共交通使用率20%',
        methodology: '本项目将采用机器学习和大数据分析技术，结合城市交通实时数据，构建交通流量预测模型...',
        timeline: '第一阶段(3个月)：数据收集与清洗\n第二阶段(4个月)：模型开发与测试\n第三阶段(2个月)：系统集成\n第四阶段(3个月)：试运行与优化',
        budget: '研发人员费用：50万元\n硬件设备：30万元\n软件许可：10万元\n运营费用：20万元\n总计：110万元',
        team: '项目经理：张三\n技术负责人：李四\n数据科学家：王五\n软件工程师：赵六、钱七'
      };
    }
    ElMessage.success('AI智能填充完成！');
  }, 1500);
};

// 预览报告
const previewReport = () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择一个报告模板');
    return;
  }
  previewVisible.value = true;
};

// 导出报告
const handleExport = (format) => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择一个报告模板');
    return;
  }
  ElMessage.success(`报告已导出为${format === 'pdf' ? 'PDF' : 'Word'}格式`);
  // 实际导出逻辑将连接到后端API
};
</script>

<style scoped>
.report-generation-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.main-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 30px;
}

.template-selection,
.content-area,
.action-area {
  margin-bottom: 30px;
}

.field-item {
  margin-bottom: 20px;
}

.field-item h4 {
  margin-bottom: 8px;
  color: #333;
}

.ai-assist {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tip {
  font-size: 0.9rem;
  color: #999;
  margin-top: 8px;
}

.action-area {
  display: flex;
  gap: 16px;
}

.no-template {
  text-align: center;
  padding: 30px;
  color: #999;
}

.report-preview {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}

.preview-field {
  margin-bottom: 20px;
}

.preview-field h3 {
  margin-bottom: 8px;
  color: #333;
}

.preview-field p {
  white-space: pre-wrap;
  color: #666;
}
</style> 