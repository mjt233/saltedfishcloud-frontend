<template>
  <div class="team-space-view d-flex flex-column" style="height: 100%">
    <!-- 顶部工具栏：左上角团队选择 -->
    <div class="d-flex align-center ga-2 pb-2">
      <v-select
        v-model="currentTeamId"
        :items="teams"
        item-title="name"
        item-value="id"
        label="选择团队"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        style="max-width: 340px"
      />
      <v-chip v-if="currentTeam" size="small" variant="tonal">
        {{ roleName(currentTeam.myRole) }}
      </v-chip>
      <v-spacer />
      <v-progress-circular v-if="loadingTeams" size="20" indeterminate />
    </div>
    <v-divider />
    <!-- 团队文件浏览区 -->
    <div class="flex-grow-1 pt-2" style="min-height: 0">
      <team-file-browser
        v-if="currentTeam"
        :key="String(currentTeam.id)"
        :uid="currentTeam.id"
        :my-role="currentTeam.myRole"
        :team-name="currentTeam.name"
      />
      <div v-else class="d-flex justify-center align-center text-grey" style="height: 100%">
        暂无团队，可到「百宝箱 - 团队管理」中创建或加入团队
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TeamApi from '../api'
import type { TeamInfo } from '../model'
import { TeamRole } from '../model'
import { teamStore } from '../store'
import TeamFileBrowser from './team-file-browser.vue'

const SfcUtils = (window as any).SfcUtils

/** 团队列表 */
const teams = ref<TeamInfo[]>([])
/** 当前选中团队 id（左上角下拉框双向绑定） */
const currentTeamId = ref<string | number | null>(teamStore.currentTeam ? teamStore.currentTeam.id : null)
/** 团队加载状态 */
const loadingTeams = ref(false)

/** 当前选中的团队对象（根据 id 从团队列表中解析） */
const currentTeam = computed(() => teams.value.find(t => String(t.id) === String(currentTeamId.value)) || null)

// 选择变更时同步到全局 store，便于与其他页面（如团队管理）共享当前团队
watch(currentTeamId, (id) => {
  const t = teams.value.find(tt => String(tt.id) === String(id)) || null
  teamStore.currentTeam = t
})

// 其他页面（如团队管理）切换当前团队时，本页同步更新选择
watch(() => teamStore.currentTeam, (team) => {
  if (team == null) {
    if (currentTeamId.value != null) currentTeamId.value = null
  } else if (String(currentTeamId.value) !== String(team.id)) {
    currentTeamId.value = team.id
  }
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
    // 刷新当前团队：优先保持 store 中的选择；其次保持当前选择；
    // 两者都无效时默认选中第一个团队（无团队则清空）
    const storeTeam = teamStore.currentTeam
    const storeValid = !!storeTeam && teams.value.some(t => String(t.id) === String(storeTeam.id))
    const currentValid = currentTeamId.value != null && teams.value.some(t => String(t.id) === String(currentTeamId.value))
    if (storeValid) {
      currentTeamId.value = storeTeam!.id
    } else if (!currentValid) {
      currentTeamId.value = teams.value.length > 0 ? teams.value[0].id : null
    }
  } finally {
    loadingTeams.value = false
  }
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