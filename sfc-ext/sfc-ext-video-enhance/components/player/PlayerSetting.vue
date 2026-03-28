<template>
  <span class="player-setting">
    <span
      v-if="subtitleList.length"
      class="subtitle-switch"
      style="cursor: pointer;"
    >
      <span>
        字幕: {{ curSubtitle ? '开' : '关' }}
      </span>
      <ul class="subtitle-list">
        <li v-for="subtitle in subtitleList" :key="subtitle.url">
          <span
            class="subtitle-item"
            :class="{ 'text-primary text-bold': curSubtitle && curSubtitle.url === subtitle.url }"
            @click="subtitle != curSubtitle && emits('subtitleChange', subtitle)"
          >
            {{ subtitle.title }}
            <template v-if="subtitle.isDefault">
              (默认)
            </template>
          </span>
        </li>
        <li
          class="subtitle-item"
          :class="{ 'text-primary text-blod': !curSubtitle }"
          @click="emits('subtitleChange', null)"
        >
          关闭
        </li>
      </ul>
    </span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  subtitleList: {
    type: Array as PropType<Subtitle[]>,
    default: () => []
  },
  curSubtitle: {
    type: Object as PropType<Subtitle>,
    default: undefined
  }
})
const emits = defineEmits<{
  (e: 'subtitleChange', subtitle: Subtitle | null): void
}>()
</script>

<script lang="ts">
import { Subtitle } from 'sfc-ext/sfc-ext-video-enhance/model'
import { defineComponent, defineProps, defineEmits, Ref, ref, PropType, onMounted } from 'vue'

export default defineComponent({
  name: 'PlayerSetting'
})
</script>

<style scoped lang="scss">
  .player-setting {
    .subtitle-switch {
      position: relative;
      display: inline-block; // 确保包含子项
      &:hover .subtitle-list {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }
    }
    .subtitle-list {
      position: absolute;
      list-style: none;
      padding: 6px;
      bottom: 4px;
      left: -64px;
      width: 210px;
      max-height: 280px;
      overflow-y: auto;
      pointer-events: none; /* 默认不响应事件，显示时开启 */
      opacity: 0;
      transform: translateY(6px); /* 初始有微小位移，避免和触发区产生空隙 */
      transition: opacity 0.18s ease, transform 0.18s ease;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 50;
      .subtitle-item {
        display: inline-block;
        padding: 5px 12px;
        cursor: pointer;
        transition: all .2s;
        &.active {
          color: rgb(var(--color-primary));
        }
        &:hover {
          padding-left: 16px;
          padding-right: 8px;
        }
      }
    }
  }
</style>