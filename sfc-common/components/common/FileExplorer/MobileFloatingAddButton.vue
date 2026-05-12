<template>
  <!-- 移动端悬浮新增按钮 -->
  <div class="mobile-floating-add-button">
    <!-- 背景遮罩，点击关闭菜单 -->
    <VFadeTransition>

      <div
        v-show="menuOpen"
        class="menu-backdrop"
        @click="closeMenu"
      />
    </VFadeTransition>
      
    <!-- 主按钮 -->
    <VMenu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="top"
      offset="10"
      transition="slide-y-transition"
    >
      <template #activator="{ props: menuProps }">
        <VBtn
          v-if="!readOnly"
          v-bind="menuProps"
          :color="menuOpen ? 'secondary' : 'primary'"
          :icon="menuOpen ? 'mdi-close' : 'mdi-plus'"
          size="large"
          elevation="8"
        />
      </template>

      <!-- 子按钮菜单 -->
      <VCard class="mobile-sub-menu" elevation="8" rounded="lg">
        <VList color="primary" density="comfortable">
          <template v-for="(menuGroup, groupIndex) in filteredMenuGroups" :key="menuGroup.id">
            <VListSubheader v-if="menuGroup.name" color="primary">
              {{ menuGroup.name }}
            </VListSubheader>
            <template v-for="item in menuGroup.items" :key="item.id">
              <VListItem
                v-if="!item.renderOn || item.renderOn(ctx)"
                class="menu-item"
                :title="item.title"
                :prepend-icon="item.icon"
                @click="handleItemClick(item)"
              >
                <template #prepend>
                  <CommonIcon :icon="item.icon" class="mr-2" />
                </template>
              </VListItem>
            </template>
            <VDivider v-if="groupIndex < filteredMenuGroups.length - 1" class="my-1" />
          </template>
            
          <!-- 如果没有可显示的菜单项 -->
          <VListItem
            v-if="hasNoVisibleItems"
            title="暂无可用操作"
            disabled
          />
        </VList>
      </VCard>
    </VMenu>
  </div>
</template>

<script setup lang="ts">
import type { MenuGroup, MenuItem } from 'sfc-common/core'
import type { FileListContext } from 'sfc-common/model'
import type { PropType } from 'vue'
import { ref, computed } from 'vue'
import CommonIcon from '../CommonIcon.vue'

const props = defineProps({
  /** 子按钮项 */
  menuItems: {
    type: Array as PropType<MenuGroup<FileListContext>[]>,
    default: () => []
  },
  
  /** 文件浏览器列表的上下文对象 */
  ctx: {
    type: Object as PropType<FileListContext>,
    required: true
  },
  
  /** 是否为只读模式 */
  readOnly: {
    type: Boolean,
    default: true
  }
})

const menuOpen = ref(false)

// 过滤出需要显示的菜单组
const filteredMenuGroups = computed(() => {
  return props.menuItems.filter(group => {
    // 如果菜单组有renderOn函数，根据返回值决定是否显示
    if (group.renderOn) {
      return group.renderOn(props.ctx)
    }
    return true
  })
})

// 检查是否有可见的菜单项
const hasNoVisibleItems = computed(() => {
  return filteredMenuGroups.value.every(group => 
    group.items.every(item => item.renderOn && !item.renderOn(props.ctx))
  )
})

// 关闭菜单
function closeMenu() {
  menuOpen.value = false
}

// 处理子按钮点击
function handleItemClick(item: MenuItem<FileListContext>) {
  if (item.action) {
    item.action(props.ctx)
  }
  // 点击后关闭菜单
  menuOpen.value = false
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MobileFloatingAddButton'
})
</script>

<style scoped lang="scss">
.mobile-floating-add-button {
  position: relative;

  .menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 999;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-item {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.1);
    }
  }
}

.mobile-sub-menu {
  max-height: 70vh;
  overflow-y: auto;
  min-width: 200px;
  max-width: 280px;
  z-index: 1001;
}
</style>