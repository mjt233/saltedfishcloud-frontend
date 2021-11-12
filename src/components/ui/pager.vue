<template>
    <div style="position: relative;display:inline-block">
        <div class="mask" v-if="disabled"></div>

        <!-- 所有a标签均为点击可触发转跳的元素，span则为当前页码元素 -->


        <ul class="page-list"  v-if="pageCount < 8">
            <li @click="jump(cur - 1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_before</i></span>
            </li>
            <li v-for="num in pageCount" :key="num" :class="{'mdui-color-theme': cur == num, 'mdui-text-color-theme-text': true}">
                <span @click="jump(num)">{{num}}</span>
            </li>
            <li @click="jump(cur + 1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_next</i></span>
            </li>
        </ul>
        <ul class="page-list"  v-else>
            <li @click="jump(cur - 1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_before</i></span>
            </li>
            <!-- 首页常驻 -->
            <li :class="{'mdui-color-theme': cur == 1, 'mdui-text-color-theme-text': true}">
                <span @click="jump(1)" >1</span>
            </li>
            <!-- 首页后4个 -->
            <template v-if="cur <= 4">
                <li v-for="num in 5" :key="num" :class="{'mdui-color-theme': cur == num + 1, 'mdui-text-color-theme-text': true}">
                    <span @click="jump(num + 1)">{{num + 1}}</span>
                </li>
                <li class="next" @click="jump(cur + 5)">
                    <mdui-icon :size="arrowSize" :icon="'fast_forward'" />
                </li>
            </template>

            <!-- 中间5个 -->
            <template v-else-if="cur <= (pageCount - 4)">
                <li class="prev" @click="jump(cur - 5)">
                    <mdui-icon :size="arrowSize" :icon="'fast_rewind'" />
                </li>
                <li v-for="num in 5" :key="num" :class="{'mdui-color-theme': cur == cur + num - 3, 'mdui-text-color-theme-text': true}">
                    <span @click="jump(cur + num - 3)">{{cur + num - 3}}</span>
                </li>
                <li class="next" @click="jump(cur + 5)">
                    <mdui-icon :size="arrowSize" :icon="'fast_forward'" />
                </li>
            </template>

            <!-- 尾页前4个 -->
            <template v-else>
                <li class="prev" @click="jump(cur - 5)">
                    <mdui-icon :size="arrowSize" :icon="'fast_rewind'" />
                </li>
                <li v-for="num in 4" :key="num" :class="{'mdui-color-theme': cur == pageCount + num - 5, 'mdui-text-color-theme-text': true}">
                    <span @click="jump(pageCount + num - 5)">{{pageCount + num - 5}}</span>
                </li>
            </template>

            <!-- 尾页常驻 -->
            <li :class="{'mdui-color-theme': cur == pageCount, 'mdui-text-color-theme-text': true}">
                <span @click="jump(pageCount)">{{pageCount}}</span>
            </li>
            <li @click="jump(cur + 1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_next</i></span>
            </li>
        </ul>
    </div>
</template>
<script>
import MduiIcon from './MduiIcon.vue'
export default {
    components: { MduiIcon },
    name: 'pager',
    props: {
        pageCount: {
            type: [Number, String]
        },
        disabled: {
            type: [Boolean],
            default: false
        }
    },
    data() {
        return {
            cur: 1,
            arrowSize: 16
        }
    },
    methods: {
        jump(num) {
            if (this.cur == num || this.disabled || num <= 0 || num > this.pageCount) {
                return
            }
            this.cur = num
        }
    },
    watch: {
        cur(n, o) {
            this.$emit('change', n)
        }
    }
}
</script>
<style lang="less" scoped>
.arrow {
    font-size: 12px;
    display: flex;
    align-items: center;
}
.mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;
    opacity: .3;
    z-index: 1;
    cursor: not-allowed;
}
.page-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: inline-flex;
    justify-content: center;
    cursor: pointer;
    &>li {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        margin: 3px;
        padding: 10px;
        height: 12px;
        width: 12px;
        margin: 0 4px;
        background-color: white;
        box-shadow: 0 3px 3px darkgray;
        border-radius: 4px;
        transition: all .2s;
    }

    .prev,.next {
        &::after {
            content: '..';
        }
        >* {
            display: none;
        }
        &:hover {
            &>* {
                display: inline;
            }
            &::after {
                display: none;
            }
        }
    }
    // .prev:hover::after {
    //     letter-spacing: -2px;
    //     font-size: 14px;
    //     content: '<<';
    // }
    // .next:hover::after {
    //     letter-spacing: -2px;
    //     font-size: 14px;
    //     content: '>>';
    // }
}
</style>

<style>

</style>
