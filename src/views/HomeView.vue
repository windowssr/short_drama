<template>
  <div class="home-view">
    <header class="main-header">
      <div class="header-content">
        <h1>Short Drama Script Agent</h1>
        <p>专业的60集短剧创作智能体</p>
        <div class="header-actions">
          <span class="username">{{ authStore.username }}</span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <StoryModule />
      <EpisodesModule />
      <CharactersModule />
      <ScriptBatchesModule />
      <DownloadModule />
      <StatsModule />
    </main>

    <footer class="main-footer">
      <p>&copy; 2026 Short Drama Script Agent</p>
    </footer>

    <Transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>生成中，请稍候...</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import StoryModule from '../components/StoryModule.vue'
import EpisodesModule from '../components/EpisodesModule.vue'
import CharactersModule from '../components/CharactersModule.vue'
import ScriptBatchesModule from '../components/ScriptBatchesModule.vue'
import DownloadModule from '../components/DownloadModule.vue'
import StatsModule from '../components/StatsModule.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

provide('setLoading', (value) => { loading.value = value })

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.header-content p {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.logout-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-footer {
  text-align: center;
  padding: 20px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  border-top: 1px solid var(--color-border);
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-overlay .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.loading-overlay p {
  color: var(--color-text-muted);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
