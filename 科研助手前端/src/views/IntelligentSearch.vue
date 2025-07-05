<template>
  <div class="intelligent-search-view">
    <h2 class="main-title">智能搜索</h2>
    <p class="subtitle">实时资讯，丰富信源，整合搜索</p>
    <!-- 搜索输入组件 -->
    <SearchBar />

    <!-- 功能模块入口卡片 -->
    <div class="module-cards">
      <ModuleCard 
        v-for="module in modules" 
        :key="module.title"
        :title="module.title"
        :description="module.description"
        :icon="module.icon"
      />
    </div>
  </div>
</template>

<script setup>
import SearchBar from '@/components/SearchBar.vue';
import ModuleCard from '@/components/ModuleCard.vue';
import { Edit, Document, ChatLineRound, Reading, Microphone, PictureFilled, Translation, Histogram } from '@element-plus/icons-vue';

const modules = [
  { title: 'AI写作', description: '分步骤生成文纲和文稿', icon: Edit },
  { title: '报告生成', description: '深度研究，精准分析', icon: Document },
  { title: '政策问答', description: '理解政策，解读政策', icon: ChatLineRound },
  { title: '文献研读', description: '提炼大纲，总结摘要', icon: Reading },
  { title: '智能配音', description: '为你的文字赋予声音', icon: Microphone },
  { title: 'PPT生成', description: '打造精彩的演讲内容', icon: PictureFilled },
  { title: '翻译对比', description: '双语阅读，对照理解', icon: Translation },
  { title: '总结汇报', description: '凝练你的工作成效', icon: Histogram }
];
</script>

<style scoped>
.intelligent-search-view {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  padding: 20px 0 40px 0;

}

.main-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #333;
}

.subtitle {
  font-size: 1rem;
  color: #999;
  margin-top: 4px;
  margin-bottom: 20px;
}

.module-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 20px;
  width: 100%;
  max-width: 1120px;
}

@media (max-width: 768px) {
  .module-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 