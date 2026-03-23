import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
  const storyOutput = ref('')
  const episodeOutputs = ref({
    '1-3': '', '4-6': '', '7-10': '', '11-15': '', '16-20': '',
    '21-30': '', '31-40': '', '41-50': '', '51-60': ''
  })
  const charactersOutput = ref('')
  const scriptBatchOutputs = ref({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: ''
  })

  function setEpisodeOutput(range, value) {
    episodeOutputs.value[range] = value
  }

  function setScriptBatchOutput(id, value) {
    scriptBatchOutputs.value[id] = value
  }

  function getOutlineForRange(range) {
    return episodeOutputs.value[range] || ''
  }

  function getPreviousBatchOutput(batchId) {
    if (batchId <= 1) return ''
    return scriptBatchOutputs.value[batchId - 1] || ''
  }

  return {
    storyOutput,
    episodeOutputs,
    charactersOutput,
    scriptBatchOutputs,
    setEpisodeOutput,
    setScriptBatchOutput,
    getOutlineForRange,
    getPreviousBatchOutput
  }
})
