<template>
  <div>
    <ul v-for="p in total" :key="p">
      <li>{{p+1}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'paginate',
  data() {
    return {
      current: 1
    }
  },
  props: {
    'totalPage': {
      type: [Number, String],
      default: 0
    },
    'size': {
      type: [Number, String],
      default: 0
    },
    'total': {
      type: [Number, String],
      default: 0
    }
  }
}
</script>

<style>

</style>
