<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
        <div class="message-content">
          <div class="message-text" v-if="message.type === 'user'">{{ message.content }}</div>
          <div class="message-text markdown-body" v-else v-html="renderMarkdown(message.content, index)"></div>
          
          <!-- 文件展示组件 -->
          <FileDisplay 
            v-if="message.type === 'ai' && message.files && message.files.length > 0 && message.references && message.references.length > 0"
            :files="message.files"
          />
          
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </div>
    
    <!-- 引用弹出组件 -->
    <ReferenceDisplay 
      v-if="referencePopup.visible"
      :references="referencePopup.references"
      :visible="referencePopup.visible"
      :position="referencePopup.position"
      :files="referencePopup.files"
      @close="closeReferencePopup"
    />
    
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="输入消息..."
        resize="none"
        @keyup.enter.ctrl="sendMessage"
      />
      <el-button class="send-button" @click="sendMessage">
        <el-icon><Position /></el-icon>
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { Position } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ReferenceDisplay from './ReferenceDisplay.vue';
import FileDisplay from './FileDisplay.vue';

const route = useRoute();
const messages = ref([]);
const inputMessage = ref('');
const messagesContainer = ref(null);
const authToken = ref('');
const headers = ref({});
const kb_ids = ref([]);
// const kb_id = ref([]);
const user_id = ref([]);
const controller = ref(null); // 定义controller
const latestAiMessage = ref(null); // 定义latestAiMessage
const conversation_id = ref('');
const dialog_id = ref(''); // 新增 dialog_id
const message_history = ref([]); // 新增 message_history
const isLoading = ref(false); // 新增 loading 状态

