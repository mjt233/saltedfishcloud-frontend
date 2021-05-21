<template>
  <div class="container" :class="{'fill': fill}">
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
    'loading': {
      type:Boolean,
      defaule: false
    },
    'fill': {
      type: Boolean,
      defaule: false
    }
  },
  mounted() {
    this.setHeight()
    mdui.mutation(this.$refs.spinner)
    if (this.fill) {
      window.addEventListener('resize', this.setHeight)
    }
  },
  destroyed() {
    if (this.fill) {
      window.removeEventListener('resize', this.setHeight)
    }
  },
  methods: {
    setHeight() {
      let set = () => {
        let top = DOMUtils.getAbsoluteOffsetTop(this.$el, document.body)
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
    min-height: calc(100% - 20px);
    list-style: none;
    padding: 0;
    margin: 0;
    padding:  10px;
    width: 800px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.95);
    margin: 0 auto;
    &.fill {
      padding: 10px 20px;
      width: calc(100% - 40px);
      height: 100%;
      overflow: auto;
    }
}
@media screen and (max-width: 1200px){
    .container {
      width: calc(100% - 20px);
      &.fill {
        width: calc(100% - 20px);
        padding: 10px;
      }
    }
}
</style>