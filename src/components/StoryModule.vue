<template>
  <section class="module">
    <h3>1. 生成故事梗概</h3>
    <div class="naming-area">
      <label>短剧命名：</label>
      <div class="naming-inputs">
        <input v-model="dramaName" type="text" placeholder="短剧名字（非必填）">
        <input v-model="maleName" type="text" placeholder="男主名字（非必填）">
        <input v-model="femaleName" type="text" placeholder="女主名字（非必填）">
      </div>
    </div>
    <div class="tags-area">
      <label>选择主题标签（可多选）：</label>
      <div class="tags-container">
        <label v-for="tag in allTags" :key="tag" class="tag-checkbox">
          <input type="checkbox" :value="tag" v-model="selectedTags">
          {{ tag }}
        </label>
      </div>
    </div>
    <div class="input-area">
      <textarea v-model="input" placeholder="输入故事背景或主题..."></textarea>
      <button class="btn-primary" @click="generate">生成故事梗概</button>
    </div>
    <div class="output-area">
      <p v-if="fallbackHint" class="fallback-hint">⚠️ 未连接大模型，此为预设模板。请配置 MODEL_AGENT_API_KEY 或检查网络。</p>
      <textarea v-model="output" readonly placeholder="输出结果将显示在这里..."></textarea>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useApi } from '../composables/useApi'
import { useWorkspaceStore } from '../stores/workspace'

const { callApi } = useApi()
const workspace = useWorkspaceStore()
const dramaName = ref('')
const maleName = ref('')
const femaleName = ref('')
const input = ref('')
const output = ref('')
const selectedTags = ref([])
const fallbackHint = ref(false)

const allTags = [
  '男频', '女频', '大女主', '东方仙侠', '西方玄幻', '传统玄幻', '科幻', '末世', '武侠', '重生',
  '系统', '快穿', '无限流', '诸天流', '穿越', '穿书', '兵王', '神医', '神豪', '战神',
  '赘婿', '无敌', '国运', '签到', '克苏鲁', '种田', '进化', '年代', '都市修真', '都市高武',
  '古代权谋', '刑侦', '鉴宝', '职场', '奶爸', '抗战', '谍战', '游戏', '体育', '二次元',
  '影视衍生', '小说 IP', '古装言情', '后宫', '宅斗', '仕途', '古风世情', '现代言情', '校园',
  '豪门', '娱乐圈', '婚恋', '异世', '兽世', '星际', '甜宠', '幻想言情', '虐恋', '搞笑',
  '民国言情', '双男主', '萌娃', '悬疑', '灵异'
]

async function generate() {
  fallbackHint.value = false
  const combinedInput = `短剧名字: ${dramaName.value}\n男主名字: ${maleName.value}\n女主名字: ${femaleName.value}\n标签: ${selectedTags.value.join(', ')}\n内容: ${input.value}`
  try {
    const data = await callApi({
      action: 'generate_story_outlines',
      input: combinedInput
    })
    if (data?.success) {
      output.value = data.result
      workspace.storyOutput = data.result
      fallbackHint.value = !!data.from_fallback
    } else {
      output.value = `错误: ${data?.error || '未知错误'}`
    }
  } catch (err) {
    output.value = `请求失败: ${err.message || '网络错误，请检查后端是否启动 (python -m handler)'}`
  }
}
</script>

<style scoped>
.module {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

.module h3 {
  color: var(--color-text);
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.naming-area,
.tags-area {
  margin-bottom: 16px;
}

.naming-area label,
.tags-area > label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.naming-inputs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.naming-inputs input {
  flex: 1;
  min-width: 120px;
  padding: 10px 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-text-muted);
}

.tag-checkbox:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.input-area {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.input-area textarea {
  flex: 1;
  min-width: 200px;
  min-height: 100px;
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  resize: vertical;
}

.btn-primary {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.fallback-hint {
  color: #b45309;
  font-size: 0.9rem;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 8px;
}

.output-area textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  resize: vertical;
  font-family: inherit;
}
</style>
