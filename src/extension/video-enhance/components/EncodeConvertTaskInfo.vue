<template>
  <div style="padding: 16px">
    <div class="d-flex align-center">
      <div><FileIcon width="36" file-name="aaa.mp4" /></div>
      <div style="padding: 0 8px; flex: 1;">
        <div class="break-text">
          <div>{{ params?.source?.name }}</div>
          <div class="tip" style="line-height: 16px">
            <div v-if="task.asyncTaskRecord.executeDate">
              执行日期: {{ toDate(task.asyncTaskRecord.executeDate) }}
            </div>
            <div v-if="task.asyncTaskRecord.finishDate">
              完成日期: {{ toDate(task.asyncTaskRecord.finishDate) }}
            </div>
            <div v-if="task.asyncTaskRecord.failedDate">
              失败日期: {{ toDate(task.asyncTaskRecord.failedDate) }}
            </div>
            <div v-if="!task.asyncTaskRecord.executeDate">
              {{ task.asyncTaskRecord.status == 4 ? '已取消' : '等待中' }}
            </div>
          </div>
        </div>
        <div v-if="task.progress" class="break-text">
          <VProgressLinear color="primary" :model-value="task.progress.loaded" :max="task.progress.total" />
        </div>
      </div>
      <div class="min-width: 64px">
        <div class="text-center link" @click="getLog">
          <div><CommonIcon color="primary" icon="mdi-eye" /></div>
          <div><a style="font-size: 9px">查看日志</a></div>
        </div>
        <div
          v-if="showCancel"
          class="text-center link"
          style="margin-left: 12px;"
          @click="cancel"
        >
          <div><CommonIcon color="primary" icon="mdi-close" /></div>
          <div><a style="font-size: 9px">取消</a></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  task: {
    type: Object as PropType<EncodeConvertTask>,
    default() { return {} }
  },
  /**
   * 是否可以获取日志
   */
  haveLog: {
    type: Boolean,
    default: false
  },
  /**
   * 显示取消任务按钮
   */
  showCancel: {
    type: Boolean,
    default: false
  }
})
const params = computed(() => {
  return JSON.parse(props.task.params || '{}') as EncodeConvertTaskParam
})

const toDate = window.StringFormatter.toDate

const getLog = async() => {
  const dialog = window.SfcUtils.loadingDialog()
  try {
    const ret = (await window.SfcUtils.request(VEAPI.getLog(props.task.asyncTaskRecord.id))).data.data
    if (!ret) {
      window.SfcUtils.alert('没能查询到日志')
    } else {
      window.SfcUtils.openComponentDialog(window.components.CodeEditor, {
        props: {
          modelValue: ret.taskLog,
          readOnly: true,
          useMiniMap: true,
          style: {
            height: '100%'
          }
        },
        fullscreen: true
      })
    }
  } catch (err) {
    window.SfcUtils.alert(err as any, '错误')
  } finally {
    dialog.close()
  }
}

const cancel = async() => {
  const dialog = window.SfcUtils.loadingDialog({msg: '请求中...'})
  try {
    await window.SfcUtils.sleep(150)
    await window.SfcUtils.request(window.API.asyncTask.interrupt(props.task.asyncTaskRecord.id))
    dialog.close()
  } catch (err) {
    dialog.close()
    await window.SfcUtils.sleep(250)
    window.SfcUtils.alert('请求失败: ' + err)
  }

}
</script>

<script lang="ts">
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, computed } from 'vue'
import { VEAPI } from '../api'
import { EncodeConvertTask, EncodeConvertTaskParam } from '../model'

export default defineComponent({
  name: 'EncodeConvertTaskInfo'
})
</script>