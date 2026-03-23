<template>
  <section class="module">
    <h3>2. 生成分集大纲</h3>
    <div class="input-area">
      <textarea v-model="input" placeholder="输入故事梗概..."></textarea>
      <button class="btn-primary" @click="generate">生成分集大纲</button>
    </div>
    <div class="batch-grid">
      <div v-for="range in episodeRanges" :key="range" class="batch-item">
        <label>{{ range }}集</label>
        <textarea :value="workspace.episodeOutputs[range]" readonly placeholder="输出结果..."></textarea>
      </div>
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
const episodeRanges = ['1-3', '4-6', '7-10', '11-15', '16-20', '21-30', '31-40', '41-50', '51-60']

async function generate() {
  const data = await callApi({
    action: 'generate_episode_outlines',
    input: input.value
  })
  if (data?.success) {
    const outlines = (data.result || '').split('\n')
    episodeRanges.forEach(r => { workspace.setEpisodeOutput(r, '') })
    outlines.forEach(outline => {
      if (outline) {
        for (const range of episodeRanges) {
          if (outline.includes(`${range}集：`)) {
            workspace.setEpisodeOutput(range, outline.replace(`${range}集：`, '').trim())
            break
          }
        }
      }
    })
  } else {
    workspace.setEpisodeOutput('1-3', `错误: ${data?.error || '未知错误'}`)
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

.input-area { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.input-area textarea { flex: 1; min-width: 200px; min-height: 100px; padding: 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); resize: vertical; }

.btn-primary { padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:hover { background: var(--color-primary-hover); }

.batch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.batch-item { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: var(--color-bg); border-radius: 8px; border: 1px solid var(--color-border); }
.batch-item label { font-weight: 600; color: var(--color-text-muted); font-size: 0.9rem; }
.batch-item textarea { min-height: 80px; padding: 10px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text); resize: vertical; }
</style>
