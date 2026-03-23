<template>
  <section class="module">
    <h3>5-13. 生成剧本</h3>
    <div class="batch-grid">
      <div v-for="batch in batches" :key="batch.id" class="batch-item">
        <label>{{ batch.range }}集</label>
        <textarea v-model="batch.input" placeholder="输入相关信息..."></textarea>
        <button class="btn-primary" @click="generateBatch(batch)">生成</button>
        <textarea v-model="batch.output" readonly placeholder="输出结果..."></textarea>
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

const batches = ref([
  { id: 1, start: 1, end: 3, range: '1-3', outlineId: '1-3', prevId: null, input: '', output: '' },
  { id: 2, start: 4, end: 6, range: '4-6', outlineId: '4-6', prevId: 1, input: '', output: '' },
  { id: 3, start: 7, end: 10, range: '7-10', outlineId: '7-10', prevId: 2, input: '', output: '' },
  { id: 4, start: 11, end: 15, range: '11-15', outlineId: '11-15', prevId: 3, input: '', output: '' },
  { id: 5, start: 16, end: 20, range: '16-20', outlineId: '16-20', prevId: 4, input: '', output: '' },
  { id: 6, start: 21, end: 30, range: '21-30', outlineId: '21-30', prevId: 5, input: '', output: '' },
  { id: 7, start: 31, end: 40, range: '31-40', outlineId: '31-40', prevId: 6, input: '', output: '' },
  { id: 8, start: 41, end: 50, range: '41-50', outlineId: '41-50', prevId: 7, input: '', output: '' },
  { id: 9, start: 51, end: 60, range: '51-60', outlineId: '51-60', prevId: 8, input: '', output: '' }
])

async function generateBatch(batch) {
  const wordReq = batch.end <= 6 ? '（每集至少1000字）' : '（每集至少800字）'
  const data = await callApi({
    action: 'generate_scripts',
    input: batch.input,
    start: batch.start,
    end: batch.end,
    word_count_requirement: wordReq,
    outline_content: workspace.getOutlineForRange(batch.outlineId),
    previous_batch_content: workspace.getPreviousBatchOutput(batch.id)
  })
  if (data?.success) {
    batch.output = data.result
    workspace.setScriptBatchOutput(batch.id, data.result)
  } else {
    batch.output = `错误: ${data?.error || '未知错误'}`
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

.batch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.batch-item { display: flex; flex-direction: column; gap: 10px; padding: 16px; background: var(--color-bg); border-radius: 8px; border: 1px solid var(--color-border); }
.batch-item label { font-weight: 600; color: var(--color-text-muted); font-size: 0.9rem; }
.batch-item textarea { padding: 10px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text); resize: vertical; min-height: 60px; }
.batch-item textarea[readonly] { min-height: 100px; }
.batch-item .btn-primary { align-self: flex-start; padding: 8px 16px; font-size: 0.9rem; }
.btn-primary { background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: var(--color-primary-hover); }
</style>
