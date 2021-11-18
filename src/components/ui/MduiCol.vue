<template>
    <div class="mdui-col" :class="classObj">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'mduiCol',
    props: ['lg', 'sm', 'md', 'xs', 'valign'],
    computed: {
        classObj() {
            const obj = {}
            if (this.lg) obj['mdui-col-lg-' + this.lg] = true
            if (this.sm) obj['mdui-col-sm-' + this.sm] = true
            if (this.xs) obj['mdui-col-xs-' + this.xs] = true
            if (this.md) obj['mdui-col-md-' + this.md] = true
            if (this.valign === '' || this.valign) obj['mdui-col-valign'] = true
            return obj
        }
    }
}
</script>

<style>
.mdui-col-valign {
    display: flex;
    align-items: center;
    flex-direction: column;
}
</style>
