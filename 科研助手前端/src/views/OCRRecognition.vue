<template>
  <div class="ocr-recognition-view">
    <h2 class="main-title">OCR识别</h2>
    <p class="subtitle">快速识别图片或PDF中的文字，并将其转换为可编辑、可检索的文本格式</p>

    <div class="ocr-container">
      <!-- 左侧上传区域 -->
      <div class="upload-panel">
        <h3>上传文件</h3>
        <div class="upload-area">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            :limit="5"
            multiple
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持JPG/PNG/PDF等格式，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </div>

        <div class="file-list" v-if="fileList.length > 0">
          <h4>待处理文件 ({{ fileList.length }})</h4>
          <el-table :data="fileList" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="100">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click="showPreview(scope.row)"
                >
                  预览
                </el-button>
                <el-button 
                  link 
                  type="danger" 
                  size="small"
                  @click="removeFile(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="action-buttons">
          <el-button 
            type="primary" 
            :disabled="fileList.length === 0" 
            @click="processFiles"
          >
            开始识别
          </el-button>
          <el-button 
            type="danger" 
            :disabled="fileList.length === 0" 
            @click="clearFiles"
          >
            清空文件
          </el-button>
        </div>

        <!-- OCR设置 -->
        <div class="ocr-settings">
          <h4>OCR设置</h4>
          <el-form label-position="top">
            <el-form-item label="识别语言">
              <el-select v-model="ocrSettings.language" placeholder="选择识别语言">
                <el-option label="中文" value="zh-CN" />
                <el-option label="英文" value="en-US" />
                <el-option label="日文" value="ja-JP" />
                <el-option label="韩文" value="ko-KR" />
                <el-option label="多语言" value="multi" />
              </el-select>
            </el-form-item>
            <el-form-item label="识别模式">
              <el-radio-group v-model="ocrSettings.mode">
                <el-radio-button label="text">文本识别</el-radio-button>
                <el-radio-button label="table">表格识别</el-radio-button>
                <el-radio-button label="layout">版面分析</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="高级设置">
              <el-checkbox v-model="ocrSettings.enhanceImage">图像增强</el-checkbox>
              <el-checkbox v-model="ocrSettings.autoRotate">自动旋转</el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 右侧结果区域 -->
      <div class="result-panel">
        <div class="result-header">
          <h3>识别结果</h3>
          <div class="result-actions" v-if="ocrResult">
            <el-tooltip content="复制全部文本" placement="top">
              <el-button circle @click="copyText">
                <el-icon><Document /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="下载为TXT" placement="top">
              <el-button circle @click="downloadText('txt')">
                <el-icon><Download /></el-icon>
              </el-button>
            </el-tooltip>
            <el-dropdown @command="handleExport">
              <el-button circle>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="word">导出为Word</el-dropdown-item>
                  <el-dropdown-item command="pdf">导出为PDF</el-dropdown-item>
                  <el-dropdown-item command="excel">导出为Excel</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="isProcessing" class="processing-indicator">
          <el-progress 
            type="circle" 
            :percentage="processingProgress" 
            :status="processingProgress === 100 ? 'success' : ''"
          />
          <p>{{ processingStatus }}</p>
        </div>

        <div v-else-if="!ocrResult" class="empty-result">
          <el-empty description="暂无识别结果" />
          <p>请上传文件并点击"开始识别"按钮</p>
        </div>

        <div v-else class="result-content">
          <el-tabs v-model="activeResultTab" type="card">
            <el-tab-pane label="文本视图" name="text">
              <div class="text-result">
                <el-input
                  v-model="ocrResult.text"
                  type="textarea"
                  :rows="15"
                  placeholder="识别结果将显示在这里"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="原图对照" name="compare" v-if="ocrResult.imageUrl">
              <div class="compare-result">
                <div class="image-container">
                  <img :src="ocrResult.imageUrl" alt="原图" />
                </div>
                <div class="text-container">
                  <el-input
                    v-model="ocrResult.text"
                    type="textarea"
                    :rows="15"
                    placeholder="识别结果将显示在这里"
                  />
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="表格视图" name="table" v-if="ocrSettings.mode === 'table' && ocrResult.tableData">
              <div class="table-result">
                <el-table :data="ocrResult.tableData" border style="width: 100%">
                  <el-table-column 
                    v-for="(col, index) in ocrResult.tableColumns" 
                    :key="index"
                    :prop="col.prop"
                    :label="col.label"
                  />
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="文件预览" width="70%">
      <div class="file-preview">
        <img v-if="previewFile && isImageFile(previewFile)" :src="previewUrl" alt="文件预览" />
        <iframe v-else-if="previewFile && isPdfFile(previewFile)" :src="previewUrl" width="100%" height="500"></iframe>
        <div v-else class="preview-not-available">
          <el-empty description="预览不可用" />
          <p>此文件类型不支持预览</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Document, Download, More } from '@element-plus/icons-vue';

// 状态变量
const fileList = ref([]);
const ocrSettings = ref({
  language: 'zh-CN',
  mode: 'text',
  enhanceImage: true,
  autoRotate: true
});
const isProcessing = ref(false);
const processingProgress = ref(0);
const processingStatus = ref('');
const ocrResult = ref(null);
const activeResultTab = ref('text');
const previewDialogVisible = ref(false);
const previewFile = ref(null);
const previewUrl = ref('');

// 处理文件变化
const handleFileChange = (file) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('只支持JPG、PNG和PDF格式文件');
    return false;
  }
  
  // 检查文件大小
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB');
    return false;
  }
  
  ElMessage.success(`文件 ${file.name} 已添加`);
  return true;
};