// 引用弹出状态
const referencePopup = ref({
  visible: false,
  references: [],
  position: { x: 0, y: 0 },
  files: []
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 登录函数
const login = async () => {
  try {
    const loginData = {
      email: '123@123.com',
      // password: '123'
      password: "FN6pAfTq1saZeM+LtMwzA1Ao9fIQRct9OcVeJjhWul6Y+ki/Uzb4X6tvI1T591CFP2HmK6M4ZYbpT1OZM3rv9tvAE4c7S9nnXZ+ffg6w2Rq9OgOLCCbk5T7rapP6UxWD14aM62zbo1WtzSRKlC87Ik17U9UzPFlXbvdIEAzQr06GgRADmpvw3Msk05CvZTy9/f26q5TxlQOREFhZglTFTirosHdg09wnnA+f6CkZgm7Vvza+0ZJcRONmXUN8NFkY0rYxBJhaLUJQclFcGVjplVPbCQeSOafXI1yv3JN2NoV1e1s2A3LNdg0jxh6oEQ0TrveMyQfhytxNQqAGoT8lgg=="
      };

    console.log('开始登录...');
    const response = await fetch('http://127.0.0.1/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    console.log('登录响应状态码:', response.status);
    
    if (!response.ok) {
      throw new Error('登录失败');
    }

    // 从响应头获取token
    const token = response.headers.get('Authorization');
    if (token) {
      authToken.value = token;
      console.log('登录成功，获取到token:', token);
    } else {
      console.log('登录成功，但未获取到token');
    }

    headers.value = {
        "Authorization": token,
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json",
    }

    const user_data = await response.json();
    user_id.value = user_data.data.id

    console.log('headers:', headers.value);

    try {
      // 调用 kb_list 接口
      const response_kb_list = await fetch('http://127.0.0.1/v1/kb/list', {
        method: 'GET',
        headers: headers.value,
      });

      console.log('kb_list 请求状态码:', response_kb_list.status);

      if (!response_kb_list.ok) {
        throw new Error('获取知识库列表失败');
      }

      const kb_data = await response_kb_list.json();
      console.log('kb_list 返回内容:', JSON.stringify(kb_data, null, 2));

      // 提取 kb_ids
      if (kb_data.code === 0 && kb_data.data) {
        const kb_list = kb_data.data.kbs || [];
        kb_ids.value = kb_list
          .filter(kb => kb.id)
          .map(kb => kb.id);

        console.log('提取的 kb_ids:', kb_ids.value);
      } else {
        console.log('知识库列表为空或格式不正确');
        kb_ids.value = [];
      }

    } catch (error) {
      console.error('获取知识库列表失败:', error);
      messages.value.push({
        type: 'ai',
        content: '获取知识库列表失败，请刷新页面重试。',
        time: new Date().toLocaleTimeString()
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    messages.value.push({
      type: 'ai',
      content: '登录失败，请刷新页面重试。',
      time: new Date().toLocaleTimeString()
    });
  }
};

// 创建 dialog
const createDialog = async (kb_ids_param) => {
  try {
    // 如果传入的是数组，取第一个元素作为 kb_id
    const kb_id = Array.isArray(kb_ids_param) ? kb_ids_param[0] : kb_ids_param;
    console.log('原始 kb_ids_param:', kb_ids_param);
    console.log('使用的 kb_id:', kb_id);
    
    const url = "http://127.0.0.1/v1/dialog/set";
    const payload = {
      "name": "test",
      "icon": "",
      "language": "English",
      "kb_ids": [kb_id],
      "llm_id": "deepseek-r1:7b@Ollama",
      "llm_setting": {
        "temperature": 0.1,
        "top_p": 0.3,
        "presence_penalty": 0.4,
        "frequency_penalty": 0.7,
      },
      "prompt_config": {
        "empty_response": "",
        "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
        "quote": true,
        "keyword": false,
        "parameters": [{"key": "knowledge", "optional": false}],
        "reasoning": false,
        "refine_multiturn": false,
        "system": "你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。如果问题与知识库内容无关时，根据你的原本的知识来进行回答。回答需要考虑聊天历史。\n以下是知识库：\n{knowledge}\n以上是知识库。",
        "tts": false,
        "use_kg": false,
        "similarity_threshold": 0.2,
        "top_n": 8,
        "vector_similarity_weight": 0.3,
      },
    };

    console.log('创建 dialog 请求数据:', payload);
    const response = await fetch(url, {
      method: 'POST',
      headers: headers.value,
      body: JSON.stringify(payload)
    });

    console.log('创建 dialog 响应状态码:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('创建 dialog 失败，响应内容:', errorText);
      throw new Error('创建 dialog 失败');
    }

    const res_json = await response.json();
    console.log('创建 dialog 完整响应:', res_json);
    
    // 检查响应格式
    if (!res_json.data || !res_json.data.id) {
      console.error('创建 dialog 失败，响应格式错误:', res_json);
      throw new Error('创建 dialog 失败：响应格式错误');
    }
    
    dialog_id.value = res_json.data.id;
    console.log('Dialog 创建成功:', dialog_id.value);
    return dialog_id.value;

  } catch (error) {
    console.error('创建 dialog 失败:', error);
    messages.value.push({
      type: 'ai',
      content: '创建对话失败，请刷新页面重试。',
      time: new Date().toLocaleTimeString()
    });
    return null;
  }
};

// 创建 conversation
const createConversation = async (dialogId) => {
  try {
    message_history.value = []; // 每次新对话清空历史

    const url = "http://127.0.0.1/v1/conversation/set";
    const full_uuid = crypto.randomUUID(); // 使用 Web Crypto API 生成 UUID
    const new_conversation_id = full_uuid.slice(0, -4); // 模拟 Python 的切片

    // 第一条消息 (assistant's prologue)
    const assistant_message = {
      "id": crypto.randomUUID(),
      "role": "assistant",
      "content": "你好！ 我是你的助理，有什么可以帮到你的吗？",
    };
    message_history.value.push(assistant_message);

    const payload = {
      "conversation_id": new_conversation_id,
      "dialog_id": dialogId,
      "name": "你好", // 可以根据需要修改对话名称
      "is_new": true,
      "message": [{ "role": "assistant", "content": "你好" }], // 这里的 "message" 字段是多余的，但为了保持与后端Payload一致性保留
    };

    console.log('创建 conversation 请求数据:', payload);
    const response = await fetch(url, {
      method: 'POST',
      headers: headers.value,
      body: JSON.stringify(payload)
    });

    console.log('创建 conversation 响应状态码:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('创建 conversation 失败，响应内容:', errorText);
      throw new Error('创建 conversation 失败');
    }

    const res_json = await response.json();
    if (res_json.code !== 0) {
      console.error('创建 conversation 失败，完整响应:', res_json);
      throw new Error('创建 conversation 失败');
    }

    conversation_id.value = new_conversation_id;
    console.log('Conversation 创建成功:', conversation_id.value);
    return conversation_id.value;

  } catch (error) {
    console.error('创建 conversation 失败:', error);
    messages.value.push({
      type: 'ai',
      content: '创建对话失败，请刷新页面重试。',
      time: new Date().toLocaleTimeString()
    });
    return null;
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  const userMessageContent = inputMessage.value;
  
  const userMessage = {
    type: 'user',
    content: userMessageContent,
    time: new Date().toLocaleTimeString()
  };
  
  messages.value.push(userMessage);
  inputMessage.value = '';
  scrollToBottom();

  // 添加用户消息到 message_history
  message_history.value.push({
    "id": crypto.randomUUID(),
    "role": "user",
    "content": userMessageContent,
    "doc_ids": [] // 根据后端需要，可以添加文档ID
  });
  
  // 取消之前的请求
  if (controller.value) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  
  try {
    // 添加加载中的消息
    isLoading.value = true;
    messages.value.push({
      type: 'ai',
      content: '正在生成中...',
      time: new Date().toLocaleTimeString(),
      references: [], // 初始化引用数组
      files: [] // 初始化文件数组
    });
    scrollToBottom();

    console.log('\n=== 调用 /v1/conversation/completion 接口 ===');
    const CompletionData = {
      conversation_id: conversation_id.value,
      messages: message_history.value,
    };

    console.log('发送数据:', CompletionData);

    const response = await fetch('http://127.0.0.1/v1/conversation/completion', {
      method: 'POST',
      headers: headers.value,
      body: JSON.stringify(CompletionData),
      signal: controller.value.signal
    });

    if (!response.ok) {
      console.error('completion 请求失败，状态码:', response.status);
      const errorText = await response.text();
      console.error('completion 响应内容:', errorText);
      throw new Error('请求失败');
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessageIndex = messages.value.length - 1; // 使用加载中消息的索引
    let answerContent = "";
    let isThinking = false; // 添加思考状态标记
    let references = []; // 存储引用数据
    let files = []; // 存储文件数据

    console.log('开始接收流式响应...');

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      
      if (done) {
        console.log('流式响应结束');
        break;
      }
      
      // 解码响应数据
      const chunk = decoder.decode(value, { stream: true });
      console.log('收到原始数据:', chunk);
      
      // 处理流式数据
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim();
          if (dataStr === '[DONE]' || dataStr === '') continue;
          
          try {
            const data = JSON.parse(dataStr);
            console.log('解析后的数据:', data);
            
            if (data.data && data.data.answer) {
              const currentAnswerChunk = data.data.answer;

              isThinking = true;
              if (currentAnswerChunk.includes('</think>')) {
                isThinking = false;
              }

              answerContent = currentAnswerChunk;

              // 根据思考状态设置不同的样式
              if (isThinking) {
                messages.value[aiMessageIndex].content = `<div class="think-block">${answerContent}`;
              } else {
                messages.value[aiMessageIndex].content = answerContent;
              }

              console.log('收到最新回答:', answerContent);
              
              latestAiMessage.value = messages.value[aiMessageIndex];
              scrollToBottom();
            }

            if (data.data && data.data.reference) {
              const currentReferenceChunk = data.data.reference;

              // 处理引用数据
              if (currentReferenceChunk.chunks && Array.isArray(currentReferenceChunk.chunks)) {
                references = currentReferenceChunk.chunks.map(chunk => ({
                  content: chunk.content || '',
                  document_id: chunk.document_id || null
                }));
                
                // 更新消息中的引用数据
                messages.value[aiMessageIndex].references = references;
                console.log('更新引用数据:', references);
              }

              // 处理文件数据 (doc_aggs)
              if (currentReferenceChunk.doc_aggs && Array.isArray(currentReferenceChunk.doc_aggs)) {
                files = currentReferenceChunk.doc_aggs.map(doc => ({
                  doc_name: doc.doc_name || '未知文件',
                  doc_id: doc.doc_id || null
                }));
                
                // 更新消息中的文件数据
                messages.value[aiMessageIndex].files = files;
                console.log('更新文件数据:', files);
              }

              console.log('参考文献：', currentReferenceChunk);
            }
          } catch (e) {
            console.error('JSON解析失败:', e);
            console.error('原始数据:', dataStr);
          }
        }
      }
    }

    // 将完整的AI回答添加到 message_history
    if (answerContent) {
      message_history.value.push({
        "id": crypto.randomUUID(),
        "role": "assistant",
        "content": answerContent
      });
      console.log('完整的AI回答已添加到历史:', message_history.value);
    }

    console.log('流式响应处理完成');

  } catch (error) {
    // 修复后代码
    const isAbortError = error.name === 'AbortError';
    if (!isAbortError) {
      console.error('发送消息失败:', error);
      // 更新最后一条消息为错误信息
      if (messages.value.length > 0) {
        messages.value[messages.value.length - 1].content = '抱歉，发生了错误，请稍后重试。';
      }
    } else {
      console.log('请求被取消');
      // 如果是取消请求，移除加载中的消息
      if (messages.value.length > 0) {
        messages.value.pop();
      }
    }
  } finally {
    isLoading.value = false;
  }
  
  scrollToBottom();
};

// 添加 Markdown 渲染函数
const renderMarkdown = (content, messageIndex) => {
  if (!content) return '';
  
  // 先使用 marked 将 Markdown 转换为 HTML
  let processedContent = marked(content);
  
  // 处理 <think> 标签
  processedContent = processedContent.replace(
    /<think>([\s\S]*?)<\/think>/g,
    '<div class="think-block">$1</div>'
  );
  
  // 处理 "##数字$$" 格式，替换为可点击的引用图标
  processedContent = processedContent.replace(
    /##(\d+)\$\$/g,
    (match, number) => {
      return `<span class="reference-icon-wrapper" data-reference-number="${number}" data-message-index="${messageIndex}">
        <el-icon class="number-icon"><InfoFilled /></el-icon>
        <span class="number-badge">${number}</span>
      </span>`;
    }
  );
  
  // 使用 DOMPurify 进行安全处理
  return DOMPurify.sanitize(processedContent);
};

// 处理文档点击事件，关闭引用弹出框
const handleDocumentClick = (event) => {
  // 检查是否点击了引用图标
  const referenceIcon = event.target.closest('.reference-icon-wrapper');
  if (referenceIcon) {
    const referenceNumber = referenceIcon.getAttribute('data-reference-number');
    const messageIndex = parseInt(referenceIcon.getAttribute('data-message-index'));
    
    // 获取点击位置
    const rect = referenceIcon.getBoundingClientRect();
    
    // 查找对应的消息和引用
    const message = messages.value[messageIndex];
    
    if (message && message.references && message.references.length > 0) {
      // 根据引用编号查找对应的引用内容，编号从0开始
      const referenceIndex = parseInt(referenceNumber); // 直接使用编号，不需要减1
      const reference = message.references[referenceIndex];
      
      if (reference) {
        console.log('显示引用弹出框，引用数据:', reference);
        console.log('消息中的文件数据:', message.files);
        
        // 显示引用弹出框
        referencePopup.value = {
          visible: true,
          references: [reference], // 只显示当前引用的内容
          files: message.files || [], // 传递文件数据
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top - 10 // 向上偏移10px
          }
        };
        
        console.log('引用弹出框数据:', referencePopup.value);
      }
    }
    return;
  }
  
  // 如果点击的不是引用图标或弹出框，则关闭弹出框
  if (!event.target.closest('.reference-popup')) {
    closeReferencePopup();
  }
};

// 关闭引用弹出框
const closeReferencePopup = () => {
  referencePopup.value.visible = false;
};

onMounted(async () => {
  // 直接进行登录
  await login();

  // 确保已经登录且获取到kb_ids
  if (authToken.value && kb_ids.value.length > 0) {
    const createdDialogId = await createDialog(kb_ids.value);
    if (createdDialogId) {
      const createdConversationId = await createConversation(createdDialogId);
      if (createdConversationId) {
        if (route.query.initialMessage) {
          inputMessage.value = route.query.initialMessage;
          sendMessage();
        } else {
          // 如果没有初始消息，并且成功创建了会话，显示欢迎消息
          messages.value.push({
            type: 'ai',
            content: '你好！我是AI助手，有什么我可以帮你的吗？',
            time: new Date().toLocaleTimeString()
          });
        }
      }
    }
  } else if (!authToken.value) {
    messages.value.push({
      type: 'ai',
      content: '登录失败，无法开始对话。',
      time: new Date().toLocaleTimeString()
    });
  } else if (kb_ids.value.length === 0) {
    messages.value.push({
      type: 'ai',
      content: '未找到可用的知识库，无法开始对话。',
      time: new Date().toLocaleTimeString()
    });
  }
  scrollToBottom();

  // 添加点击页面其他地方关闭弹出框的事件监听
  document.addEventListener('click', handleDocumentClick);
});

// 组件卸载时取消请求
onUnmounted(() => {
  if (controller.value) {
    controller.value.abort();
  }

  // 移除文档点击事件监听器
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: auto;
}

.message {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

.user-message {
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.user-message .message-content {
  background-color: #409EFF;
  color: white;
}

.ai-message .message-content {
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.message-time {
  font-size: 12px;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.ai-message .message-time {
  color: #909399;
}

.chat-input {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.chat-input .el-input {
  flex: 1;
}

.send-button {
  background-color: #409EFF;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  height: auto;
}

.send-button:hover {
  background-color: #66b1ff;
}

/* 添加 Markdown 样式 */
.markdown-body {
  line-height: 1.6;
}

.markdown-body :deep(p) {
  margin: 0 0 1em;
}

.markdown-body :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

.markdown-body :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: monospace;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  margin: 0;
  padding-left: 1em;
  color: #6a737d;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body :deep(th), .markdown-body :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-body :deep(th) {
  background-color: #f6f8fa;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-body :deep(h1), .markdown-body :deep(h2), .markdown-body :deep(h3),
.markdown-body :deep(h4), .markdown-body :deep(h5), .markdown-body :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) { font-size: 2em; }
.markdown-body :deep(h2) { font-size: 1.5em; }
.markdown-body :deep(h3) { font-size: 1.25em; }
.markdown-body :deep(h4) { font-size: 1em; }
.markdown-body :deep(h5) { font-size: 0.875em; }
.markdown-body :deep(h6) { font-size: 0.85em; }

/* 思考过程的样式 */
.markdown-body :deep(.think-block) {
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
  padding: 12px 16px;
  margin: 12px 0;
  font-style: italic;
  color: #6c757d;
  border-radius: 0 4px 4px 0;
  font-size: 0.95em;
  line-height: 1.5;
}

.markdown-body :deep(.think-block p) {
  margin: 0;
}

.markdown-body :deep(.think-block p + p) {
  margin-top: 8px;
}

/* 信息图标样式 */
.markdown-body :deep(.info-icon) {
  color: #409EFF;
  font-size: 16px;
  vertical-align: middle;
  margin: 0 4px;
}

/* 数字图标和徽章样式 */
.markdown-body :deep(.number-icon) {
  color: #409EFF;
  font-size: 16px;
  vertical-align: middle;
  margin-right: 2px;
}

.markdown-body :deep(.number-badge) {
  background-color: #409EFF;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  vertical-align: middle;
  margin-left: 2px;
  line-height: 1;
  padding: 0;
  min-width: 16px;
  min-height: 16px;
}

/* 引用图标包装器样式 */
.markdown-body :deep(.reference-icon-wrapper) {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin: 0 2px;
}

.markdown-body :deep(.reference-icon-wrapper:hover) {
  background-color: #f0f7ff;
  transform: scale(1.05);
}

.markdown-body :deep(.reference-icon-wrapper:active) {
  transform: scale(0.95);
}
</style> 