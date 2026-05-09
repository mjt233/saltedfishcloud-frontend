import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { AutoComputeHeightOptions } from '../components/common/FileExplorer/FileExplorerCore'

/**
 * 检测指定容器的高度变化，自动计算目标元素位置 到 页面底部的距离
 * @returns 返回目标元素的高度
 */

export function useAutoComputeHeight({
  autoComputeHeight = false, computeTarget, offset = 0, observeTarget, documentHeight = () => window.innerHeight
}: AutoComputeHeightOptions) {


  const targetHeight = ref(400)
  /**
   * 更新组件的高度（自动计算高度）
   */
  const updateHeight = async() => {
    if (autoComputeHeight) {
      await nextTick()
      const target = typeof computeTarget === 'function' ? computeTarget() : computeTarget
      if (!target) {
        return
      }
      const positionTop = target.getBoundingClientRect().top

      const oTarget = typeof observeTarget === 'function' ? observeTarget() : observeTarget
      const oc = getComputedStyle(oTarget)
      const b = parseInt(oc.marginBottom) + parseInt(oc.paddingBottom)
      // 列表的高度 = 文档高度 - 列表在文档中的top - 其他组件的高度 + 高度补偿参数 - 检测容器margin
      const documentHeightValue = typeof documentHeight === 'function' ? documentHeight() : documentHeight
      targetHeight.value = documentHeightValue - positionTop + offset - b
    }
  }

  const obs = new ResizeObserver(updateHeight)
  onMounted(() => {
    updateHeight()
    obs.observe(typeof observeTarget === 'function' ? observeTarget() : observeTarget)
  })

  onUnmounted(() => {
    obs.disconnect()
  })

  return {
    // 目标高度计算结果
    targetHeight,
    // 手动更新计算高度结果
    updateHeight
  }
}
