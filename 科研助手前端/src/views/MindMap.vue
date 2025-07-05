<template>
  <div class="mind-map-view">
    <h2 class="main-title">思维导图</h2>
    <p class="subtitle">将智能搜索的结果或指定文本一键生成结构化的思维导图，便于梳理和理解</p>

    <div class="mind-map-container">
      <!-- 左侧输入和控制区域 -->
      <div class="input-panel">
        <!-- 输入区域 -->
        <div class="input-section">
          <h3>输入内容</h3>
          <el-tabs v-model="activeInputTab">
            <el-tab-pane label="文本输入" name="text">
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="12"
                placeholder="请输入需要生成思维导图的文本内容..."
              />
            </el-tab-pane>
            <el-tab-pane label="搜索结果" name="search">
              <div class="search-input">
                <el-input
                  v-model="searchQuery"
                  placeholder="输入搜索关键词..."
                >
                  <template #append>
                    <el-button @click="performSearch">搜索</el-button>
                  </template>
                </el-input>
              </div>
              <div v-if="isSearching" class="searching-indicator">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在搜索...</span>
              </div>
              <div v-else-if="searchResults.length > 0" class="search-results">
                <div v-for="(result, index) in searchResults" :key="index" class="search-result-item">
                  <h4>{{ result.title }}</h4>
                  <p>{{ result.snippet }}</p>
                  <div class="result-actions">
                    <el-button type="primary" size="small" @click="useSearchResult(result)">使用此结果</el-button>
                  </div>
                </div>
              </div>
              <div v-else-if="searchQuery && !isSearching" class="no-results">
                <el-empty description="未找到相关搜索结果" />
              </div>
            </el-tab-pane>
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
                    支持TXT、PDF、Word等文本格式文件
                  </div>
                </template>
              </el-upload>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 思维导图设置 -->
        <div class="map-settings">
          <h3>导图设置</h3>
          <el-form label-position="top">
            <el-form-item label="导图主题">
              <el-input v-model="mapSettings.title" placeholder="输入导图主题..." />
            </el-form-item>
            <el-form-item label="导图样式">
              <el-radio-group v-model="mapSettings.theme">
                <el-radio-button label="default">默认</el-radio-button>
                <el-radio-button label="primary">主题色</el-radio-button>
                <el-radio-button label="colorful">多彩</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="布局方向">
              <el-radio-group v-model="mapSettings.direction">
                <el-radio-button label="horizontal">水平</el-radio-button>
                <el-radio-button label="vertical">垂直</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="节点层级">
              <el-slider
                v-model="mapSettings.maxLevel"
                :min="2"
                :max="5"
                :marks="{
                  2: '简洁',
                  3: '适中',
                  4: '详细',
                  5: '全面'
                }"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button 
            type="primary" 
            :disabled="!canGenerateMap" 
            @click="generateMindMap"
            :loading="isGenerating"
          >
            生成思维导图
          </el-button>
          <el-button @click="resetAll">重置</el-button>
        </div>
      </div>

      <!-- 右侧思维导图展示区域 -->
      <div class="map-panel">
        <div class="map-header">
          <h3>思维导图</h3>
          <div class="map-actions" v-if="mindMapData">
            <el-tooltip content="下载为图片" placement="top">
              <el-button circle @click="downloadMap('png')">
                <el-icon><Picture /></el-icon>
              </el-button>
            </el-tooltip>
            <el-dropdown @command="handleExport">
              <el-button circle>
                <el-icon><Download /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="png">PNG图片</el-dropdown-item>
                  <el-dropdown-item command="svg">SVG矢量图</el-dropdown-item>
                  <el-dropdown-item command="pdf">PDF文档</el-dropdown-item>
                  <el-dropdown-item command="json">JSON数据</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="isGenerating" class="generating-indicator">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在生成思维导图，请稍候...</p>
        </div>

        <div v-else-if="!mindMapData" class="empty-map">
          <el-empty description="暂无思维导图" />
          <p>请输入文本并点击"生成思维导图"按钮</p>
        </div>

        <div v-else class="mind-map-canvas" ref="mindMapContainer">
          <!-- 这里将渲染思维导图 -->
          <div class="mind-map-placeholder">
            <img :src="getThemePreviewImage()" alt="思维导图预览" class="map-preview" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Picture, Download, Loading } from '@element-plus/icons-vue';

// 输入状态
const activeInputTab = ref('text');
const inputText = ref('');
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const uploadedFile = ref(null);

