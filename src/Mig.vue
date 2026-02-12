<template>
  <div class="migration-overlay">
    <div class="migration-card">
      <div class="migration-header">
        <h2>🚀 My Diary App 已升级！</h2>
      </div>
      
      <div class="migration-body">
        <p>我们启用了<b>更快、更安全</b>的专属域名：</p>
        <p class="new-domain">👉 <strong>https://diary.clspd.top</strong></p>
        <p>您需要将账号凭据迁移到新域名，<b style="color: #1890ff;">只需 5 秒</b>：</p>
        
        <div class="step" v-if="!cleared">
          <span class="step-num">1</span>
          <span>点击下方按钮，<b>一键复制您的凭据</b></span>
        </div>
        <div><el-button 
          type="primary" 
          plain 
          class="copy-btn"
          @click="copyCredentials"
          :loading="copying"
           v-if="!cleared"
        >
          {{ copied ? '✅ 已复制' : '📋 一键复制凭据' }}
        </el-button></div>
        <div><el-button 
          class="copy-btn"
          @click="exportToFile"
           v-if="!cleared"
        >导出到文件（可选）</el-button></div>
        
        <div class="step">
          <span class="step-num">2</span>
          <span>（可选）点击下方按钮，<b>一键清除您在当前页面的凭据</b>，防止数据泄露</span>
        </div>
        <el-button
          type="danger" 
          plain 
          class="copy-btn"
          @click="clearCredentials"
          :disabled="!exported || cleared"
        >
          {{ cleared ? '✅ 已清除' : (exported ? '📋 一键清除凭据' : '！ 请务必先导出数据！') }}
        </el-button>
        
        <div class="step">
          <span class="step-num">3</span>
          <span>点击下方按钮，<b>前往新域名并导入</b></span>
        </div>
        <el-button 
          type="primary" 
          class="goto-btn"
          @click="goToNewSite"
        >
          🌐 立即前往 diary.clspd.top
        </el-button>

        <div><b>可选</b>：<a href="https://diary.clspd.top/#/login" target="_blank">在新标签页打开</a></div>
        
        <p class="tip">💡 导入方法：在新域名登录页面，点击「导入凭据」并粘贴</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { u } from './user.js'
import { db_name, setShouldShowExpiredDialog } from './userdata.js'

const neverShow = ref(false)
const copying = ref(false)
const copied = ref(false)
const exported = ref(false)
const cleared = ref(false)

function checkCredentials(jsonString) {
  if (jsonString === '{}') throw "凭据为空。如果您之前从来没有存放过凭据，那么您无需迁移，直接访问新域名即可。如果您之前存放过凭据，那么请确保您刚才输入了正确的 PIN 。没有 PIN ，我们也无法解密您的数据。"
}

async function copyCredentials() {
  copying.value = true
  try {
    // 直接从 user.js 获取凭据，不依赖路由
    const credits = await u.getx('LogonData') || {}
    
    const jsonString = JSON.stringify(credits)
    checkCredentials(jsonString)
    
    await navigator.clipboard.writeText(jsonString)
    copied.value = true
    exported.value = true
    ElMessage.success('凭据已复制到剪贴板！')
    
    // 3秒后重置按钮状态
    setTimeout(() => {
      copied.value = false
    }, 3000)
  } catch (error) {
    ElMessage.error('复制失败：' + error)
  } finally {
    copying.value = false
  }
}

async function exportToFile() {
  try {
    // 直接从 user.js 获取凭据，不依赖路由
    const credits = await u.getx('LogonData') || {}
    
    const jsonString = JSON.stringify(credits)
    checkCredentials(jsonString)
    
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'my_diary_credentials.json'
    document.body.appendChild(a)
    a.click()
    await new Promise(resolve => setTimeout(resolve, 100))
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    exported.value = true
    
    ElMessage.success('凭据已导出到文件！')
  } catch (error) {
    ElMessage.error('导出失败：' + error)
  }
}

async function clearCredentials() {
  if (!exported.value) {
    ElMessage.warning('请先导出凭据！！！')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确认清除当前页面的凭据吗？清除操作不可逆！！请务必确保您已备份好数据，否则将无法恢复！！！',
      '清除凭据',
      {
        confirmButtonText: '我已备份好数据，确认清除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )
    await ElMessageBox.confirm(
      '这是最后的警告！一旦您选择继续，当前域名下的凭据将被永久清除，无法恢复！！！请务必确认您已备份好数据！',
      '清除凭据',
      {
        confirmButtonText: '确认清除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    setShouldShowExpiredDialog(false);
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(db_name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    cleared.value = true
    ElMessage.success('凭据已永久清除！您的数据现在非常安全！')
  } catch (error) {
    ElMessage.error('清除失败：' + error)
  }
}



function goToNewSite() {
  window.open('https://diary.clspd.top/#/login', '_self')
}

</script>

<style scoped>
.migration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: auto;
  z-index: 100;
}

.migration-card {
  width: 480px;
  max-width: 90%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  animation: slideIn 0.3s ease;
  margin: auto;
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.migration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.migration-header h2 {
  margin: 0;
  font-size: 1.4em;
  color: #1890ff;
}

.migration-body {
  padding: 20px;
}

.new-domain {
  background: #f6f8fa;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  font-size: 1.2em;
  margin: 12px 0;
}

.step {
  display: flex;
  align-items: center;
  margin: 16px 0 8px;
}

.step-num {
  display: inline-flex;
  width: 24px;
  height: 24px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  font-size: 14px;
}

.copy-btn, .goto-btn {
  width: 100%;
  margin: 8px 0;
  height: 44px;
  font-size: 16px;
}

.tip {
  margin-top: 16px;
  color: #666;
  font-size: 0.9em;
  padding: 8px;
  background: #fff7e6;
  border-radius: 4px;
}

.migration-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>