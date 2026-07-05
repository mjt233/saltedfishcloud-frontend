<template>
  <div class="ml-2 mr-2">
    <VCard title="OIDC 权限管理">
      <VCardText>
        <!-- 顶部操作栏 -->
        <div class="d-flex align-center mb-4 flex-wrap ga-2">
          <VBtn
            color="primary"
            :loading="isLoading"
            @click="loadModules"
          >
            <template #prepend>
              <CommonIcon icon="mdi-refresh" class="mb-1" />
            </template>
            刷新
          </VBtn>
          <!-- 搜索框：按名称、id、描述搜索 -->
          <VTextField
            v-model="searchKeyword"
            placeholder="按名称、ID 或描述搜索..."
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            class="flex-1"
            style="min-width: 240px; max-width: 480px;"
          />
          <!-- 全部展开/折叠切换 -->
          <VBtn
            class="mb-1"
            variant="text"
            size="small"
            :icon="allExpanded ? 'mdi-arrow-expand-vertical' : 'mdi-arrow-collapse-vertical'"
            @click="toggleExpandAll"
          />
        </div>

        <!-- 加载中提示 -->
        <VProgressLinear
          v-if="isLoading"
          indeterminate
          color="primary"
          class="mb-4"
        />

        <!-- 空数据提示 -->
        <VAlert
          v-if="!isLoading && filteredModules.length === 0"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          {{ searchKeyword ? '没有匹配的 OIDC 权限数据' : '暂无 OIDC 权限模块数据' }}
        </VAlert>

        <!-- 多级列表：模块 -> scope -->
        <VList
          v-if="filteredModules.length > 0"
          v-model:opened="openedGroups"
          class="pa-0"
        >
          <VListGroup
            v-for="module in filteredModules"
            :key="module.moduleId"
            :value="module.moduleId"
          >
            <template #activator="{ props: activatorProps }">
              <VListItem v-bind="activatorProps">
                <template #prepend>
                  <CommonIcon
                    :icon="module.icon || 'mdi-package-variant-closed'"
                    class="mr-2"
                  />
                </template>
                <VListItemTitle class="font-weight-bold">
                  {{ module.moduleName }}
                </VListItemTitle>
                <VListItemSubtitle v-if="module.description">
                  {{ module.description }}
                </VListItemSubtitle>
                <template #append>
                  <VChip size="small" color="primary" variant="tonal">
                    {{ module.scopes?.length || 0 }} 个权限
                  </VChip>
                </template>
              </VListItem>
            </template>

            <!-- scope 子列表 -->
            <VListItem
              v-for="scope in module.scopes"
              :key="`${module.moduleId}-${scope.id}`"
              class="pl-8"
            >
              <template #prepend>
                <CommonIcon
                  :icon="scope.icon || 'mdi-shield-key-outline'"
                  class="mr-2"
                />
              </template>
              <VListItemTitle>
                {{ scope.name }}
                <span class="text-caption text-medium-emphasis ml-2">
                  ({{ scope.id }})
                </span>
                <!-- 危险权限标识 -->
                <VIcon
                  v-if="scope.isDanger"
                  size="x-small"
                  color="warning"
                  variant="tonal"
                  class="ml-2"
                  title="危险权限"
                >
                  mdi-alert-outline
                </VIcon>
              </VListItemTitle>
              <VListItemSubtitle v-if="scope.description">
                {{ scope.description }}
              </VListItemSubtitle>
            </VListItem>

            <!-- 模块下无 scope 时的提示 -->
            <VListItem
              v-if="!module.scopes || module.scopes.length === 0"
              class="pl-8"
            >
              <VListItemTitle class="text-medium-emphasis">
                该模块暂无权限项
              </VListItemTitle>
            </VListItem>
          </VListGroup>
        </VList>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { OidcScopeModuleVO, OidcScopeInfo } from 'sfc-common/model/Oauth'
import { LoadingManager } from 'sfc-common'
import API from 'sfc-common/api'
import SfcUtils from 'sfc-common/utils/SfcUtils'
import { CommonIcon } from 'sfc-common/components'

/**
 * OIDC 权限模块管理视图
 * 展示系统中所有已注册的 OIDC scope 模块及其 scope 列表
 */

// OIDC scope 模块列表
const modules = ref<OidcScopeModuleVO[]>([])
// 加载管理器
const lm = new LoadingManager()
// 是否加载中
const isLoading = lm.getLoadingRef()
// 搜索关键字
const searchKeyword = ref('')
// 已展开的模块 id 列表
const openedGroups = ref<string[]>([])

/**
 * 过滤后的模块列表：按名称、ID、描述搜索
 */
const filteredModules = computed<OidcScopeModuleVO[]>(() => {
  const keyword = (searchKeyword.value || '').trim().toLowerCase()
  if (!keyword) {
    return modules.value
  }
  // 过滤模块，并过滤每个模块下的 scope
  return modules.value
    .map(module => {
      // 模块本身匹配关键字
      const moduleMatched =
        (module.moduleName || '').toLowerCase().includes(keyword) ||
        (module.moduleId || '').toLowerCase().includes(keyword) ||
        (module.description || '').toLowerCase().includes(keyword)
      // 过滤模块下匹配的 scope
      const matchedScopes = (module.scopes || []).filter(scope =>
        (scope.name || '').toLowerCase().includes(keyword) ||
        (scope.id || '').toLowerCase().includes(keyword) ||
        (scope.description || '').toLowerCase().includes(keyword)
      )
      // 模块匹配则保留全部 scope，否则只保留匹配的 scope
      if (moduleMatched) {
        return { ...module, scopes: module.scopes || [] }
      }
      if (matchedScopes.length > 0) {
        return { ...module, scopes: matchedScopes }
      }
      return null
    })
    .filter((m): m is OidcScopeModuleVO => m !== null)
})

/**
 * 是否全部展开
 */
const allExpanded = computed(() => {
  return filteredModules.value.length > 0 &&
    filteredModules.value.every(m => openedGroups.value.includes(m.moduleId))
})

/**
 * 切换全部展开/折叠
 */
function toggleExpandAll() {
  if (allExpanded.value) {
    openedGroups.value = []
  } else {
    openedGroups.value = filteredModules.value.map(m => m.moduleId)
  }
}

/**
 * 加载 OIDC scope 模块列表
 */
async function loadModules() {
  try {
    // 调用接口获取所有 scope 模块
    const res = await SfcUtils.request(API.oauth.listScopeModules())
    modules.value = res.data.data || []
    // 默认展开全部模块
    openedGroups.value = modules.value.map(m => m.moduleId)
  } catch (error) {
    console.error('加载 OIDC 权限模块失败:', error)
    modules.value = []
    openedGroups.value = []
  }
}

// 搜索关键字变化时，自动展开所有过滤后的模块
watch(searchKeyword, () => {
  openedGroups.value = filteredModules.value.map(m => m.moduleId)
})

// 初始化数据
onMounted(() => {
  loadModules()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OidcScopeModuleView'
})
</script>