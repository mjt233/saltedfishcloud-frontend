<template>
  <div class="container">
    <div class="loading-mask" :class="{'hid':!loading}">
      <div style="position:absolute;top:0;" class="mdui-progress" >
          <div class="mdui-progress-indeterminate"></div>
      </div>
      <div ref="spinner" class="mdui-spinner"></div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import mdui from 'mdui'
import DOMUtils from '../../utils/DOMUtils'
export default {
    props: {
        loading: {
            type: Boolean,
            defaule: false
        },
        fill: {
            type: Boolean,
            defaule: false
        }
    },
    watch: {
        fill() {
            if (this.fill) {
                this.addResizeEventListener()
            }
        }
    },
    mounted() {
        mdui.mutation(this.$refs.spinner)
        if (this.fill) {
            this.addResizeEventListener()
        }
    },
    destroyed() {
        if (this.fill) {
            this.removeResizeEventListener()
        }
    },
    methods: {
        addResizeEventListener() {
            this.setHeight()
            window.addEventListener('resize', this.setHeight)
        },
        removeResizeEventListener() {
            window.removeEventListener('resize', this.setHeight)
        },
        setHeight() {
            const set = () => {
                const top = DOMUtils.getAbsoluteOffsetTop(this.$el, document.body)
                this.$el.style.height = document.documentElement.clientHeight - top - 20 + 'px'
            }
            set()
            //  等待其他组件的尺寸变化完毕后再执行一次确保高度正确
            setTimeout(set, 300)
        }
    }
}
</script>

<style scope lang="less">
.loading-mask {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0px;
    left: 0px;
    background-color: rgba(255, 255, 255, 0.5);
    height: 100%;
    width: 100%;
    transition: all .2s;
    z-index: 10;
    &.hid {
        opacity: 0;
        pointer-events: none;
    }
}
.container {
    --padding: 15px;
    min-height: calc(100% - calc( var(--padding) * 2));
    list-style: none;
    padding: var(--padding);
    margin: 0;
    width: calc(100% - calc( var(--padding) * 2));
    position: relative;
    background-color: rgba(255, 255, 255, 0.95);
    margin: 0 auto;
}
</style>
