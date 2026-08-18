<template>
  <div class="team-space-view d-flex flex-column" style="height: 100%">
    <!-- 顶部工具栏 -->
    <div class="d-flex align-center ga-2 pb-2">
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="createDialog = true"
      >
        创建团队
      </v-btn>
      <v-btn
        v-if="currentTeam"
        variant="tonal"
        prepend-icon="mdi-account-group"
        @click="openMemberManage"
      >
        成员管理
      </v-btn>
      <v-btn
        v-if="currentTeam && canQuit"
        variant="text"
        prepend-icon="mdi-logout"
        @click="quitTeam"
      >
        退出团队
      </v-btn>
      <v-btn
        v-if="currentTeam && canDissolve"
        variant="text"
        color="error"
        prepend-icon="mdi-delete-forever"
        @click="dissolveTeam"
      >
        解散团队
      </v-btn>
      <v-spacer />
      <v-progress-circular v-if="loadingTeams" size="20" indeterminate />
    </div>
    <v-divider />
    <div class="d-flex flex-grow-1" style="min-height: 0">
      <!-- 团队列表 -->
      <div class="team-list pa-2" style="width: 260px; border-right: 1px solid rgba(127,127,127,0.2); overflow-y: auto">
        <v-list density="compact" nav>
          <v-list-item
            v-for="t in teams"
            :key="String(t.id)"
            :active="currentTeam?.id === t.id"
            @click="selectTeam(t)"
          >
            <template #prepend>
              <v-icon>mdi-account-group</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ t.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ roleName(t.myRole) }} · {{ t.memberCount ?? 0 }} 人
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <div v-if="teams.length === 0 && !loadingTeams" class="text-caption text-grey text-center pa-4">
          还没有团队，点击「创建团队」开始
        </div>
      </div>
      <!-- 文件浏览区 -->
      <div class="flex-grow-1 pa-2" style="min-width: 0">
        <div v-if="currentTeam">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-1 font-weight-medium">{{ currentTeam.name }}</span>
            <v-chip size="x-small" variant="tonal" class="ml-2">
              {{ roleName(currentTeam.myRole) }}
            </v-chip>
          </div>
          <team-file-browser :uid="currentTeam.id" :my-role="currentTeam.myRole" :team-name="currentTeam.name" />
        </div>
        <div v-else class="d-flex justify-center align-center text-grey" style="height: 100%">
          请选择或创建一个团队
        </div>
      </div>
    </div>
    <!-- 创建团队对话框 -->
    <v-dialog v-model="createDialog" max-width="480">
      <v-card>
        <v-card-title>创建团队</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="createName"
            label="团队名称"
            required
            :rules="[v => !!v || '团队名称不能为空']"
          />
          <v-text-field v-model="createDesc" label="团队描述（可选）" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">
            取消
          </v-btn>
          <v-btn color="primary" :disabled="!createName.trim()" @click="createTeam">
            创建
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import TeamApi from '../api'
import type { TeamInfo } from '../model'
import { TeamRole } from '../model'
import { teamStore } from '../store'
import TeamMemberManage from './team-member-manage.vue'
import TeamFileBrowser from './team-file-browser.vue'

const SfcUtils = (window as any).SfcUtils

/** 团队列表 */
const teams = ref<TeamInfo[]>([])
/** 当前选中团队 */
const currentTeam = ref<TeamInfo | null>(teamStore.currentTeam)
/** 团队加载状态 */
const loadingTeams = ref(false)
/** 创建对话框 */
const createDialog = ref(false)
/** 创建名称 */
const createName = ref('')
/** 创建描述 */
const createDesc = ref('')

/** 是否可退出（非所有者） */
const canQuit = computed(() => !!currentTeam.value && (currentTeam.value.myRole ?? 0) !== TeamRole.OWNER)
/** 是否可解散（所有者或管理员） */
const canDissolve = computed(() => {
  const role = currentTeam.value?.myRole ?? 0
  return role === TeamRole.OWNER || role === TeamRole.MANAGE
})

/**
 * 加载我的团队列表
 */
async function loadTeams() {
  loadingTeams.value = true
  try {
    const res = await SfcUtils.request(TeamApi.list(false))
    teams.value = res.data.data || []
    teamStore.teams = teams.value
    // 刷新当前团队的角色信息
    if (currentTeam.value) {
      currentTeam.value = teams.value.find(t => String(t.id) === String(currentTeam.value!.id)) || null
      teamStore.currentTeam = currentTeam.value
    }
  } finally {
    loadingTeams.value = false
  }
}

/**
 * 选择团队
 * @param t 团队
 */
function selectTeam(t: TeamInfo) {
  currentTeam.value = t
  teamStore.currentTeam = t
}

/**
 * 创建团队
 */
async function createTeam() {
  await SfcUtils.request(TeamApi.create({ name: createName.value.trim(), description: createDesc.value.trim() || undefined }))
  SfcUtils.snackbar('团队创建成功')
  createDialog.value = false
  createName.value = ''
  createDesc.value = ''
  await loadTeams()
}

/**
 * 打开成员管理对话框
 */
function openMemberManage() {
  if (!currentTeam.value) return
  SfcUtils.openComponentDialog(TeamMemberManage, {
    props: { team: currentTeam.value, myRole: currentTeam.value.myRole ?? 1 },
    title: '成员管理：' + currentTeam.value.name
  })
}

/**
 * 退出团队
 */
async function quitTeam() {
  if (!currentTeam.value) return
  if (!window.confirm('确定退出团队「' + currentTeam.value.name + '」吗？')) return
  await SfcUtils.request(TeamApi.quit(currentTeam.value.id))
  SfcUtils.snackbar('已退出团队')
  currentTeam.value = null
  teamStore.currentTeam = null
  await loadTeams()
}

/**
 * 解散团队
 */
async function dissolveTeam() {
  if (!currentTeam.value) return
  if (!window.confirm('确定解散团队「' + currentTeam.value.name + '」吗？团队文件将被删除且不可恢复！')) return
  await SfcUtils.request(TeamApi.deleteTeam(currentTeam.value.id))
  SfcUtils.snackbar('团队已解散')
  currentTeam.value = null
  teamStore.currentTeam = null
  await loadTeams()
}

/**
 * 角色名称
 * @param role 角色值
 */
function roleName(role: number | undefined) {
  switch (role) {
  case TeamRole.READ: return '只读'
  case TeamRole.WRITE: return '读写'
  case TeamRole.MANAGE: return '管理'
  case TeamRole.OWNER: return '所有者'
  default: return '成员'
  }
}

onMounted(loadTeams)
</script>

<style scoped>
.team-space-view {
  padding: 12px;
}
</style>
