<template>
  <div>
    <h2>翻译对比</h2>
    <p>对比不同翻译版本，找出最佳表达</p>

    <!-- 原文输入 -->
    <el-input
      v-model="originalText"
      type="textarea"
      :rows="4"
      placeholder="请输入需要翻译的原文..."
    ></el-input>

    <!-- 翻译结果对比 -->
    <div class="translation-comparison" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>翻译版本 1</span>
                <el-button type="primary" @click="copyTranslation(translation1)">复制</el-button>
              </div>
            </template>
            <div class="text item">
              {{ translation1 }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>翻译版本 2</span>
                <el-button type="primary" @click="copyTranslation(translation2)">复制</el-button>
              </div>
            </template>
            <div class="text item">
              {{ translation2 }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 翻译选项 -->
    <div class="translation-options" style="margin-top: 20px;">
      <el-form :model="translationOptions" label-width="100px">
        <el-form-item label="目标语言">
          <el-select v-model="translationOptions.targetLanguage" placeholder="请选择目标语言">
            <el-option label="英语" value="en" />
            <el-option label="日语" value="ja" />
            <el-option label="韩语" value="ko" />
            <el-option label="法语" value="fr" />
            <el-option label="德语" value="de" />
          </el-select>
        </el-form-item>
        <el-form-item label="翻译风格">
          <el-select v-model="translationOptions.style" placeholder="请选择翻译风格">
            <el-option label="正式" value="formal" />
            <el-option label="口语" value="casual" />
            <el-option label="文学" value="literary" />
            <el-option label="技术" value="technical" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" @click="compareTranslations" style="margin-top: 20px;">
      开始对比
    </el-button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { ref, reactive } from 'vue';

export default defineComponent({
  name: 'TranslationComparison',
  setup() {
    const originalText = ref('');
    const translation1 = ref('');
    const translation2 = ref('');

    const translationOptions = reactive({
      targetLanguage: 'en',
      style: 'formal'
    });

    const compareTranslations = () => {
      if (originalText.value.trim() === '') {
        alert('请输入需要翻译的原文');
        return;
      }
      // 这里可以调用API接口进行翻译（示例留空）
      translation1.value = 'This is the first translation version.';
      translation2.value = 'This is the second translation version.';
    };

    const copyTranslation = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        alert('复制成功！');
      }).catch(() => {
        alert('复制失败，请手动复制。');
      });
    };

    return {
      originalText,
      translation1,
      translation2,
      translationOptions,
      compareTranslations,
      copyTranslation
    };
  }
});
</script>

<style scoped>
h2 {
  margin-bottom: 0;
}
p {
  color: #606266;
  margin-top: 5px;
}
.translation-comparison {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text {
  font-size: 14px;
}
.item {
  margin-bottom: 18px;
}
.box-card {
  width: 100%;
}
</style>
 