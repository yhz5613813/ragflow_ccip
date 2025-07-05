<template>
  <div>
    <h2>智能配音</h2>
    <p>为你的文字赋予声音</p>

    <!-- 文本输入区域 -->
    <el-input
      v-model="textContent"
      type="textarea"
      :rows="6"
      placeholder="请输入需要配音的文字内容..."
    ></el-input>

    <!-- 配音选项 -->
    <div class="dubbing-options" style="margin-top: 20px;">
      <el-form :model="dubbingOptions" label-width="100px">
        <el-form-item label="语音类型">
          <el-select v-model="dubbingOptions.voiceType" placeholder="请选择语音类型">
            <el-option label="标准女声" value="female" />
            <el-option label="标准男声" value="male" />
            <el-option label="童声" value="child" />
            <el-option label="老年声" value="elder" />
          </el-select>
        </el-form-item>
        <el-form-item label="语速">
          <el-slider
            v-model="dubbingOptions.speed"
            :min="0.5"
            :max="2"
            :step="0.1"
            :format-tooltip="formatSpeed"
          />
        </el-form-item>
        <el-form-item label="音调">
          <el-slider
            v-model="dubbingOptions.pitch"
            :min="0.5"
            :max="2"
            :step="0.1"
            :format-tooltip="formatPitch"
          />
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" @click="generateDubbing" style="margin-top: 20px;">
      生成配音
    </el-button>

    <!-- 配音结果 -->
    <div v-if="audioUrl" style="margin-top: 20px;">
      <h3>配音结果：</h3>
      <el-card class="box-card">
        <audio :src="audioUrl" controls style="width: 100%;"></audio>
        <div style="margin-top: 10px;">
          <el-button type="success" @click="downloadAudio">下载音频</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { ref, reactive } from 'vue';

export default defineComponent({
  name: 'DubbingPage',
  setup() {
    const textContent = ref('');
    const audioUrl = ref('');

    const dubbingOptions = reactive({
      voiceType: 'female',
      speed: 1,
      pitch: 1
    });

    const formatSpeed = (val) => {
      return `${val}x`;
    };

    const formatPitch = (val) => {
      return `${val}x`;
    };

    const generateDubbing = () => {
      if (textContent.value.trim() === '') {
        alert('请输入需要配音的文字内容');
        return;
      }
      // 这里可以调用API接口生成配音（示例留空）
      audioUrl.value = 'https://example.com/sample-audio.mp3';
    };

    const downloadAudio = () => {
      if (audioUrl.value) {
        const link = document.createElement('a');
        link.href = audioUrl.value;
        link.download = '配音结果.mp3';
        link.click();
      }
    };

    return {
      textContent,
      audioUrl,
      dubbingOptions,
      formatSpeed,
      formatPitch,
      generateDubbing,
      downloadAudio
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
.dubbing-options {
  max-width: 600px;
  margin: 0 auto;
}
.box-card {
  white-space: pre-wrap;
}
</style> 