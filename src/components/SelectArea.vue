<template>
  <div 
    class="select-area" 
    :style="{width:width + 'px', height: height + 'px', top: y + 'px', left: x + 'px'}"
    :class="{active: active}"
  >

  </div>
</template>

<script>
import DOMUtils from '../utils/DOMUtils'
/**
 * @description 通用鼠标选区组件 将该组件置于需要被选择的元素同级元素下即可，父元素定位不能是static或默认
 * @emits selectStart   选择开始
 * @emits selectEnd     选择结束
 * @emits selectChange  选择的项目发生改变 参数：当前选中项
 * @author xiaotao233
 * @version 1.0
 */
export default {
    name: 'select-area',
    props: {
        /**
         * 最大可被选择的节点深度，默认为1（即仅选择同级节点）
         */
        'maxDepth': {
            type: Number,
            default: 1
        }
    },
    data () {
        return {
            /**
             * 容纳选区的父元素容器，该容器是选区的直接作用对象
             * @type {HTMLElement}
             */
            parentEl: undefined,
            /**
             * 相对父元素的初始X位置
             */
            downX: 0,
            /**
             * 相对父元素的初始Y位置
             */
            downY: 0,
            /**
             * 控制选区是否显示
             */
            active: false,
            /**
             * 最近一次鼠标事件[this.mousePositionType+'X']
             */
            eventX: 0,
            /**
             * 最近一次鼠标事件[this.mousePositionType+'Y']
             */
            eventY: 0,
            eventEl: null,
            /**
             * 最近一次事件触发时父容器的offsetLeft
             */
            offsetLeft: 0,
            /**
             * 最近一次事件触发时父容器的offsetTop
             */
            offsetTop: 0,
            /**
             * 最近一次事件触发时父容器的scrollTop
             */
            scrollTop: 0,
            /**
             * 选区被激活时父容器初始的scrollTop
             */
            downScrollTop: 0,
            /**
             * 是否通过偏移移动选区的X位置
             */
            moveX: false,
            /**
             * 是否通过偏移移动选区的Y位置
             */
            moveY: false,
            reverseY: false,
            /**
             * 已被选择的元素
             * @type {HTMLElement[]}
             */
            selecteds: [],
            mousePositionType: 'page'
        }
    }, mounted () {
        this.parentEl = this.$el.parentElement
        this.parentEl.addEventListener('mousedown', e=> {
            // 记录初始x,y坐标
            this.eventEl = e.target
            this.downX = this.eventX = this.getX(e[this.mousePositionType+'X'])
            this.downY = this.eventY = this.getY(e[this.mousePositionType+'Y'])
            this.downScrollTop = this.parentEl.scrollTop
            /**
             * 鼠标移动时的触发的函数
             * @type {Function}
             * @param {MouseEvent} ev
             */
            let moveCallback = ev => {
                // 记录最近一次鼠标事件响应的原生x,y坐标和更新滚动高度
                this.eventX = ev[this.mousePositionType+'X']
                this.eventY = ev[this.mousePositionType+'Y']
                this.offsetLeft = this.parentEl.offsetLeft
                this.offsetTop = this.parentEl.offsetTop
                this.scrollTop = this.parentEl.scrollTop

                // 根据当前x,y坐标与初始x,y坐标进行大小对比决定 采用初始位置还是初始位置减去高宽的位置
                let x = this.getX(ev[this.mousePositionType+'X'])
                let y = this.getY(ev[this.mousePositionType+'Y'])
                this.moveX = x < this.downX
                this.moveY = y < this.downY

                if (this.width > 5 && this.height > 5) {
                    if (!this.active) {
                        this.$emit('selectStart')
                    }
                    // 显示选区遮罩
                    this.active = true
                    this.selecteds = this.getSelectedElem()
                }
                
                // 关闭文字选中
                this.parentEl.style.userSelect = 'none'
            }
            /**
             * 父容器滚动事件触发的函数
             * @type {Function}
             * @param {Event} ev
             * @todo [不紧急|不重要] 若滚动时鼠标所处坐标与当前是否偏移移动XY的控制相反时 选区方向错误
             */
            let scrollCallback = ev => {
                this.offsetLeft = this.parentEl.offsetLeft
                this.offsetTop = this.parentEl.offsetTop
                this.scrollTop = this.parentEl.scrollTop
            }
            /**
             * 父容器鼠标左键被抬起时触发的函数
             * @type {Function}
             * @param {MouseEvent} ev
             */
            let mouseupCallback = ev => {
                this.parentEl.style.userSelect = ''
                this.parentEl.removeEventListener('mousemove', moveCallback)
                this.parentEl.removeEventListener('scroll', scrollCallback)
                this.parentEl.removeEventListener('mouseup', mouseupCallback)
                if (this.active) {
                    this.$emit('selectEnd', this.selecteds)
                    this.active = false
                }
            }
            this.parentEl.addEventListener('mousemove', moveCallback)
            this.parentEl.addEventListener('scroll', scrollCallback)
            this.parentEl.addEventListener('mouseup', mouseupCallback)
        })
    },
    computed: {
        /**
         * 选区宽度
         */
        width() {
            if (this.eventX === this.downX) {
                return 0
            }
            let res = Math.abs(this.eventX - this.absoluteLeft - this.downX)
            return res
        },
        /**
         * 选区高度
         */
        height() {
            if (this.eventY === this.downY) {
                return 0
            }
            return Math.abs(this.scrollTop + this.eventY - this.absoluteTop - this.downY)
        },
        /**
         * 选区相对父元素的X坐标
         */
        x() {
            return this.moveX ? this.downX - this.width : this.downX
        },
        /**
         * 选区相对父元素的Y坐标
         */
        y() {
            return this.moveY ? this.downY - this.height : this.downY
        },
        /**
         * 选区的区域属性参数（起始xy与结束xy）
         * @typedef {Object} area
         * @property {Number} startX
         */
        area() {
            return {
                startX: this.downX,
                startY: this.downY,
                endX: this.getX(this.eventX),
                endY: this.getY(this.eventY)
            }
        },
        absoluteTop() {
            let el = this.parentEl
            let res = 0
            let log = []
            if (el === undefined) return 0
            while (el !== document.body) {
                if (window.getComputedStyle(el).position !== 'static') {
                    res += el.offsetTop
                }
                el = el.parentElement
            }
            return res
        },
        absoluteLeft() {
            let el = this.parentEl
            let res = 0
            if (el === undefined) return 0
            while (el !== document.body) {
                if (window.getComputedStyle(el).position !== 'static') {
                    res += el.offsetLeft
                }
                el = el.parentElement
            }
            return res
        }
    },
    methods: {
        /**
         * 通过事件[this.mousePositionType+'Y']计算出相对父元素的Y
         * @param {Number} rawY 事件原始Y
         * @return {Number}
         */
        getY (rawY) {
            return this.parentEl.scrollTop + rawY - this.absoluteTop
        },
        /**
         * 通过事件[this.mousePositionType+'X']计算出相对父元素的X
         * @param {Number} rawX 事件原始X
         * @return {Number}
         */
        getX (rawX) {
            return rawX - this.absoluteLeft
        },
        getSelectedElem() {
            /**
             * @type {HTMLElement[]}
             */
            let elems = this.parentEl.querySelectorAll("*[selectable]")
            let r = []
            elems.forEach(el => {
                /**
                 * 元素的y坐标
                 */
                let ely = DOMUtils.getAbsoluteOffsetTop(el, this.parentEl)
                /**
                 * 元素的x坐标
                 */
                let elx = DOMUtils.getAbsoluteOffsetLeft(el, this.parentEl)
                if (
                    (this.downY <= ely && this.area.endY >= ely) ||
                    (this.downY >= (ely + el.offsetHeight) && this.area.endY <= (ely + el.offsetHeight)) ||
                    (this.downY >= ely && this.downY <= (ely + el.offsetHeight))
                ) {
                    r.push(el)
                }
                
            })
            return r
        }
    },
    watch: {
        selecteds(o,n) {
            if (o.length != n.length) {
                this.$emit('selectChange', this.selecteds)
            }
        }
    }
}
</script>

<style>

</style>

<style lang="less" scoped>
.select-area {
    position: absolute;
    width: 64px;
    height: 64px;
    background-color: rgba(70, 137, 238, 0.507);
    opacity: 0;
    transition: opacity .2s;
    z-index: 10;
    pointer-events: none;
    &.active {
        opacity: 1;
    }
}
</style>