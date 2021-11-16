<template>
    <mdui-card style="min-height: 320px;justify-content: center" class="mdui-valign mdui-center mdui-typo">
        <mdui-row class="mdui-text-color-theme" style="height: 64px">
            <mdui-col :xs="2">
                <p style="font-size: 36px">:(</p></mdui-col>
            <mdui-col :xs="10">
                <p style="font-size: 28px">404 NOT FOUND</p>
            </mdui-col>
        </mdui-row>
        <p>找不到分享的资源，或者你来太晚了，资源分享被取消了啦 ﾍ(;´Д｀ﾍ)</p>
    </mdui-card>
</template>

<script>
import MduiCard from '../ui/MduiCard.vue'
import MduiCol from '../ui/MduiCol.vue'
import MduiRow from '../ui/MduiRow.vue'
export default {
    components: { MduiRow, MduiCard, MduiCol },
    name: 'shareNotFound'
}
</script>

<style>

</style>
