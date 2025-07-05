<template>
  <div class="document-summary-view">
    <h2 class="main-title">文档摘要</h2>
    <p class="subtitle">快速提取和总结上传文档或长文本的核心要点，生成精炼的摘要</p>

    <div class="summary-container">
      <!-- 左侧上传和控制区域 -->
      <div class="input-panel">
        <!-- 文档上传区域 -->
        <div class="upload-section">
          <h3>上传文档</h3>
          <el-tabs v-model="activeInputTab">
            <el-tab-pane label="上传文件" name="file">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :limit="1"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽文件到此处或 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持PDF、Word、TXT等格式，单个文件不超过20MB
                  </div>
                </template>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="粘贴文本" name="text">
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="10"
                placeholder="请在此处粘贴需要摘要的文本内容..."
              />
            </el-tab-pane>
            <el-tab-pane label="网页链接" name="url">
              <el-input
                v-model="inputUrl"
                placeholder="请输入网页URL地址..."
              >
                <template #append>
                  <el-button @click="fetchUrlContent">获取内容</el-button>
                </template>
              </el-input>
              <div v-if="isUrlLoading" class="url-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                正在获取网页内容...
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 摘要设置区域 -->
        <div class="summary-settings">
          <h3>摘要设置</h3>
          <el-form label-position="top">
            <el-form-item label="摘要长度">
              <el-slider
                v-model="summarySettings.length"
                :min="1"
                :max="5"
                :marks="{
                  1: '极简',
                  2: '简短',
                  3: '适中',
                  4: '详细',
                  5: '全面'
                }"
              />
            </el-form-item>
            <el-form-item label="摘要风格">
              <el-radio-group v-model="summarySettings.style">
                <el-radio-button label="concise">简洁</el-radio-button>
                <el-radio-button label="academic">学术</el-radio-button>
                <el-radio-button label="creative">创意</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="关键点提取">
              <el-checkbox v-model="summarySettings.extractKeyPoints">提取关键点</el-checkbox>
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="summarySettings.language" placeholder="选择摘要语言">
                <el-option label="中文" value="zh" />
                <el-option label="英文" value="en" />
                <el-option label="日文" value="ja" />
                <el-option label="韩文" value="ko" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <el-button 
            type="primary" 
            :disabled="!canGenerateSummary" 
            @click="generateSummary"
            :loading="isGenerating"
          >
            生成摘要
          </el-button>
          <el-button @click="resetAll">重置</el-button>
        </div>
      </div>

      <!-- 右侧摘要结果区域 -->
      <div class="result-panel">
        <div class="result-header">
          <h3>摘要结果</h3>
          <div class="result-actions" v-if="summaryResult">
            <el-tooltip content="复制摘要" placement="top">
              <el-button circle @click="copySummary">
                <el-icon><Document /></el-icon>
              </el-button>
            </el-tooltip>
            <el-dropdown @command="handleExport">
              <el-button circle>
                <el-icon><Download /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="txt">导出为TXT</el-dropdown-item>
                  <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
                  <el-dropdown-item command="word">导出为Word</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="isGenerating" class="generating-indicator">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在生成摘要，请稍候...</p>
        </div>

        <div v-else-if="!summaryResult" class="empty-result">
          <el-empty description="暂无摘要结果" />
          <p>请上传文档或输入文本并点击"生成摘要"按钮</p>
        </div>

        <div v-else class="summary-result">
          <el-tabs v-model="activeResultTab">
            <el-tab-pane label="摘要" name="summary">
              <div class="summary-content">
                <h4>{{ summaryResult.title }}</h4>
                <div class="summary-text">{{ summaryResult.summary }}</div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="关键点" name="keypoints" v-if="summarySettings.extractKeyPoints && summaryResult.keyPoints">
              <div class="keypoints-content">
                <h4>关键要点</h4>
                <ul class="keypoints-list">
                  <li v-for="(point, index) in summaryResult.keyPoints" :key="index">
                    {{ point }}
                  </li>
                </ul>
              </div>
            </el-tab-pane>
            <el-tab-pane label="原文对照" name="compare" v-if="summaryResult.originalText">
              <div class="compare-content">
                <div class="original-text">
                  <h4>原文</h4>
                  <div class="text-content">{{ summaryResult.originalText }}</div>
                </div>
                <div class="summary-text">
                  <h4>摘要</h4>
                  <div class="text-content">{{ summaryResult.summary }}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Document, Download, Loading } from '@element-plus/icons-vue';

// 输入状态
const activeInputTab = ref('file');
const inputText = ref('');
const inputUrl = ref('');
const uploadedFile = ref(null);
const isUrlLoading = ref(false);

