<template>
  <VFadeTransition hide-on-leave :style="{ height: heightValue }" class="mb-3 mt-3">
    <!-- 已选文件时的工具栏 -->
    <VChip v-if="ctx.selectFileList.length > 0" :style="{ height: heightValue }">
      <VTooltip text="取消选择" location="bottom" open-delay="500">
        <template #activator="{ props: p }">
          <VBtn
            size="x-small"
            style="font-size: 12px;"
            variant="text"
            icon="mdi-close"
            v-bind="p"
            @click="clearSelection"
          />
        </template>
      </VTooltip>
      <span class="ml-2 mr-2">已选{{ ctx.selectFileList.length }}个文件</span>
      <span>
        <template v-for="menuGroup in fileItemMenu" :key="menuGroup.id">
          <template v-for="item in menuGroup.items" :key="item.id">
            <VTooltip v-if="item.action && !item.hideOnToolBar" :text="item.title" location="bottom">
              <template #activator="{ props: p }">
                <VBtn
                  variant="text"
                  :icon="item.icon"
                  size="small"
                  v-bind="p"
                  @click="item.action(ctx)"
                >
                  <CommonIcon :icon="item.icon" />
                </VBtn>
              </template>
            </VTooltip>
          </template>

          <VDivider vertical />
        </template>
      </span>
    </VChip>

    <template v-else-if="!readOnly">
      <!-- 未选文件时的工具栏 -->
      <div style="display: inline-block;">
        <VMenu>
          <template #activator="{ props: p }">
            <VBtn text="新建" v-bind="p">
              <template #prepend>
                <VIcon>mdi-plus</VIcon>
              </template>
            </VBtn>
          </template>

          <VList color="primary" density="comfortable">
            <template v-for="(menuGroup, idx) in toNewButtons" :key="menuGroup.id">
              <VDivider v-if="idx > 0" />
              <VListItem
                v-for="item in menuGroup.items"
                :key="item.id"
                :title="item.title"
                @click="btnClick(item)"
              >
                <template #prepend>
                  <CommonIcon :icon="item.icon" class="mr-2" />
                </template>
              </VListItem>
            </template>
          </VList>
        </VMenu>
      </div>
    </template>
  </VFadeTransition>
</template>

<script setup lang="ts">
import type { MenuGroup, MenuItem } from 'sfc-common/core'
import type { FileListContext } from 'sfc-common/model'
import type { PropType } from 'vue'
import CommonIcon from '../CommonIcon.vue'
const emits = defineEmits<{
  (e: 'clearSelection'): void
}>()

const props = defineProps({
  /** 文件浏览器列表列表上下文 */
  ctx: { type: Object as PropType<FileListContext>, required: true },

  /** 文件列表-文件项菜单组，当列表选择了文件时显示 */
  fileItemMenu: { type: Array as PropType<MenuGroup<FileListContext, FileListMenuItem>[]>, default: () => [] },

  /** 新建按钮组，当列表没有选择文件时会出现新建按钮，该按钮组则作为按钮的下拉菜单 */
  toNewButtons: { type: Array as PropType<MenuGroup<FileListContext>[]>, default: () => [] },

  /** 是否只读模式 */
  readOnly: { type: Boolean, default: true },

  /** 工具栏高度 */
  height: { type: [Number, String] as PropType<number | string>, default: '36px' }
})

const heightValue = computed(() => {
  if(typeof props.height == 'number') {
    return props.height + 'px'
  } else {
    return props.height
  }
})

function clearSelection() {
  emits('clearSelection')
}

function btnClick(item: MenuItem<FileListContext>) {
  item.action && item.action(props.ctx)
}

</script>

<script lang="ts">
import { computed, defineComponent, mergeProps } from 'vue'
import { FileListMenuItem } from 'sfc-common/core/actions/FileList/FileListMenu/type'

export default defineComponent({
  name: 'FileExplorerToolBar',
  components: {
    CommonIcon
  }
})
</script>