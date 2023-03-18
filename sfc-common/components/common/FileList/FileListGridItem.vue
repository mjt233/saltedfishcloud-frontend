<template>
  <div class="file-grid-item" :class="{active}">
    <v-checkbox
      v-if="useSelect"
      class="item-checkbox"
      color="primary"
      :model-value="active"
      @click.stop="emits('checkChange', !active)"
    />
    <div class="item-icon">
      <file-icon
        :width="56"
        :corner-icon="cornerIcon"
        :file-name="fileInfo?.name"
        :is-dir="fileInfo?.dir"
        :md5="fileInfo?.md5"
        :custom-thumbnail-url="handler.getCustomThumbnailUrl(path, fileInfo)"
      />
      <div v-show="inRename" class="rename-handle">
        <v-btn
          class="text-primary"
          icon="mdi-check"
          size="x-small"
          @click.stop="confirmRename"
        />
        <v-btn
          class="text-error"
          icon="mdi-close"
          size="x-small"
          @click.stop="cancelRename"
        />
      </div>
    </div>
    <div class="item-name break-text" :class="{view: !inRename}">
      <div v-if="!inRename" class="text">
        {{ fileInfo?.name }}
      </div>
      <textarea
        v-else
        ref="textarea"
        v-model="newName"
        class="rename-textarea"
        @keypress.enter.stop="confirmRename"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FileIcon from '../FileIcon.vue'
const props = defineProps({
  fileInfo: {
    type: Object as PropType<FileInfo>,
    default: () => { return {} }
  },
  active: {
    type: Boolean,
    default: false
  },
  path: {
    type: String,
    default: ''
  },
  cornerIcon: {
    type: String,
    default: undefined
  },
  useSelect: {
    type: Boolean,
    default: true
  }
})
const handler = inject<Ref<FileSystemHandler>>('fileSystemHandler', null as any) as Ref<FileSystemHandler>
const inRename = ref(false)
const newName = ref('')
const textarea = ref() as Ref<HTMLTextAreaElement>
let resolveFun: Function
let rejectFun: Function
let originName = ''
const emits = defineEmits<{
  (event: 'checkChange', value: Boolean):void
}>()

const rename = () => {
  newName.value = props.fileInfo.name
  inRename.value = true
  originName = props.fileInfo.name
  return new Promise((resolve, reject) => {
    resolveFun = resolve
    rejectFun = reject
    nextTick().then(() => {
      textarea.value.focus()
      textarea.value.select()
    })
  })
}
const confirmRename = () => {
  newName.value = newName.value.replaceAll(/\n/g, '')
  if (newName.value != originName) {
    resolveFun(newName.value)
  }
  inRename.value = false
}
const cancelRename = () => {
  rejectFun('cancel')
  inRename.value = false
}
const getFileInfo = () => {
  return props.fileInfo
}
defineExpose({
  rename,
  cancelRename,
  confirmRename,
  getFileInfo
})
</script>

<script lang="ts">
import { defineComponent, defineProps, nextTick, defineEmits, PropType, Ref, ref, inject } from 'vue'
import { FileInfo } from 'sfc-common/model'
import { FileSystemHandler } from 'sfc-common/core/serivce/FileSystemHandler'

export default defineComponent({
  name: 'FileListGridItem'
})
</script>

<style scoped lang="scss">
.file-grid-item {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  flex-direction: column;
  max-height: 145px;
  padding: 16px;
  width: 100%;
  cursor: pointer;
  transition: all .125s;
  .item-icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 50%;
    width: 100%;
    margin: 0 auto;
    &>* {
      height: 48px;
    }
  }

  .item-name {
    width: 100%;
    height: 100%;
    min-height: 48px;
    font-size: 12px;
    text-align: center;
    &.view {
      max-height: 56px;
      line-clamp: 3;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &:hover {
    background-color:  rgba(0, 0, 0, 0.08);
  }
  &.active {
    background-color:  rgba($color: var(--v-theme-primary), $alpha: .125)
  }
  &:hover,&.active {
    .item-name {
      color: var(--v-theme-primary)
    }
    .item-checkbox {
      visibility: visible;
    }
  }
  
  .item-checkbox {
    position: absolute;
    z-index: 1;
    top: -16px;
    left: -4px;
    transform: scale(.8);
    visibility: hidden;
  }
}

.rename-textarea {
  outline: none;
  width: 100%;
  height: 64px;
  padding: 2px;
  overflow: hidden;
  border: 1px solid darkgray;
  background-color: rgb(var(--v-theme-background));
  resize: none;
}

.rename-handle {
  position: absolute;
  width: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &>* {
    width: 32px;
    height: 32px;
  }
}

</style>