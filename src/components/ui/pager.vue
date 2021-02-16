<template>
    <div style="position: relative;display:inline-block">
        <div class="mask" v-if="disabled"></div>
        <ul class="page-list mdui-typo"  v-if="pageCount < 8">
            <li @click="jump(1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_before</i></span>
            </li>
            <li v-for="num in pageCount" :key="num">
                <a @click="jump(num)" v-if="num != cur">{{num}}</a>
                <span @click="jump(num)" v-else>{{num}}</span>
            </li>
            <li @click="jump(cur + 1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_next</i></span>
            </li>
        </ul>
        <ul class="page-list mdui-typo"  v-else>
            <li @click="jump(1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_before</i></span>
            </li>
            <!-- 首页常驻 -->
            <li>
                <a @click="jump(1)" v-if="1 != cur">1</a>
                <span @click="jump(1)" v-else>1</span>
            </li>
            <!-- 首页后4个 -->
            <template v-if="cur <= 4">
                <li v-for="num in 5" :key="num">
                    <a @click="jump(num + 1)" v-if="(num + 1) != cur">{{num + 1}}</a>
                    <span @click="jump(num + 1)" v-else>{{num + 1}}</span>
                </li>
                <li class="next" @click="jump(cur + 5)"></li>
            </template>

            <!-- 中间5个 -->
            <template v-else-if="cur <= (pageCount - 4)">
                <li class="prev" @click="jump(cur - 5)"></li>
                <li v-for="num in 5" :key="num">
                    <a @click="jump(cur + num - 3)" v-if="(cur + num - 3) != cur">{{cur + num - 3}}</a>
                    <span @click="jump(cur + num - 3)" v-else>{{cur + num - 3}}</span>
                </li>
                <li class="next" @click="jump(cur + 5)"></li>
            </template>
            
            <!-- 尾页前4个 -->
            <template v-else>
                <li class="prev" @click="jump(cur - 5)"></li>
                <li v-for="num in 4" :key="num">
                    <a @click="jump(pageCount + num - 5)" v-if="(pageCount + num - 5) != cur">{{pageCount + num - 5}}</a>
                    <span @click="jump(pageCount + num - 5)" v-else>{{pageCount + num - 5}}</span>
                </li>
            </template>

            <!-- 尾页常驻 -->
            <li>
                <a @click="jump(pageCount)" v-if="pageCount != cur">{{pageCount}}</a>
                <span @click="jump(pageCount)" v-else>{{pageCount}}</span>
            </li>
            <li @click="jump(cur + 1)" class="arrow mdui-text-color-theme">
                <span><i class="mdui-icon material-icons">navigate_next</i></span>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
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
            cur: 1
        }
    },
    methods: {
        jump(num) {
            if (this.disabled || num <= 0 || num > this.pageCount) {
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
    a,span,.prev,.next{
        display: inline-block;
        min-width: 15px;
        padding: 3px;
        text-align: center;
        user-select: none;
    }
    .prev,.next {
        &::after {
            color: rgb(152, 212, 240);
            content: '..';
        }
    }
    .prev:hover::after {
        letter-spacing: -2px;
        font-size: 14px;
        content: '<<';
    }
    .next:hover::after {
        letter-spacing: -2px;
        font-size: 14px;
        content: '>>';
    }
}
</style>

<style>

</style>