// 摘要设置
const summarySettings = ref({
  length: 3,
  style: 'concise',
  extractKeyPoints: true,
  language: 'zh'
});

// 结果状态
const isGenerating = ref(false);
const summaryResult = ref(null);
const activeResultTab = ref('summary');

// 计算是否可以生成摘要
const canGenerateSummary = computed(() => {
  if (activeInputTab.value === 'file') {
    return !!uploadedFile.value;
  } else if (activeInputTab.value === 'text') {
    return inputText.value.trim().length > 0;
  } else if (activeInputTab.value === 'url') {
    return inputUrl.value.trim().length > 0;
  }
  return false;
});

// 处理文件上传
const handleFileChange = (file) => {
  // 检查文件类型
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(file.raw.type) && !['pdf', 'doc', 'docx', 'txt'].includes(fileExtension)) {
    ElMessage.error('只支持PDF、Word和TXT格式文件');
    return false;
  }
  
  // 检查文件大小
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过20MB');
    return false;
  }
  
  uploadedFile.value = file;
  ElMessage.success(`文件 ${file.name} 已添加`);
  return true;
};

// 移除文件
const handleFileRemove = () => {
  uploadedFile.value = null;
};

// 获取URL内容
const fetchUrlContent = () => {
  if (!inputUrl.value.trim()) {
    ElMessage.warning('请输入有效的URL地址');
    return;
  }
  
  // 验证URL格式
  try {
    new URL(inputUrl.value);
  } catch (e) {
    ElMessage.error('请输入有效的URL地址');
    return;
  }
  
  isUrlLoading.value = true;
  
  // 模拟获取URL内容
  setTimeout(() => {
    inputText.value = `这是从URL ${inputUrl.value} 获取的示例内容。\n\n人工智能（AI）是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。它包括机器学习、自然语言处理、计算机视觉等多个子领域。近年来，深度学习技术的突破使AI在图像识别、语音识别和自然语言理解等方面取得了显著进展。\n\n随着技术的发展，AI已经开始在医疗、金融、教育和交通等多个行业中应用，为人类社会带来了诸多便利。然而，AI技术的快速发展也引发了关于隐私、安全和就业等方面的担忧。因此，建立健全的AI伦理和监管框架变得越来越重要。\n\n未来，随着算法的改进和计算能力的提升，AI技术将继续发展，可能会在更多领域发挥重要作用。同时，人类也需要思考如何与AI共存，确保技术发展的方向符合人类的长远利益。`;
    
    activeInputTab.value = 'text';
    isUrlLoading.value = false;
    ElMessage.success('网页内容获取成功');
  }, 2000);
};

