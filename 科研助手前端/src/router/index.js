import { createRouter, createWebHistory } from 'vue-router'
import IntelligentSearch from '@/views/IntelligentSearch.vue'
import ReportGeneration from '@/views/ReportGeneration.vue'
import KnowledgeQA from '@/views/KnowledgeQA.vue'
import KnowledgeQAResult from '@/components/KnowledgeQAResult.vue'
import OCRRecognition from '@/views/OCRRecognition.vue'
import DocumentSummary from '@/views/DocumentSummary.vue'
import MindMap from '@/views/MindMap.vue'
import ChatInterface from '../components/ChatInterface.vue'

const routes = [
  { path: '/', redirect: '/search' },
  { path: '/search', name: '智能搜索', component: IntelligentSearch },
  { path: '/report', name: '报告生成', component: ReportGeneration },
  { path: '/knowledge-qa', name: '知识库问答', component: KnowledgeQA },
  { 
    path: '/knowledge-qa-result', 
    name: '知识库问答结果', 
    component: KnowledgeQAResult,
    props: (route) => ({ question: route.query.question })
  },
  { path: '/ocr', name: 'OCR识别', component: OCRRecognition },
  { path: '/document-summary', name: '文档摘要', component: DocumentSummary },
  { path: '/mind-map', name: '思维导图', component: MindMap },
  {
    path: '/chat',
    name: 'chat',
    component: ChatInterface,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
