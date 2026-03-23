<template>
  <section class="module">
    <h3>3. 生成角色小传</h3>
    <div class="input-area">
      <textarea v-model="input" placeholder="输入故事梗概..."></textarea>
      <button class="btn-primary" @click="generate">生成角色小传</button>
    </div>
    <div class="output-area">
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
const input = ref('')
const output = ref('')

async function generate() {
  const data = await callApi({
    action: 'generate_character_profiles',
    input: input.value
  })
  if (data?.success) {
    output.value = data.result
    workspace.charactersOutput = data.result
  } else {
    output.value = `错误: ${data?.error || '未知错误'}`
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

.module h3 { color: var(--color-text); margin-bottom: 20px; font-size: 1.2rem; }

.input-area { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.input-area textarea { flex: 1; min-width: 200px; min-height: 100px; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); resize: vertical; }

.btn-primary { padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:hover { background: var(--color-primary-hover); }

.output-area textarea { width: 100%; min-height: 150px; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); resize: vertical; }
</style>
