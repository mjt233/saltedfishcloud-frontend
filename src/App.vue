<template>
  <div id="app" ref="app">
      <router-view />
  </div>
</template>

<script>
export default {
    name: 'App',
    mounted() {
        document.querySelector('#first-load').classList.add('hid')
        setTimeout(() => {
            document.querySelector('#first-load').remove()
        }, 1000)
    }
}
</script>

<style>

body {
  background: url("~@/assets/img/bg/bg1.jpg") no-repeat fixed center;
  background-size: cover;
  margin: 0;
  padding: 0;
}
body, html {
  overflow: hidden;
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
