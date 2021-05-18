<template>
  <div id="app" ref="app">
      <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {
    document.querySelector('#first-load').classList.add('hid')
  }
}
</script>

<style>
.route-switch-enter-active {
  transition: all 0.1s ease-in;
}
.route-switch-leave-active {
  transition: all 0.1s ease-out;
}
.route-switch-enter,
.route-switch-leave-to {
  transform: rotateY(10deg);
  opacity: .9;
}

body {
  background: url("~@/assets/img/bg/bg1.jpg") no-repeat fixed center;
  background-size: cover;
  margin: 0;
  padding: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: auto;
}
a {
  text-decoration: none;
}

*::-webkit-scrollbar {
  width: 5px;
}
*::-webkit-scrollbar-track {
  background: #f6f6f6;
  border-radius: 2px;
}
*::-webkit-scrollbar-thumb {
  background: #aaa;
  border-radius: 2px;
}
*::-webkit-scrollbar-thumb:hover {
  background: #747474;
  /* width: px;*/
}
*::-webkit-scrollbar-corner {
  background: #f6f6f6;
}
</style>
