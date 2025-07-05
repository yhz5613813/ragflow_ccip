import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '系统管理',
    avatar: require('@/assets/avatar.png')  // 这里假设有一张默认头像
  }),
  actions: {
    setUser(name, avatar) {
      this.name = name;
      this.avatar = avatar;
    }
  }
});
