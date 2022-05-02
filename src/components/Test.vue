<template>
    <div>
        <h1>我是子组件</h1>
    </div>
</template>
<script lang="ts">
import API from '@/api';
import axios from '@/plugins/axios';

export default {
    name: 'test'
}
</script>



<script setup lang="ts">
const conf = API.user.login('admin', 'admin666')
axios.request(conf).then(e => {
    console.log(e)
}).catch(e => { 
    console.log(e)
})

</script>