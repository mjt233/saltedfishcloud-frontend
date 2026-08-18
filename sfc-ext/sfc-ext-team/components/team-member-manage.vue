<template>
  <div class="team-member-manage">
    <!-- 操作栏 -->
    <div class="d-flex align-center ga-2 mb-3">
      <v-btn size="small" color="primary" prepend-icon="mdi-account-plus" @click="openAddDialog">添加成员</v-btn>
      <v-spacer />
      <v-chip size="small" variant="tonal">{{ team.name }}</v-chip>
    </div>
    <!-- 正常成员 -->
    <v-table density="compact" hover>
      <thead>
        <tr>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in memberList.members.content" :key="String(m.uid)">
          <td>{{ m.username || String(m.uid) }}</td>
          <td class="text-caption text-grey">{{ m.email || '-' }}</td>
          <td>
            <v-select v-if="canManage && m.role !== 4" :model-value="m.role" :items="roleItems" density="compact" hide-details style="max-width: 130px" @update:model-value="v => changeRole(m, v as number)" />
            <v-chip v-else size="x-small" color="primary" variant="tonal">{{ roleName(m.role) }}</v-chip>
          </td>
          <td>
            <v-btn v-if="isOwner && m.role !== 4" size="x-small" variant="text" prepend-icon="mdi-crown" @click="transfer(m)">转移所有权</v-btn>
            <v-btn v-if="canManage && m.role !== 4" size="x-small" variant="text" icon="mdi-delete" title="移除成员" @click="removeMember(m)" />
          </td>
        </tr>
        <tr v-if="memberList.members.content.length === 0">
          <td colspan="4" class="text-center text-grey py-4">暂无成员</td>
        </tr>
      </tbody>
    </v-table>
    <!-- 待注册成员 -->
    <div class="text-subtitle-2 mt-4 mb-1 d-flex align-center">
      待注册成员
      <v-chip v-if="memberList.invites.length > 0" size="x-small" color="warning" class="ml-2">{{ memberList.invites.length }}</v-chip>
    </div>
    <v-table density="compact" hover>
      <tbody>
        <tr v-for="iv in memberList.invites" :key="String(iv.inviteId)">
          <td>{{ iv.username || (iv.email || '（未填写）') }}</td>
          <td class="text-caption text-grey">
            <v-chip size="x-small" color="warning" variant="tonal">未注册</v-chip>
            <v-chip v-if="iv.expired" size="x-small" color="error" variant="tonal" class="ml-1">已过期</v-chip>
          </td>
          <td class="text-caption text-grey">{{ roleName(iv.role) }}</td>
          <td class="text-right">
            <v-btn size="x-small" variant="text" prepend-icon="mdi-link-variant" @click="copyInviteLink(iv)">复制链接</v-btn>
            <v-btn size="x-small" variant="text" icon="mdi-refresh" title="重新生成" @click="regenerate(iv)" />
            <v-btn size="x-small" variant="text" icon="mdi-close" title="撤销" @click="revoke(iv)" />
          </td>
        </tr>
        <tr v-if="memberList.invites.length === 0">
          <td colspan="4" class="text-center text-grey py-4">暂无待注册成员</td>
        </tr>
      </tbody>
    </v-table>
    <!-- 添加成员对话框 -->
    <v-dialog v-model="addDialog" max-width="560">
      <v-card>
        <v-card-title>添加成员</v-card-title>
        <v-card-text>
          <v-text-field v-model="searchKeyword" label="输入用户名或邮箱搜索" prepend-icon="mdi-magnify" clearable @keyup.enter="doSearch" @update:model-value="onSearchInput" />
          <v-list v-if="searchResults.length > 0" density="compact" max-height="200" class="border">
            <v-list-item v-for="u in searchResults" :key="String(u.uid)" :title="u.username" :subtitle="u.email" @click="selectSearchUser(u)">
              <template #append>
                <v-btn size="x-small" variant="text" icon="mdi-plus" />
              </template>
            </v-list-item>
          </v-list>
          <div v-if="searched && searchResults.length === 0" class="text-caption text-grey mt-2">
            未找到已注册用户，可在下方创建新成员邀请
          </div>
          <!-- 新成员邀请表单 -->
          <v-divider class="my-3" />
          <div class="text-subtitle-2 mb-1">创建新成员邀请</div>
          <div class="d-flex ga-2">
            <v-text-field v-model="inviteUsername" label="用户名（可留空）" density="compact" hide-details />
            <v-text-field v-model="inviteEmail" label="邮箱（可留空）" density="compact" hide-details />
          </div>
          <v-select v-model="inviteRole" :items="roleItems" label="接受后角色" density="compact" class="mt-2" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addDialog = false">取消</v-btn>
          <v-btn color="primary" @click="createInvite">创建邀请</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { TeamInfo, MemberItem, InviteItem, UserSearchItem, TeamMemberList } from '../model'
import TeamApi from '../api'
import { TeamRole } from '../model'

const props = defineProps<{
  /** 团队信息 */
  team: TeamInfo
  /** 当前用户角色 */
  myRole: number
}>()

const SfcUtils = (window as any).SfcUtils

