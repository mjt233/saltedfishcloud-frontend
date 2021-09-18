<template>
    <container class="mdui-typo">
        <h1>{{greet}}，{{userInfo == null ? '欢迎使用咸鱼云网盘' : userInfo.user}}</h1>
        <div class="mdui-container-fluid" style="text-align: center">
            <div class="mdui-row">
                <div class="mdui-col-md-6 mdui-col-sm-12">
                    <mdui-btn @click="$router.push('/public')" class="mdui-color-theme-400">
                        <mdui-icon :size="22" :icon="'public'"></mdui-icon>
                        <span>公共网盘（资源站）</span>
                    </mdui-btn>
                </div>
                <div class="mdui-col-md-6 mdui-col-sm-12">
                    <mdui-btn @click="$router.push('/private')" class="mdui-color-theme-400">
                        <mdui-icon :size="22" :icon="'lock_outline'"></mdui-icon>
                        <span>私人网盘</span>
                    </mdui-btn>
                </div>
            </div>
        </div>
    </container>
</template>

<script>
import Container from '../../components/layout/Container'
import MduiBtn from '@/components/ui/MduiBtn.vue'
import MduiIcon from '@/components/ui/MduiIcon.vue'
export default {
    name: 'welcome',
    components: {
        Container,
        MduiBtn,
        MduiIcon
    },
    data() {
        const h = new Date().getHours()
        let greet = '早上好'
        if (h <= 5 || h >= 18) {
            greet = '晚上好'
        } else if (h >= 11 && h <= 14) {
            greet = '中午好'
        } else if (h >= 15 && h <= 17) {
            greet = '下午好'
        }
        return {
            greet
        }
    },
    computed: {
        userInfo() {
            return this.$store.getters.userInfo
        }
    }
}
</script>

<style scoped>
.mdui-btn {

    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 280px;
    height: 90px;
    margin-top: 60px;
    font-size: 18px;
}
</style>
