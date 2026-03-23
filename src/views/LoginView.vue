<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>Short Drama Script Agent</h1>
        <p>专业的60集短剧创作智能体</p>
      </div>
      <!-- 登录表单 -->
      <form v-if="!isRegister" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">账号</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入账号"
            required
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
        <p v-if="showDemoHint" class="demo-hint">
          GitHub Pages 静态部署无后端，可
          <a href="#" @click.prevent="enterDemo">演示进入</a>
        </p>
      </form>
      <!-- 注册表单 -->
      <form v-else @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label for="reg-username">账号</label>
          <input
            id="reg-username"
            v-model="username"
            type="text"
            placeholder="请输入账号（至少2个字符）"
            required
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label for="reg-password">密码</label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            placeholder="请输入密码（至少6个字符）"
            required
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <label for="confirm-password">确认密码</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
            autocomplete="new-password"
          />
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注 册' }}
        </button>
        <p v-if="showDemoHint" class="demo-hint">
          <a href="#" @click.prevent="enterDemo">演示进入</a>
        </p>
      </form>
      <p class="toggle-form">
        <a href="#" @click.prevent="showDemoHint = false; isRegister = !isRegister; errorMessage = ''">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </a>
      </p>
    </div>
    <div class="bg-pattern"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)
const isRegister = ref(false)
const showDemoHint = ref(false)

function enterDemo() {
  authStore.setAuth('demo-token', username.value || 'demo')
  router.push(route.query.redirect || '/')
}

async function handleLogin() {
  errorMessage.value = ''
  showDemoHint.value = false
  loading.value = true
  try {
    const { data } = await api.post('/api/login', {
      username: username.value,
      password: password.value
    })
    if (data.success) {
      authStore.setAuth(data.token, data.username)
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      errorMessage.value = data.message || '登录失败'
    }
  } catch (err) {
    const status = err.response?.status
    errorMessage.value = err.response?.data?.message || '网络错误，请稍后重试'
    if (status === 405 || status === 404) showDemoHint.value = true
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = '密码至少6个字符'
    return
  }
  loading.value = true
  try {
    const { data } = await api.post('/api/register', {
      username: username.value,
      password: password.value
    })
    if (data.success) {
      authStore.setAuth(data.token, data.username)
      router.push(route.query.redirect || '/')
    } else {
      errorMessage.value = data.message || '注册失败'
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || '网络错误，请稍后重试'
    if (err.response?.status === 405 || err.response?.status === 404) showDemoHint.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91, 79, 199, 0.08), transparent),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0, 168, 132, 0.06), transparent);
  pointer-events: none;
  z-index: 0;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.login-header p {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.form-group input {
  padding: 12px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.error-message {
  color: var(--color-error);
  font-size: 0.9rem;
  text-align: center;
}

.login-btn {
  padding: 14px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-form {
  text-align: center;
  margin-top: 16px;
}

.toggle-form a {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.toggle-form a:hover {
  text-decoration: underline;
}

.demo-hint {
  margin-top: 12px;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
.demo-hint a {
  color: var(--color-primary);
  text-decoration: none;
}
.demo-hint a:hover {
  text-decoration: underline;
}
</style>