// 思维导图设置
const mapSettings = ref({
  title: '',
  theme: 'default',
  direction: 'horizontal',
  maxLevel: 3
});

// 结果状态
const isGenerating = ref(false);
const mindMapData = ref(null);
const mindMapContainer = ref(null);

// 计算是否可以生成思维导图
const canGenerateMap = computed(() => {
  if (activeInputTab.value === 'text') {
    return inputText.value.trim().length > 0;
  } else if (activeInputTab.value === 'search') {
    return searchResults.value.length > 0;
  } else if (activeInputTab.value === 'file') {
    return !!uploadedFile.value;
  }
  return false;
});

// 处理文件上传
const handleFileChange = (file) => {
  // 检查文件类型
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(file.raw.type) && !['pdf', 'doc', 'docx', 'txt'].includes(fileExtension)) {
    ElMessage.error('只支持TXT、PDF和Word格式文件');
    return false;
  }
  
  // 检查文件大小
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB');
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

// 执行搜索
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  
  isSearching.value = true;
  
  // 模拟搜索过程
  setTimeout(() => {
    // 模拟搜索结果
    searchResults.value = [
      {
        title: '人工智能基础概念',
        snippet: '人工智能(AI)是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。它包括机器学习、自然语言处理、计算机视觉等多个子领域。',
        content: '人工智能(AI)是计算机科学的一个分支，致力于创建能够模拟人类智能的系统。它包括机器学习、自然语言处理、计算机视觉等多个子领域。近年来，深度学习技术的突破使AI在图像识别、语音识别和自然语言理解等方面取得了显著进展。\n\n机器学习是AI的核心技术之一，它使计算机能够从数据中学习并改进，而无需明确编程。深度学习是机器学习的一个子集，使用多层神经网络来处理复杂的模式识别任务。\n\n自然语言处理(NLP)使计算机能够理解、解释和生成人类语言，应用包括机器翻译、情感分析和问答系统。计算机视觉则使机器能够从图像或视频中获取信息，应用于人脸识别、自动驾驶和医学影像分析等领域。'
      },
      {
        title: 'AI在各行业的应用',
        snippet: '随着技术的发展，AI已经开始在医疗、金融、教育和交通等多个行业中应用，为人类社会带来了诸多便利。',
        content: '随着技术的发展，AI已经开始在医疗、金融、教育和交通等多个行业中应用，为人类社会带来了诸多便利。\n\n在医疗领域，AI可以帮助医生诊断疾病、分析医学影像和开发新药。例如，基于深度学习的系统在某些癌症检测任务中已经达到或超过了人类专家的水平。\n\n在金融领域，AI被用于风险评估、欺诈检测和算法交易。智能系统可以分析大量数据，识别可能的欺诈行为，并在毫秒内做出交易决策。\n\n在教育方面，AI可以提供个性化学习体验，根据学生的能力和进度调整教学内容。智能辅导系统可以识别学生的弱点，并提供有针对性的练习。\n\n在交通领域，AI是自动驾驶技术的核心，也被用于交通流量优化和公共交通规划。智能交通系统可以减少拥堵，提高道路利用率。'
      },
      {
        title: 'AI的伦理和未来发展',
        snippet: 'AI技术的快速发展引发了关于隐私、安全和就业等方面的担忧。建立健全的AI伦理和监管框架变得越来越重要。',
        content: 'AI技术的快速发展引发了关于隐私、安全和就业等方面的担忧。建立健全的AI伦理和监管框架变得越来越重要。\n\n隐私问题：AI系统通常需要大量数据进行训练，这引发了关于数据收集和使用的隐私担忧。如何在利用数据的同时保护个人隐私是一个重要挑战。\n\n安全问题：随着AI系统在关键基础设施中的应用增加，确保这些系统的安全性和可靠性变得至关重要。恶意攻击或系统故障可能导致严重后果。\n\n就业问题：自动化技术可能会取代某些工作岗位，引发就业市场的变革。社会需要思考如何应对这一变化，包括再培训工人和创造新的就业机会。\n\n未来，随着算法的改进和计算能力的提升，AI技术将继续发展，可能会在更多领域发挥重要作用。同时，人类也需要思考如何与AI共存，确保技术发展的方向符合人类的长远利益。'
      }
    ];
    
    isSearching.value = false;
    ElMessage.success('搜索完成');
  }, 1500);
};

// 使用搜索结果
const useSearchResult = (result) => {
  inputText.value = result.content;
  activeInputTab.value = 'text';
  ElMessage.success('已加载搜索结果内容');
};

