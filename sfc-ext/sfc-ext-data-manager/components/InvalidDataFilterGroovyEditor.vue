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
                    v-for="(field, idx) in variable.fields"
                    :key="`${field.label}-${idx}`"
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

    <!-- 代码样例快捷插入 -->
    <div v-if="codeExamples && codeExamples.length > 0" class="d-flex flex-wrap ga-1 mb-2">
      <v-tooltip
        v-for="example in codeExamples"
        :key="example.id"
        location="top"
      >
        <template #activator="{ props: tooltipProps }">
          <v-chip
            title="点击自动插入代码"
            v-bind="tooltipProps"
            size="small"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-code-tags"
            @click="insertExample(example.content)"
          >
            {{ example.label }}
          </v-chip>
        </template>
        <pre class="ma-0 text-caption" style="white-space: pre-wrap; max-height: 300px; overflow-y: auto; max-width: 500px;"><code>{{ example.content }}</code></pre>
      </v-tooltip>
    </div>

    <!-- 代码编辑器 -->
    <CodeEditor
      ref="editorRef"
      v-bind="$attrs"
      language="groovy"
      :custom-completions="provideGroovyCompletions"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { provideGroovyCompletions, variables, DEFAULT_COLUMNS } from '../groovy-completions'
import type { CodeEditorModel } from 'sfc-common/model/component/CodeEditorModel'
import type { CodeExample } from '../codeExample/type'

/** 各变量字段表格的展开状态，key 为变量名，默认全部收起 */
const expandedVars = reactive<Record<string, boolean>>({})

/** 编辑器组件实例引用 */
const editorRef = ref<CodeEditorModel>()

const props = defineProps<{
  /**
   * 可快捷插入的代码样例数组。
   * 提供后会在编辑器上方渲染一排快捷插入按钮，点击后将样例代码插入到编辑器当前光标处。
   */
  codeExamples?: CodeExample[]
}>()

/**
 * 获取 Monaco 编辑器实例
 * @returns Monaco IStandaloneCodeEditor 实例
 */
const getEditor = () => editorRef.value?.getEditor()

/**
 * 将指定的代码内容插入到编辑器当前光标位置
 * @param content 待插入的代码内容
 */
const insertExample = (content: string) => {
  editorRef.value?.insertText(content)
}

defineExpose({ getEditor })
</script>

<script lang="ts">
import { defineComponent } from 'vue'
const CodeEditor = window.Components.CodeEditor

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
