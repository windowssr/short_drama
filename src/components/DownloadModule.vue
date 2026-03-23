<template>
  <section class="module download-module">
    <h3>14. 下载完整剧本</h3>
    <button class="btn-download" @click="download">下载剧本</button>
    <p v-if="message" :class="messageType">{{ message }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import { useApi } from '../composables/useApi'

const workspace = useWorkspaceStore()
const { downloadScript } = useApi()
const message = ref('')
const messageType = ref('success')

async function download() {
  const episodeRanges = ['1-3', '4-6', '7-10', '11-15', '16-20', '21-30', '31-40', '41-50', '51-60']
  let episodesOutput = ''
  episodeRanges.forEach(range => {
    const content = workspace.episodeOutputs[range]
    if (content) episodesOutput += `${range}集：${content}\n\n`
  })

  const batchOutputs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => workspace.scriptBatchOutputs[i] || '')

  try {
    const blob = await downloadScript({
      story: workspace.storyOutput,
      episodes: episodesOutput,
      characters: workspace.charactersOutput,
      batches: batchOutputs
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'short_drama_script.docx'
    a.click()
    URL.revokeObjectURL(url)
    message.value = '剧本下载成功！'
    messageType.value = 'success'
  } catch (err) {
    message.value = `下载失败: ${err.message}`
    messageType.value = 'error'
  }
  setTimeout(() => { message.value = '' }, 3000)
}
</script>

<style scoped>
.module {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

.download-module {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(124, 92, 255, 0.1), rgba(0, 212, 170, 0.05));
  border: 2px dashed var(--color-primary);
}

.module h3 { color: var(--color-text); margin-bottom: 20px; font-size: 1.2rem; }

.btn-download {
  padding: 14px 32px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-download:hover {
  filter: brightness(1.1);
}

.download-module p { margin-top: 16px; }
.download-module p.success { color: var(--color-accent); }
.download-module p.error { color: var(--color-error); }
</style>
