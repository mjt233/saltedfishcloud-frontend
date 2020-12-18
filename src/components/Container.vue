<template>
  <div class="container">
    <div class="loading-mask" :class="{'hid':!loading}">
      <div style="position:absolute;top:0;width:calc(100% - 20px)" class="mdui-progress" v-if="loading">
          <div class="mdui-progress-indeterminate"></div>
      </div>
        <!-- <div class="mdui-spinner"></div> -->
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    'loading':{
      type:Boolean,
      defaule: false
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
}
@media screen and (max-width: 1200px){
    .container {
      width: calc(100% - 20px);
    }
}
</style>