<template>
  <section class="module">
    <h3>15. 角色统计</h3>
    <div class="input-area">
      <button class="btn-primary" @click="generateCharacterStats">生成角色统计</button>
    </div>
    <div class="output-area">
      <textarea v-model="characterOutput" readonly placeholder="输出结果..."></textarea>
    </div>

    <h3>16. 场景统计</h3>
    <div class="input-area">
      <button class="btn-primary" @click="generateSceneStats">生成场景统计</button>
    </div>
    <div class="output-area">
      <textarea v-model="sceneOutput" readonly placeholder="输出结果..."></textarea>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useApi } from '../composables/useApi'
import { useWorkspaceStore } from '../stores/workspace'

const { callApi } = useApi()
const workspace = useWorkspaceStore()
const characterOutput = ref('')
const sceneOutput = ref('')

function getScriptsPayload() {
  return {
    batch1: workspace.scriptBatchOutputs[1] || '',
    batch2: workspace.scriptBatchOutputs[2] || '',
    batch3: workspace.scriptBatchOutputs[3] || '',
    batch4: workspace.scriptBatchOutputs[4] || '',
    batch5: workspace.scriptBatchOutputs[5] || '',
    batch6: workspace.scriptBatchOutputs[6] || '',
    batch7: workspace.scriptBatchOutputs[7] || '',
    batch8: workspace.scriptBatchOutputs[8] || '',
    batch9: workspace.scriptBatchOutputs[9] || ''
  }
}

async function generateCharacterStats() {
  const data = await callApi({
    action: 'generate_character_stats',
    scripts: getScriptsPayload()
  })
  if (data?.success) {
    characterOutput.value = data.result
  } else {
    characterOutput.value = `错误: ${data?.error || '未知错误'}`
  }
}

async function generateSceneStats() {
  const data = await callApi({
    action: 'generate_scene_stats',
    scripts: getScriptsPayload()
  })
  if (data?.success) {
    sceneOutput.value = data.result
  } else {
    sceneOutput.value = `错误: ${data?.error || '未知错误'}`
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

.module h3 { color: var(--color-text); margin-bottom: 16px; font-size: 1.2rem; }
.module h3:not(:first-child) { margin-top: 24px; }

.input-area { margin-bottom: 12px; }
.btn-primary { padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--color-primary-hover); }

.output-area textarea { width: 100%; min-height: 120px; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); resize: vertical; }
</style>