// 生成摘要
const generateSummary = () => {
  if (!canGenerateSummary.value) {
    ElMessage.warning('请先上传文档或输入文本');
    return;
  }
  
  isGenerating.value = true;
  
  // 获取输入内容
  let content = '';
  let title = '';
  
  if (activeInputTab.value === 'file') {
    title = uploadedFile.value.name;
    content = '这是文件内容示例，实际应用中需要从文件中提取文本。';
  } else if (activeInputTab.value === 'text') {
    title = '文本摘要';
    content = inputText.value;
  } else if (activeInputTab.value === 'url') {
    title = `URL: ${inputUrl.value}`;
    content = inputText.value;
  }
  
  // 模拟摘要生成过程
  setTimeout(() => {
    // 根据设置生成不同的摘要
    let summary = '';
    let keyPoints = [];
    
    if (summarySettings.value.style === 'concise') {
      summary = '人工智能是模拟人类智能的计算机科学分支，包括机器学习、自然语言处理和计算机视觉等领域。近年来深度学习技术使AI在多个应用领域取得突破。AI已应用于医疗、金融等行业，但也引发隐私和就业担忧，需要建立伦理和监管框架。未来AI将继续发展，人类需思考如何与AI共存。';
      keyPoints = [
        'AI是模拟人类智能的计算机科学分支',
        '深度学习技术促使AI在多领域取得突破',
        'AI已在医疗、金融等行业应用',
        'AI发展引发隐私、安全和就业担忧',
        '需要建立AI伦理和监管框架',
        '人类需思考如何与AI共存'
      ];
    } else if (summarySettings.value.style === 'academic') {
      summary = '本文探讨了人工智能(AI)作为计算机科学分支的发展现状与未来趋势。研究表明，AI包含机器学习、自然语言处理和计算机视觉等多个子领域，其中深度学习技术的进步显著提升了AI在图像识别、语音识别和自然语言理解等方面的能力。分析发现，AI技术已广泛应用于医疗、金融、教育和交通等行业，但同时引发了关于隐私保护、信息安全和就业市场变革的社会问题。本研究指出，建立完善的AI伦理和监管体系对确保技术发展方向符合人类长远利益具有重要意义。';
      keyPoints = [
        'AI是包含多个子领域的计算机科学分支',
        '深度学习技术显著提升了AI在多个方面的能力',
        'AI技术已在多个行业得到应用',
        'AI发展引发了隐私、安全和就业等社会问题',
        '建立AI伦理和监管体系具有重要意义',
        '需确保AI发展方向符合人类长远利益'
      ];
    } else if (summarySettings.value.style === 'creative') {
      summary = '智能的火花在数字世界中闪耀——AI，这个人类智慧的数字孪生，正以惊人的速度成长。从深度学习的突破到图像识别的精准，AI已不再是科幻小说中的想象。它悄然融入我们的生活，在医院诊断疾病，在金融市场预测趋势，在教室个性化学习体验。然而，这把双刃剑也带来了隐私的迷雾和职业的不确定性。我们站在技术与伦理的十字路口，需要共同绘制AI与人类和谐共处的蓝图，让智能的火花照亮而不是燃烧我们的未来。';
      keyPoints = [
        'AI是人类智慧的数字延伸',
        '深度学习带来AI能力的飞跃',
        'AI已融入医疗、金融、教育等多个领域',
        'AI发展带来隐私和职业不确定性',
        '需要在技术与伦理间取得平衡',
        '构建AI与人类和谐共处的未来'
      ];
    }
    
    // 根据长度调整摘要
    const lengthFactor = summarySettings.value.length;
    if (lengthFactor < 3) {
      // 缩短摘要
      const sentences = summary.split('。');
      summary = sentences.slice(0, Math.max(1, Math.floor(sentences.length * lengthFactor / 3))).join('。') + '。';
      keyPoints = keyPoints.slice(0, Math.max(3, Math.floor(keyPoints.length * lengthFactor / 3)));
    } else if (lengthFactor > 3) {
      // 实际应用中可能需要更详细的摘要生成逻辑
      summary += '\n\n此外，AI技术的发展还促进了跨学科研究和创新。例如，AI与生物技术的结合加速了药物研发过程；AI与材料科学的结合帮助发现了新型材料。随着量子计算等前沿技术的发展，AI的能力可能会得到进一步提升。同时，人机协作模式也在不断演进，探索如何最大化人类创造力和AI计算能力的结合成为重要研究方向。';
    }
    
    // 设置结果
    summaryResult.value = {
      title: title,
      summary: summary,
      keyPoints: summarySettings.value.extractKeyPoints ? keyPoints : null,
      originalText: content
    };
    
    isGenerating.value = false;
    activeResultTab.value = 'summary';
    ElMessage.success('摘要生成成功');
  }, 3000);
};

// 复制摘要
const copySummary = () => {
  if (!summaryResult.value || !summaryResult.value.summary) {
    ElMessage.warning('没有可复制的摘要');
    return;
  }
  
  navigator.clipboard.writeText(summaryResult.value.summary)
    .then(() => {
      ElMessage.success('摘要已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};

// 导出摘要
const handleExport = (format) => {
  if (!summaryResult.value || !summaryResult.value.summary) {
    ElMessage.warning('没有可导出的摘要');
    return;
  }
  
  if (format === 'txt') {
    const text = summaryResult.value.summary;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // 其他格式需要后端支持
    ElMessage.success(`摘要已导出为${format.toUpperCase()}格式`);
  }
};

// 重置所有
const resetAll = () => {
  inputText.value = '';
  inputUrl.value = '';
  uploadedFile.value = null;
  summarySettings.value = {
    length: 3,
    style: 'concise',
    extractKeyPoints: true,
    language: 'zh'
  };
  summaryResult.value = null;
  activeInputTab.value = 'file';
  ElMessage.info('已重置所有内容');
};
</script>

<style scoped>
.document-summary-view {
  max-width: 1200px;
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

.summary-container {
  display: flex;
  gap: 20px;
}

.input-panel {
  flex: 0 0 40%;
}

.result-panel {
  flex: 0 0 60%;
}

.upload-section,
.summary-settings {
  margin-bottom: 20px;
}

.summary-settings {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.generating-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.generating-indicator p {
  margin-top: 20px;
  color: #666;
}

.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.empty-result p {
  margin-top: 20px;
  color: #666;
}

.summary-result {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  padding: 15px;
}

.summary-content,
.keypoints-content {
  padding: 10px;
}

.summary-content h4,
.keypoints-content h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.summary-text {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.keypoints-list {
  padding-left: 20px;
}

.keypoints-list li {
  margin-bottom: 10px;
  line-height: 1.5;
}

.compare-content {
  display: flex;
  gap: 20px;
}

.original-text,
.summary-text {
  flex: 1;
}

.text-content {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.url-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: #666;
}
</style>