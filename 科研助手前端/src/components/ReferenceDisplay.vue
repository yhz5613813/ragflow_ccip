<template>
  <div 
    v-if="visible" 
    class="reference-popup"
    :style="popupStyle"
    @click.stop
  >
    <div class="popup-arrow"></div>
    <div class="popup-content">
      <template v-if="(props.references && props.references.length > 0) || (files && files.length > 0)">
        <div v-if="props.references && props.references.length > 0">
          <div 
            v-for="(reference, index) in props.references" 
            :key="index" 
            class="reference-item"
          >
            <div class="reference-text" v-if="reference.content" v-html="processHighlight(reference.content)">
            </div>
            
            <!-- 直接显示文档信息 -->
            <div v-if="reference.document_name" class="document-info">
              <div class="document-name">
                <el-icon><Document /></el-icon>
                <span>{{ reference.document_name }}</span>
              </div>
            </div>
          </div>
        </div>
        <FileDisplay v-if="files && files.length > 0" :files="files" />
      </template>
      <div v-else class="no-references">
        <p>暂无引用内容</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Document } from '@element-plus/icons-vue';
import FileDisplay from './FileDisplay.vue';

// 定义组件属性
// eslint-disable-next-line no-undef
const props = defineProps({
  references: {
    type: Array,
    default: () => []
  },
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  files: {
    type: Array,
    default: () => []
  }
});

// 响应式的位置状态
const currentPosition = ref({ x: 0, y: 0 });

// 监听位置变化
watch(() => props.position, (newPosition) => {
  currentPosition.value = { ...newPosition };
}, { immediate: true });

// 计算弹窗位置样式
const popupStyle = computed(() => {
  return {
    left: `${currentPosition.value.x}px`,
    top: `${currentPosition.value.y}px`
  };
});

// 处理高亮文本
const processHighlight = (content) => {
  if (!content) return '';
  
  // 将 <em> 标签替换为 highlight-text 样式
  return content.replace(/<em>(.*?)<\/em>/g, '<span class="highlight-text">$1</span>');
};

// 滚动事件处理函数
const handleScroll = () => {
  // 当滚动时直接关闭弹窗，避免位置计算问题
  if (props.visible) {
    emit('close');
  }
};

// 定义emit
// eslint-disable-next-line no-undef
const emit = defineEmits(['close']);

// 组件挂载时添加滚动监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.reference-popup {
  position: fixed;
  z-index: 99999;
  max-width: 600px;
  min-width: 400px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translate(-50%, -100%);
  margin-top: -10px;
}

.popup-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #e9ecef;
}

.popup-arrow::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: -7px;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid white;
}

.popup-content {
  padding: 16px;
}

.reference-item {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
}

.reference-item:last-child {
  margin-bottom: 0;
}

.reference-text {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  margin-bottom: 8px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 高亮文本样式 */
.reference-text :deep(.highlight-text) {
  color: #e74c3c;
  font-weight: bold;
}

/* 文件展示组件在引用中的样式 */
.reference-item :deep(.file-display) {
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f7ff;
  border-radius: 4px;
  border: 1px solid #d1e7ff;
}

.reference-item :deep(.file-list) {
  gap: 6px;
}

.reference-item :deep(.file-item) {
  padding: 4px 8px;
  font-size: 12px;
  max-width: 150px;
}

/* 文档信息样式 */
.document-info {
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f7ff;
  border-radius: 4px;
  border: 1px solid #d1e7ff;
}

.document-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #409EFF;
}

.document-name .el-icon {
  font-size: 14px;
}

.no-references {
  text-align: center;
  padding: 20px;
  color: #999;
}

.no-references p {
  margin: 0;
  font-size: 14px;
}
</style> 