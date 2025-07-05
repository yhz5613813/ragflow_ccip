<template>
  <el-container style="height: 100vh">
    <!-- 侧边栏 -->
    <el-aside width="240px" style="background: #f5f7fa">
      <SideBar />
    </el-aside>

    <!-- 主体区域（含头部和内容） -->
    <el-container>
      <!-- 顶部用户信息 -->
      <el-header style="background: #ffffff; display: flex; justify-content: flex-end; align-items: center; height: 60px; padding: 0 20px;">
        <TopBar />
      </el-header>
      <!-- 主内容区 -->
      <el-main style="background: #ffffff; padding: 20px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { defineComponent } from 'vue';
import SideBar from '@/components/SideBar.vue';
import TopBar from '@/components/TopBar.vue';

export default defineComponent({
  name: 'App',
  components: { SideBar, TopBar }
});
</script>

<style>
/* 可根据 DeepSeek 风格自定义全局样式 */
body, #app {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #f0f2f5;
}
</style>
