<template>
  <div 
    class="select-area" 
    :style="{width:width + 'px', height: height + 'px', top: y + 'px', left: x + 'px'}"
    :class="{active: active}"
  >

  </div>
</template>

<script>

export default {
    name: 'select-area',
    data () {
        return {
            /**
             * @type {HTMLElement}
             */
            parentEl: undefined,
            downX: 0,
            downY: 0,
            x: 0,
            y: 0,
            active: false,
            eventX: 0,
            eventY: 0
        }
    }, mounted () {
        this.parentEl = this.$el.parentElement
        this.parentEl.addEventListener('mousedown', e=> {
            this.downX = this.getX(e)
            this.downY = this.getY(e)
            this.mouseHasDown = true
            let moveCallback = ev => {
                this.eventX = ev.clientX
                this.eventY = ev.clientY
                let x = this.getX(ev)
                let y = this.getY(ev)
                this.x = x > this.downX ? this.downX : this.downX - this.width
                this.y = y > this.downY ? this.downY : this.downY - this.height
                this.active = true
                this.parentEl.style.userSelect = 'none'
            }
            this.parentEl.addEventListener('mousemove', moveCallback)
            // this.parentEl.addEventListener('scroll', e => {
            //     console.log(e)
            // })
            this.parentEl.addEventListener('mouseup', e=> {
                this.active = false
                this.parentEl.style.userSelect = ''
                this.parentEl.removeEventListener('mousemove', moveCallback)
            })
        })
    },
    computed: {
        width() {
            return Math.abs(this.eventX - (this.parentEl === undefined ? 0 : this.parentEl.offsetLeft) - this.downX)
        },
        height() {
            try {
                return Math.abs(this.parentEl.scrollTop + this.eventY - this.parentEl.offsetTop - this.downY)
            } catch (error) {
                return Math.abs(this.eventY - this.downY)
            }
        }
    },
    methods: {
        /**
         * @param {MouseEvent} e
         * @return {Number}
         */
        getY (e) {
            return this.parentEl.scrollTop + e.clientY - this.parentEl.offsetTop
        },
        /**
         * @param {MouseEvent} e
         * @return {Number}
         */
        getX (e) {
            return e.clientX - this.parentEl.offsetLeft
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
    &.active {
        opacity: 1;
    }
}
</style>