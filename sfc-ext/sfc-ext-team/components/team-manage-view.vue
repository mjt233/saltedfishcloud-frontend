<template>
  <div class="team-manage-view d-flex flex-column" style="height: 100%">
    <!-- 顶部工具栏：创建团队 -->
    <div class="d-flex align-center ga-2 pb-2">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        创建团队
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
            :active="selectedTeam?.id === t.id"
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
      <!-- 团队信息与操作区 -->
      <div class="flex-grow-1 pa-3" style="min-width: 0">
        <div v-if="selectedTeam">
          <div class="d-flex align-center mb-2">
            <span class="text-subtitle-1 font-weight-medium">{{ selectedTeam.name }}</span>
            <v-chip size="small" variant="tonal" class="ml-2">
              {{ roleName(selectedTeam.myRole) }}
            </v-chip>
            <v-spacer />
            <v-btn size="small" variant="tonal" prepend-icon="mdi-account-group" @click="openMemberManage">
              成员管理
            </v-btn>
            <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" class="ml-2" @click="openEditDialog">
              修改信息
            </v-btn>
            <v-btn v-if="canQuit" size="small" variant="text" prepend-icon="mdi-logout" class="ml-2" @click="quitTeam">
              退出团队
            </v-btn>
            <v-btn v-if="canDissolve" size="small" variant="text" color="error" prepend-icon="mdi-delete-forever" class="ml-2" @click="dissolveTeam">
              解散团队
            </v-btn>
          </div>
          <div class="text-body-2 text-grey mb-3">
            {{ selectedTeam.description || '该团队暂无描述' }}
          </div>
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex ga-6">
              <div>
                <div class="text-caption text-grey">团队编号</div>
                <div class="text-body-2">{{ selectedTeam.id }}</div>
              </div>
              <div>
                <div class="text-caption text-grey">成员数量</div>
                <div class="text-body-2">{{ selectedTeam.memberCount ?? 0 }} 人</div>
              </div>
              <div>
                <div class="text-caption text-grey">我的角色</div>
                <div class="text-body-2">{{ roleName(selectedTeam.myRole) }}</div>
              </div>
            </div>
          </v-card>
        </div>
        <div v-else class="d-flex justify-center align-center text-grey" style="height: 100%">
          请选择左侧团队进行管理
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
    <!-- 修改团队信息对话框 -->
    <v-dialog v-model="editDialog" max-width="480">
      <v-card>
        <v-card-title>修改团队信息</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editName"
            label="团队名称"
            required
            :rules="[v => !!v || '团队名称不能为空']"
          />
          <v-text-field v-model="editDesc" label="团队描述（可选）" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">
            取消
          </v-btn>
          <v-btn color="primary" :disabled="!editName.trim()" @click="updateTeam">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TeamApi from '../api'
import type { TeamInfo } from '../model'
import { TeamRole } from '../model'
import { teamStore } from '../store'
import TeamMemberManage from './team-member-manage.vue'

const SfcUtils = (window as any).SfcUtils

/** 团队列表 */
const teams = ref<TeamInfo[]>([])
/** 当前选中的团队 */
const selectedTeam = ref<TeamInfo | null>(teamStore.currentTeam)
/** 团队加载状态 */
const loadingTeams = ref(false)
/** 创建团队对话框开关 */
const createDialog = ref(false)
/** 创建团队名称 */
const createName = ref('')
/** 创建团队描述 */
const createDesc = ref('')
/** 修改团队信息对话框开关 */
const editDialog = ref(false)
/** 修改团队名称 */
const editName = ref('')
/** 修改团队描述 */
const editDesc = ref('')

/** 是否可退出（非所有者） */
const canQuit = computed(() => !!selectedTeam.value && (selectedTeam.value.myRole ?? 0) !== TeamRole.OWNER)
/** 是否可解散（所有者或管理员） */
const canDissolve = computed(() => {
  const role = selectedTeam.value?.myRole ?? 0
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
    // 同步选中团队：优先跟随 store 中的当前团队，其次保留本页原选择；团队已不存在则清空
    const target = teamStore.currentTeam || selectedTeam.value
    const fresh = target && teams.value.find(t => String(t.id) === String(target.id)) || null
    selectedTeam.value = fresh
    teamStore.currentTeam = fresh
  } finally {
    loadingTeams.value = false
  }
}

/**
 * 选择团队
 * @param t 团队
 */
function selectTeam(t: TeamInfo) {
  selectedTeam.value = t
  // 同步到全局 store，供团队空间页面共享当前团队
  teamStore.currentTeam = t
}

/**
 * 打开创建团队对话框
 */
function openCreateDialog() {
  createName.value = ''
  createDesc.value = ''
  createDialog.value = true
}

/**
 * 创建团队
 */
async function createTeam() {
  const res = await SfcUtils.request(TeamApi.create({ name: createName.value.trim(), description: createDesc.value.trim() || undefined }))
  const created = res.data.data as TeamInfo | undefined
  SfcUtils.snackbar('团队创建成功')
  createDialog.value = false
  // 先同步当前团队，刷新列表后保持选中新创建的团队
  if (created) {
    selectedTeam.value = created
    teamStore.currentTeam = created
  }
  await loadTeams()
}

/**
 * 打开修改团队信息对话框
 */
function openEditDialog() {
  if (!selectedTeam.value) return
  editName.value = selectedTeam.value.name
  editDesc.value = selectedTeam.value.description || ''
  editDialog.value = true
}

/**
 * 保存修改团队信息
 */
async function updateTeam() {
  if (!selectedTeam.value) return
  await SfcUtils.request(TeamApi.updateInfo({
    teamId: selectedTeam.value.id,
    name: editName.value.trim(),
    description: editDesc.value.trim() || undefined
  }))
  SfcUtils.snackbar('团队信息已更新')
  editDialog.value = false
  await loadTeams()
}

/**
 * 打开成员管理对话框
 */
function openMemberManage() {
  if (!selectedTeam.value) return
  SfcUtils.openComponentDialog(TeamMemberManage, {
    props: { team: selectedTeam.value, myRole: selectedTeam.value.myRole ?? 1 },
    title: '成员管理：' + selectedTeam.value.name
  })
}

/**
 * 退出团队
 */
async function quitTeam() {
  if (!selectedTeam.value) return
  if (!window.confirm('确定退出团队「' + selectedTeam.value.name + '」吗？')) return
  await SfcUtils.request(TeamApi.quit(selectedTeam.value.id))
  SfcUtils.snackbar('已退出团队')
  selectedTeam.value = null
  teamStore.currentTeam = null
  await loadTeams()
}

/**
 * 解散团队
 */
async function dissolveTeam() {
  if (!selectedTeam.value) return
  if (!window.confirm('确定解散团队「' + selectedTeam.value.name + '」吗？团队文件将被删除且不可恢复！')) return
  await SfcUtils.request(TeamApi.deleteTeam(selectedTeam.value.id))
  SfcUtils.snackbar('团队已解散')
  selectedTeam.value = null
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
.team-manage-view {
  padding: 12px;
}
</style>