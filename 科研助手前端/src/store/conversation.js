import { defineStore } from 'pinia';

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    history: [
      // 初始历史对话示例，可动态更新
      '品牌营销标语创作',
      '鱼眼视觉图片创作',
      '时尚杂志封面制作'
    ]
  }),
  actions: {
    addConversation(title) {
      this.history.unshift(title);
    },
    clearHistory() {
      this.history = [];
    }
  }
});
