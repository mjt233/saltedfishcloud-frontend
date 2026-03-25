<template>
  <div class="file-explorer-path">
    <div class="path-container">
      <!-- 省略号菜单按钮 -->
      <v-menu v-if="hiddenNodes.length > 0" offset-y>
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="text"
            size="small"
            class="path-node ellipsis-btn"
            icon
          >
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>

        <v-list color="primary" density="compact">
          <v-list-item
            v-for="node in hiddenNodes"
            :key="node.path"
            @click="handlePathClick(node.path, node.name)"
          >
            <template #title>
              <v-tooltip open-delay="500" :text="node.name" location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <v-list-item-title v-bind="tooltipProps" class="list-item-text">
                    {{ node.name }}
                  </v-list-item-title>
                </template>
              </v-tooltip>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- 显示的路径节点 -->
      <span v-for="(node, index) in displayedNodes" :key="node.path" class="mt-1 d-inline-flex align-center">
        <!-- 节点之间的分隔符 -->
        <v-icon 
          v-if="index > 0 || hiddenNodes.length > 0"
          class="separator"
        >
          mdi-chevron-right
        </v-icon>
        
        <!-- 路径节点按钮 -->
        <v-tooltip open-delay="500" :text="node.name" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              variant="text"
              class="path-node"
              @click="handlePathClick(node.path, node.name)"
            >
              <span class="node-text">{{ node.name }}</span>
            </v-btn>
          </template>
        </v-tooltip>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PathNode {
  path: string
  name: string
}

const props = defineProps({
  /**
   * 展示的路径
   */
  path: {
    type: String,
    default: '/'
  },
  /**
   * 最多同时横向展示的节点数
   */
  showCount: {
    type: Number,
    default: 3
  },
  /**
   * 根路径节点的名称
   */
  rootName: {
    type: String,
    default: '/'
  }
})

const emits = defineEmits<{
  // 指定的路径节点被点击后触发事件。事件参数：该节点的完整路径、该节点的名称
  (e: 'pathClick', path: string, name: string): void
}>()

/**
 * 解析路径字符串为节点数组
 */
const pathNodes = computed(() => {
  const nodes: PathNode[] = []
  const parts = props.path.split('/').filter(part => part !== '')
  
  let currentPath = ''
  // 添加根节点
  nodes.push({
    path: '/',
    name: props.rootName
  })
  
  // 添加其他节点
  parts.forEach(part => {
    currentPath += '/' + part
    nodes.push({
      path: currentPath,
      name: part
    })
  })
  
  return nodes
})

/**
 * 计算需要隐藏的节点（在省略号菜单中）
 */
const hiddenNodes = computed(() => {
  const totalNodes = pathNodes.value.length
  if (totalNodes <= props.showCount) {
    return []
  }
  const hiddenCount = totalNodes - props.showCount
  return pathNodes.value.slice(0, hiddenCount)
})

/**
 * 计算需要显示的节点
 */
const displayedNodes = computed(() => {
  const totalNodes = pathNodes.value.length
  if (totalNodes <= props.showCount) {
    return pathNodes.value
  }
  const hiddenCount = totalNodes - props.showCount
  return pathNodes.value.slice(hiddenCount)
})

/**
 * 处理路径节点点击
 */
const handlePathClick = (path: string, name: string) => {
  emits('pathClick', path, name)
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FileExplorerPath'
})
</script>

<style scoped lang="scss">
.file-explorer-path {
  display: flex;
  align-items: center;
  padding: 8px 0;
  height: 48px;
  overflow-x: auto;
  overflow-y: hidden;
}

.path-container {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  height: 32px;
}

.path-node {
  white-space: nowrap;
  
  &.ellipsis-btn {
    min-width: 32px;
    padding: 0;
  }
}

.node-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.separator {
  flex-shrink: 0;
}

.list-item-text {
  font-size: 14px;
  max-width: 280px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>