// 移除文件
const handleFileRemove = (file) => {
  ElMessage.info(`文件 ${file.name} 已移除`);
};

const removeFile = (file) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
    ElMessage.info(`文件 ${file.name} 已移除`);
  }
};

// 清空文件列表
const clearFiles = () => {
  fileList.value = [];
  ElMessage.info('文件列表已清空');
};

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
};

// 预览文件
const showPreview = (file) => {
  previewFile.value = file;
  
  // 为了演示，这里直接创建一个临时URL
  // 实际应用中，可能需要从服务器获取预览URL
  if (file.raw) {
    previewUrl.value = URL.createObjectURL(file.raw);
    previewDialogVisible.value = true;
  } else {
    ElMessage.error('无法预览文件');
  }
};

// 判断文件类型
const isImageFile = (file) => {
  return file.raw && (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png');
};

const isPdfFile = (file) => {
  return file.raw && file.raw.type === 'application/pdf';
};

// 处理文件
const processFiles = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传文件');
    return;
  }
  
  isProcessing.value = true;
  processingProgress.value = 0;
  processingStatus.value = '正在准备识别...';
  
  // 模拟OCR处理过程
  const totalFiles = fileList.value.length;
  let processedFiles = 0;
  
  const processInterval = setInterval(() => {
    processingProgress.value += Math.floor(100 / (totalFiles * 5));
    
    if (processingProgress.value >= 100) {
      processingProgress.value = 100;
      clearInterval(processInterval);
      
      // 模拟OCR结果
      setTimeout(() => {
        isProcessing.value = false;
        
        // 根据模式生成不同的结果
        if (ocrSettings.value.mode === 'text') {
          ocrResult.value = {
            text: '这是识别出的文本内容示例。\n\n北京是中国的首都，位于华北平原北部，是一座有着3000多年历史的古都。\n\n深度学习是机器学习的一个分支，它使用多层神经网络来模拟人脑的学习过程。与传统机器学习相比，深度学习能够自动从大量数据中学习特征，无需手动特征工程。\n\n人工智能（AI）技术的快速发展正在改变各行各业，从医疗保健到金融，从教育到交通。',
            imageUrl: fileList.value[0].raw ? URL.createObjectURL(fileList.value[0].raw) : null
          };
        } else if (ocrSettings.value.mode === 'table') {
          ocrResult.value = {
            text: '表格数据已转换为可编辑格式',
            imageUrl: fileList.value[0].raw ? URL.createObjectURL(fileList.value[0].raw) : null,
            tableData: [
              { col1: '项目1', col2: '数据1', col3: '100', col4: '备注1' },
              { col1: '项目2', col2: '数据2', col3: '200', col4: '备注2' },
              { col1: '项目3', col2: '数据3', col3: '300', col4: '备注3' },
              { col1: '项目4', col2: '数据4', col3: '400', col4: '备注4' }
            ],
            tableColumns: [
              { prop: 'col1', label: '第一列' },
              { prop: 'col2', label: '第二列' },
              { prop: 'col3', label: '第三列' },
              { prop: 'col4', label: '第四列' }
            ]
          };
        } else if (ocrSettings.value.mode === 'layout') {
          ocrResult.value = {
            text: '# 文档标题\n\n## 第一章\n\n这是第一章的内容，包含了一些段落和列表：\n\n* 项目1\n* 项目2\n* 项目3\n\n## 第二章\n\n这是第二章的内容，包含了一些数字和引用：\n\n1. 第一点\n2. 第二点\n3. 第三点\n\n> 这是一段引用文字，用于展示版面分析的效果。',
            imageUrl: fileList.value[0].raw ? URL.createObjectURL(fileList.value[0].raw) : null
          };
        }
        
        activeResultTab.value = 'text';
        ElMessage.success('文件识别完成');
      }, 500);
    } else {
      processedFiles = Math.floor(processingProgress.value * totalFiles / 100);
      processingStatus.value = `正在处理第 ${processedFiles + 1}/${totalFiles} 个文件...`;
    }
  }, 300);
};

// 复制文本
const copyText = () => {
  if (!ocrResult.value || !ocrResult.value.text) {
    ElMessage.warning('没有可复制的文本');
    return;
  }
  
  navigator.clipboard.writeText(ocrResult.value.text)
    .then(() => {
      ElMessage.success('文本已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};

// 下载文本
const downloadText = (format) => {
  if (!ocrResult.value || !ocrResult.value.text) {
    ElMessage.warning('没有可下载的文本');
    return;
  }
  
  const text = ocrResult.value.text;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ocr-result.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  ElMessage.success(`文本已下载为${format.toUpperCase()}格式`);
};

// 导出其他格式
const handleExport = (command) => {
  ElMessage.success(`文本已导出为${command.toUpperCase()}格式`);
  // 实际导出逻辑将连接到后端API
};
</script>

<style scoped>
.ocr-recognition-view {
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

.ocr-container {
  display: flex;
  gap: 20px;
}

.upload-panel {
  flex: 0 0 40%;
}

.result-panel {
  flex: 0 0 60%;
}

.upload-area {
  margin-bottom: 20px;
}

.file-list {
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.ocr-settings {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
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

.processing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.processing-indicator p {
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

.result-content {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.text-result {
  padding: 15px;
}

.compare-result {
  display: flex;
  gap: 20px;
}

.image-container {
  flex: 1;
  max-height: 500px;
  overflow: auto;
  border: 1px solid #eee;
}

.image-container img {
  width: 100%;
  height: auto;
}

.text-container {
  flex: 1;
}

.table-result {
  padding: 15px;
}

.file-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.file-preview img {
  max-width: 100%;
  max-height: 500px;
}

.preview-not-available {
  text-align: center;
}
</style> 