<template>
  <el-card class="module-card" shadow="hover" @click="handleCardClick">
    <div class="card-content">
      <div class="icon-container">
        <el-icon :size="18">
          <component :is="icon || Menu" />
        </el-icon>
      </div>
      <div class="text-container">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Menu } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// eslint-disable-next-line no-undef
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    default: null
  }
});

// 处理卡片点击事件
const handleCardClick = () => {
  // 根据不同的模块生成相应的初始消息
  let initialMessage = '';
  
  switch (props.title) {
    case 'AI写作':
      initialMessage = '请帮我进行AI写作，我需要分步骤生成文纲和文稿。';
      break;
    case '报告生成':
      initialMessage = '请帮我生成一份深度研究报告，需要精准分析。';
      break;
    case '政策问答':
      initialMessage = '请帮我解读相关政策，理解政策内容。';
      break;
    case '文献研读':
      initialMessage = '请帮我研读文献，提炼大纲，总结摘要。';
      break;
    case '智能配音':
      initialMessage = '请帮我为文字进行智能配音，赋予声音。';
      break;
    case 'PPT生成':
      initialMessage = '请帮我生成PPT内容，打造精彩的演讲材料。';
      break;
    case '翻译对比':
      initialMessage = '请帮我进行翻译对比，实现双语阅读和对照理解。';
      break;
    case '总结汇报':
      initialMessage = '请帮我总结汇报，凝练工作成效。';
      break;
    default:
      initialMessage = `请帮我使用${props.title}功能：${props.description}`;
  }
  
  // 跳转到聊天界面，传递初始消息
  router.push({
    path: '/chat',
    query: { initialMessage: initialMessage }
  });
};
</script>

<style scoped>
.module-card {
  width: 260px;
  height: 90px;
  margin: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.module-card:hover {
  transform: scale(1.02);
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.icon-container {
  margin-right: 16px;
  color: #409EFF;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f7ff;
}

.text-container h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 500;
}

.text-container p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>
