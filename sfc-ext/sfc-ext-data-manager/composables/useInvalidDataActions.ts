import type { Ref } from 'vue'
import { getContext } from 'sfc-common'
import { DataManagerAPI } from '../api'
import type { InvalidDataRecord, ClaimParam } from '../model'
import InvalidDataClaimForm from '../components/form/InvalidDataClaimForm.vue'

const SfcUtils = window.SfcUtils

/**
 * 失效数据操作管理 composable 参数
 */
export interface UseInvalidDataActionsOptions {
  /** 加载状态引用 */
  loading: Ref<boolean>
  /** 操作完成后刷新列表的回调 */
  loadList: () => Promise<void>
  /** 当前选中的记录ID列表 */
  selected: Ref<number[]>
}

/**
 * 失效数据操作管理 composable
 *
 * 负责所有业务操作：检测、识别、发布/取消发布、认领、修复、丢弃等。
 * @param options 必需的外部状态引用与回调
 * @returns 各操作处理方法
 */
export function useInvalidDataActions(options: UseInvalidDataActionsOptions) {
  const { loading, loadList, selected } = options
  const context = getContext()

  /**
   * 判断某条记录是否可丢弃
   * @param item 失效数据记录
   * @returns 是否可丢弃
   */
  const canDiscard = (item: InvalidDataRecord) => {
    if (item.status === 'PUBLISHED' || item.status === 'COMPLETED') return false
    if (item.status === 'CLAIMED') return false
    return true
  }

  /**
   * 发起数据检测任务
   */
  const handleDetect = async() => {
    try {
      const taskId = (await SfcUtils.request(DataManagerAPI.detect())).data.data
      SfcUtils.snackbar('检测任务已发起')
      // 打开异步任务信息对话框，展示检测进度
      const SimpleAsyncTaskInfo = window.Components.SimpleAsyncTaskInfo
      SfcUtils.openComponentDialog(SimpleAsyncTaskInfo, {
        title: '数据检测任务',
        props: {
          taskId,
          logCollapsed: false
        },
        showConfirm: false,
        extraDialogOptions: {
          maxWidth: '810px'
        }
      })
      loadList()
    } catch (err: any) {
      SfcUtils.alert(err.toString())
    }
  }

  /**
   * 发起文件类型识别任务
   */
  const handleIdentify = async() => {
    try {
      const taskId = (await SfcUtils.request(DataManagerAPI.identify())).data.data
      SfcUtils.snackbar('识别任务已发起')
      // 打开异步任务信息对话框，展示识别进度
      const SimpleAsyncTaskInfo = window.Components.SimpleAsyncTaskInfo
      SfcUtils.openComponentDialog(SimpleAsyncTaskInfo, {
        title: '文件类型识别任务',
        props: {
          taskId,
          logCollapsed: false
        },
        showConfirm: false,
        extraDialogOptions: {
          maxWidth: '810px'
        }
      })
      loadList()
    } catch (err: any) {
      SfcUtils.alert(err.toString())
    }
  }

  /**
   * 发布失效数据为可认领状态
   * @param item 失效数据记录
   */
  const handlePublish = async(item: InvalidDataRecord) => {
    try {
      await SfcUtils.request(DataManagerAPI.publish(item.id))
      SfcUtils.snackbar('发布成功')
      loadList()
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 取消发布
   * @param item 失效数据记录
   */
  const handleUnpublish = async(item: InvalidDataRecord) => {
    try {
      await SfcUtils.request(DataManagerAPI.unpublish(item.id))
      SfcUtils.snackbar('取消发布成功')
      loadList()
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 标记失效数据为处理完成
   * @param item 失效数据记录
   */
  const handleMarkCompleted = async(item: InvalidDataRecord) => {
    try {
      await SfcUtils.request(DataManagerAPI.markCompleted(item.id))
      SfcUtils.snackbar('已确认处理完成')
      loadList()
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 批量快速修复指定ID的失效数据
   * @param ids 要修复的记录ID列表
   */
  const handleQuickFix = async(ids: number[]) => {
    try {
      const res = (await SfcUtils.request(DataManagerAPI.quickFix(ids))).data.data
      SfcUtils.snackbar(`修复成功：${res.success || 0}，失败：${res.failed || 0}`)
      loadList()
      selected.value = []
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 一键修复所有可修复的失效数据
   */
  const handleQuickFixAll = async() => {
    try {
      const res = (await SfcUtils.request(DataManagerAPI.quickFixAll())).data.data
      SfcUtils.snackbar(`已完成一键修复。成功：${res.success || 0}，失败：${res.failed || 0}`)
      loadList()
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 批量丢弃指定ID的失效数据（含二次确认）
   * @param ids 要丢弃的记录ID列表
   */
  const handleDiscard = async(ids: number[]) => {
    try {
      try {
        await SfcUtils.confirm('确定要丢弃选中的数据吗？此操作不可逆！', '操作确认', { cancelToReject: true })
      } catch {
        return
      }
      const res = (await SfcUtils.request(DataManagerAPI.discard(ids))).data.data
      SfcUtils.snackbar(`丢弃完成。成功：${res.success || 0}，失败：${res.failed || 0}`)
      loadList()
      selected.value = []
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 一键清理所有可丢弃的失效数据（含二次确认）
   */
  const handleDiscardAll = async() => {
    try {
      try {
        await SfcUtils.confirm('确定要一键清理所有可丢弃数据吗？此操作不可逆！', '操作确认', { cancelToReject: true })
      } catch {
        return
      }
      const res = (await SfcUtils.request(DataManagerAPI.discardAll())).data.data
      SfcUtils.snackbar(`一键清理完成。成功：${res.success || 0}，失败：${res.failed || 0}`)
      loadList()
    } catch (e: any) {
      SfcUtils.alert(e.toString())
    }
  }

  /**
   * 打开认领对话框，提交认领请求
   * @param item 失效数据记录
   */
  const openClaimDialog = (item: InvalidDataRecord) => {
    const currentUid = context.session.value.user.id as number

    // 根据物理路径提取一个默认文件名
    const parts = item.storagePath?.split('/') || []
    const defaultName = parts[parts.length - 1] || '未命名文件'

    const initObject: ClaimParam = {
      invalidDataId: item.id,
      targetUid: currentUid,
      fileName: defaultName,
      savePath: '/'
    }

    const inst = SfcUtils.openComponentDialog(InvalidDataClaimForm, {
      title: '认领数据',
      props: {
        uid: currentUid,
        initObject,
        showTargetUidSelector: true,
        targetUidOptions: [
          { title: '我的私人网盘', value: currentUid },
          { title: '公共网盘', value: 0 }
        ]
      },
      extraDialogOptions: {
        confirmText: '提交认领'
      },
      async onConfirm() {
        const ret = await inst.getInstAsForm().submit()
        if (ret.success) {
          SfcUtils.snackbar('认领成功！')
          await loadList()
        }
        return ret.success
      }
    })
  }

  return {
    canDiscard,
    handleDetect,
    handleIdentify,
    handlePublish,
    handleUnpublish,
    handleMarkCompleted,
    handleQuickFix,
    handleQuickFixAll,
    handleDiscard,
    handleDiscardAll,
    openClaimDialog
  }
}
