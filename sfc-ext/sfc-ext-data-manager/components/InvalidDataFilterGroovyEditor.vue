<template>
  <div class="groovy-editor-wrapper">
    <!-- 变量参考面板 -->
    <v-expansion-panels variant="accordion" class="mb-2">
      <v-expansion-panel>
        <v-expansion-panel-title density="compact" class="text-caption">
          <v-icon size="small" class="mr-1">
            mdi-variable
          </v-icon>
          内置变量参考
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div
            v-for="variable in variables"
            :key="variable.name"
            class="mb-2"
          >
            <div
              class="d-flex align-center ga-1 mb-1 cursor-pointer"
              @click="expandedVars[variable.name] = !expandedVars[variable.name]"
            >
              <v-icon size="x-small" class="mr-1">
                {{ expandedVars[variable.name] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
              </v-icon>
              <code class="text-primary font-weight-bold">{{ variable.name }}</code>
              <span class="text-caption text-medium-emphasis">({{ variable.type }})</span>
            </div>
            <div class="text-caption text-medium-emphasis mb-1" style="padding-left: 20px">
              {{ variable.description }}
            </div>
            <v-expand-transition>
              <v-table v-show="expandedVars[variable.name]" density="compact" size="small">
                <thead>
                  <tr>
                    <th
                      v-for="col in (variable.columns || DEFAULT_COLUMNS)"
                      :key="col.field"
                      class="text-caption font-weight-bold"
                    >
                      {{ col.header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="field in variable.fields"
                    :key="field.label"
                  >
                    <td
                      v-for="col in (variable.columns || DEFAULT_COLUMNS)"
                      :key="col.field"
                    >
                      <code v-if="col.field === 'label'" class="text-primary">{{ field[col.field] }}</code>
                      <span v-else class="text-caption">{{ field[col.field] ?? '-' }}</span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expand-transition>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- 代码编辑器 -->
    <CodeEditor
      ref="editorRef"
      v-bind="$attrs"
      language="groovy"
      :custom-completions="provideGroovyCompletions"
      :placeholder="editorPlaceholder"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { provideGroovyCompletions, variables, DEFAULT_COLUMNS } from '../groovy-completions'
import type { CodeEditorModel } from 'sfc-common/model/component/CodeEditorModel'

/** 各变量字段表格的展开状态，key 为变量名，默认全部收起 */
const expandedVars = reactive<Record<string, boolean>>({})

/** 编辑器组件实例引用 */
const editorRef = ref<CodeEditorModel>()

/**
 * 获取 Monaco 编辑器实例
 * @returns Monaco IStandaloneCodeEditor 实例
 */
const getEditor = () => editorRef.value?.getEditor()

const editorPlaceholder = `脚本中通过 record 访问每条记录，末行表达式为 true 时保留该记录
示例: 
if (typeCheckResult == null || typeCheckResult.detail.extension != '.png') {
    return false;
}
def width = TypeUtils.toLong(typeCheckResult.detail.metadata.width)

if (width == null || width < 1024) {
    return false
}
return true
则表示筛选出所有识别格式为png、且图片宽度大于1024px的失效数据
`

defineExpose({ getEditor })
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { CodeEditor } from 'sfc-common/components/common/Editor'

/**
 * Groovy 筛选脚本编辑器组件。
 *
 * 封装了 CodeEditor，内置 `record` / `typeCheckResult` 变量的代码补全支持，
 * 并在编辑器上方提供可折叠的变量参考面板。
 *
 * 调用方通过 `SfcUtils.openComponentDialog` 打开此组件，并通过
 * `dialogInst.getComponentInstRef().getEditor()` 获取编辑器实例读取最终内容。
 */
export default defineComponent({
  name: 'InvalidDataFilterGroovyEditor',
  components: { CodeEditor }
})
</script>

<style lang="scss" scoped>
.groovy-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
