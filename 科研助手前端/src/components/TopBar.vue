<template>
  <div class="top-bar" style="display: flex; align-items: center;">
    <span style="margin-right: 10px;">{{ userStore.name }}</span>
    <el-avatar :src="userStore.avatar"></el-avatar>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
const userStore = useUserStore();
</script>

<style scoped>
.top-bar {
  cursor: default;
}
</style>
