<template>
    <div :class="classObj" class="form-field">
        <div class="mdui-row center">
            <div :class="nameClassObj">{{name}}</div>
            <div :class="propsClassObj">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'collectionFormField',
    props: {
        name: {
            type: String,
            default: ''
        },
        full: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        classObj() {
            if (!this.full) {
                return 'mdui-col-sm-6 mdui-col-xs-12'
            } else {
                return 'mdui-col-xs-12'
            }
        },
        nameClassObj() {
            if (this.full) {
                return 'mdui-col-sm-2'
            } else {
                return 'mdui-col-sm-3'
            }
        },
        propsClassObj() {
            if (this.full) {
                return 'mdui-col-sm-10 center'
            } else {
                return 'mdui-col-sm-9 center'
            }
        }
    }
}
</script>

<style scoped>
.center {
    display: flex;
    align-items: center;
}
.form-field {
    margin: 8px 0;
}
</style>
