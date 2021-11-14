<template>
    <div class="fill-center" :style="containerStyle" :class="containerClass">
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        width: {
            type: Number,
            default: 320
        },
        smWidth: {
            type: String
        }
    },
    data() {
        return {
            sm: false
        }
    },
    computed: {
        containerStyle() {
            return {
                '--width': this.width + 'px',
                '--sm-width': this.smWidth ? this.smWidth : (this.width + 'px')
            }
        },
        containerClass() {
            return {
                sm: this.sm
            }
        }
    },
    mounted() {
        this.updateWidth()
        window.addEventListener('resize', this.updateWidth)
    },
    destroyed() {
        window.removeEventListener('resize', this.updateWidth)
    },
    methods: {
        updateWidth() {
            if (document.documentElement.clientWidth < 640) {
                this.sm = true
            } else {
                this.sm = false
            }
        }
    }
}
</script>

<style scoped>
.fill-center {
    display: grid;
    /* grid-template-columns: repeat(auto-fill, var(--width)); */
    grid-template-columns: repeat(auto-fill, var(--width));
    justify-content: space-evenly;
    gap: 10px;
}
.sm {
    grid-template-columns: repeat(auto-fill, var(--sm-width));
}
</style>