// 生成思维导图
const generateMindMap = () => {
  if (!canGenerateMap.value) {
    ElMessage.warning('请先输入文本内容');
    return;
  }
  
  isGenerating.value = true;
  
  // 获取输入内容
  let content = '';
  let title = mapSettings.value.title || '思维导图';
  
  if (activeInputTab.value === 'text') {
    content = inputText.value;
  } else if (activeInputTab.value === 'search') {
    const selectedResult = searchResults.value[0];
    content = selectedResult.content;
    if (!mapSettings.value.title) {
      title = selectedResult.title;
    }
  } else if (activeInputTab.value === 'file') {
    content = '这是文件内容示例，实际应用中需要从文件中提取文本。';
    if (!mapSettings.value.title) {
      title = uploadedFile.value.name.split('.')[0];
    }
  }
  
  // 模拟思维导图生成过程
  setTimeout(() => {
    // 模拟生成思维导图数据
    mindMapData.value = {
      title: title,
      theme: mapSettings.value.theme,
      direction: mapSettings.value.direction,
      content: content
    };
    
    isGenerating.value = false;
    ElMessage.success('思维导图生成成功');
  }, 2000);
};

// 下载思维导图
const downloadMap = (format) => {
  if (!mindMapData.value) {
    ElMessage.warning('请先生成思维导图');
    return;
  }
  
  ElMessage.success(`思维导图已下载为${format.toUpperCase()}格式`);
};

// 导出思维导图
const handleExport = (command) => {
  if (!mindMapData.value) {
    ElMessage.warning('请先生成思维导图');
    return;
  }
  
  ElMessage.success(`思维导图已导出为${command.toUpperCase()}格式`);
};

// 重置所有
const resetAll = () => {
  inputText.value = '';
  searchQuery.value = '';
  searchResults.value = [];
  uploadedFile.value = null;
  mapSettings.value = {
    title: '',
    theme: 'default',
    direction: 'horizontal',
    maxLevel: 3
  };
  mindMapData.value = null;
  activeInputTab.value = 'text';
  ElMessage.info('已重置所有内容');
};

// 获取主题预览图片
const getThemePreviewImage = () => {
  // 这里应该根据选择的主题返回不同的预览图片URL
  // 在实际应用中，可能需要使用真实的思维导图库来渲染
  const theme = mapSettings.value.theme;
  const direction = mapSettings.value.direction;
  
  // 模拟不同主题的预览图
  if (theme === 'default') {
    return direction === 'horizontal' 
      ? 'https://via.placeholder.com/800x400/f0f0f0/333333?text=默认主题-水平布局' 
      : 'https://via.placeholder.com/400x800/f0f0f0/333333?text=默认主题-垂直布局';
  } else if (theme === 'primary') {
    return direction === 'horizontal' 
      ? 'https://via.placeholder.com/800x400/e6f7ff/0076ff?text=主题色-水平布局' 
      : 'https://via.placeholder.com/400x800/e6f7ff/0076ff?text=主题色-垂直布局';
  } else if (theme === 'colorful') {
    return direction === 'horizontal' 
      ? 'https://via.placeholder.com/800x400/ffebee/ff4081?text=多彩主题-水平布局' 
      : 'https://via.placeholder.com/400x800/ffebee/ff4081?text=多彩主题-垂直布局';
  }
  
  return 'https://via.placeholder.com/800x400/f0f0f0/333333?text=思维导图预览';
};

// 组件挂载后的处理
onMounted(() => {
  // 在实际应用中，这里可以初始化思维导图库
});
</script>

<style scoped>
.mind-map-view {
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

.mind-map-container {
  display: flex;
  gap: 20px;
}

.input-panel {
  flex: 0 0 35%;
}

.map-panel {
  flex: 0 0 65%;
}

.input-section,
.map-settings {
  margin-bottom: 20px;
}

.map-settings {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.map-actions {
  display: flex;
  gap: 10px;
}

.searching-indicator,
.generating-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #666;
}

.generating-indicator {
  flex-direction: column;
  height: 400px;
}

.generating-indicator p {
  margin-top: 20px;
}

.search-results {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.search-result-item h4 {
  margin: 0 0 5px 0;
  color: #0076ff;
}

.search-result-item p {
  margin: 0 0 10px 0;
  color: #666;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
}

.no-results,
.empty-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.no-results p,
.empty-map p {
  margin-top: 20px;
  color: #666;
}

.mind-map-canvas {
  height: 500px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.mind-map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.map-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style> 