/** 成员列表数据 */
const memberList = ref<TeamMemberList>({ members: { content: [], totalCount: 0, totalPage: 0 }, invites: [] })
/** 是否可管理（MANAGE 及以上） */
const canManage = computed(() => (props.myRole ?? 0) >= 3)
/** 是否所有者 */
const isOwner = computed(() => props.myRole === TeamRole.OWNER)
/** 角色选项 */
const roleItems = [
  { title: '只读', value: TeamRole.READ },
  { title: '读写', value: TeamRole.WRITE },
  { title: '管理', value: TeamRole.MANAGE }
]

/** 添加成员对话框开关 */
const addDialog = ref(false)
/** 搜索关键词 */
const searchKeyword = ref('')
/** 搜索结果 */
const searchResults = ref<UserSearchItem[]>([])
/** 是否已搜索（用于提示无结果） */
const searched = ref(false)
/** 邀请用户名 */
const inviteUsername = ref('')
/** 邀请邮箱 */
const inviteEmail = ref('')
/** 邀请角色 */
const inviteRole = ref<number>(TeamRole.READ)

/**
 * 加载成员列表
 */
async function loadMembers() {
  const res = await SfcUtils.request(TeamApi.memberList(props.team.id))
  memberList.value = res.data.data
}

/**
 * 打开添加成员对话框
 */
function openAddDialog() {
  addDialog.value = true
  searchKeyword.value = ''
  searchResults.value = []
  searched.value = false
}

/**
 * 搜索输入防抖处理
 */
function onSearchInput() {
  // 输入时直接搜索，简单防抖
  window.clearTimeout((onSearchInput as any).timer)
  ;(onSearchInput as any).timer = window.setTimeout(doSearch, 300)
}

/**
 * 执行用户搜索
 */
async function doSearch() {
  const kw = (searchKeyword.value || '').trim()
  if (!kw) {
    searchResults.value = []
    searched.value = false
    return
  }
  const res = await SfcUtils.request(TeamApi.searchUser(kw))
  searchResults.value = res.data.data || []
  searched.value = true
}

/**
 * 选择搜索结果中的已注册用户并直接添加
 * @param u 用户
 */
async function selectSearchUser(u: UserSearchItem) {
  if (!window.confirm('将 ' + u.username + ' 添加为团队成员（角色：' + roleName(inviteRole.value) + '）？')) return
  await SfcUtils.request(TeamApi.addMember(props.team.id, u.uid, inviteRole.value))
  SfcUtils.snackbar('已添加成员')
  addDialog.value = false
  loadMembers()
}

/**
 * 创建新成员邀请
 */
async function createInvite() {
  await SfcUtils.request(TeamApi.createInvite({
    teamId: props.team.id,
    username: inviteUsername.value.trim() || undefined,
    email: inviteEmail.value.trim() || undefined,
    role: inviteRole.value
  }))
  SfcUtils.snackbar('邀请已创建')
  addDialog.value = false
  inviteUsername.value = ''
  inviteEmail.value = ''
  loadMembers()
}

/**
 * 复制邀请链接
 * @param iv 邀请
 */
async function copyInviteLink(iv: InviteItem) {
  const link = buildInviteLink(iv.token)
  await SfcUtils.copyToClipboard(link)
  SfcUtils.snackbar('邀请链接已复制')
}

/**
 * 构建邀请链接
 * @param token 邀请令牌
 */
function buildInviteLink(token: string) {
  return SfcUtils.getApiUrl({ url: '/plugin/sfc-ext-team/resource/invite.html' }) + '?token=' + encodeURIComponent(token)
}

/**
 * 重新生成邀请链接
 * @param iv 邀请
 */
async function regenerate(iv: InviteItem) {
  await SfcUtils.request(TeamApi.regenerateInvite(props.team.id, iv.inviteId))
  SfcUtils.snackbar('已重新生成，旧链接作废')
  loadMembers()
}

/**
 * 撤销邀请
 * @param iv 邀请
 */
async function revoke(iv: InviteItem) {
  if (!window.confirm('确定撤销该邀请吗？链接将立即失效')) return
  await SfcUtils.request(TeamApi.revokeInvite(props.team.id, iv.inviteId))
  SfcUtils.snackbar('已撤销邀请')
  loadMembers()
}

/**
 * 修改成员角色
 * @param m 成员
 * @param role 新角色
 */
async function changeRole(m: MemberItem, role: number) {
  await SfcUtils.request(TeamApi.updateMemberRole(props.team.id, m.uid, role))
  SfcUtils.snackbar('角色已更新')
}

/**
 * 移除成员
 * @param m 成员
 */
async function removeMember(m: MemberItem) {
  if (!window.confirm('确定移除成员 ' + (m.username || m.uid) + ' 吗？')) return
  await SfcUtils.request(TeamApi.removeMember(props.team.id, m.uid))
  SfcUtils.snackbar('已移除成员')
  loadMembers()
}

/**
 * 转移所有权
 * @param m 目标成员
 */
async function transfer(m: MemberItem) {
  if (!window.confirm('确定将所有权转移给 ' + (m.username || m.uid) + ' 吗？')) return
  await SfcUtils.request(TeamApi.transferOwner(props.team.id, m.uid))
  SfcUtils.snackbar('所有权已转移')
  loadMembers()
}

/**
 * 角色名称
 * @param role 角色值
 */
function roleName(role: number) {
  switch (role) {
    case TeamRole.READ: return '只读'
    case TeamRole.WRITE: return '读写'
    case TeamRole.MANAGE: return '管理'
    case TeamRole.OWNER: return '所有者'
    default: return '未知'
  }
}

onMounted(loadMembers)
</script>
