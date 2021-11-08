<template>
    <div class="mdui-textfield" :class="{'mdui-textfield-floating-label': floatLabel, 'mdui-textfield-invalid': error, 'mdui-textfield-has-bottom': hasBottom}">
        <label class="mdui-textfield-label" v-if="floatLabel || fixedLabel">{{placeholder}}</label>
        <input v-show="!textarea" class="mdui-textfield-input"
            @input="input"
            @change="input"
            v-bind:value='value'
            :type="type"
            :placeholder="floatLabel || fixedLabel ? '' : placeholder"
            :disabled='disabled'
            @keypress.enter="$emit('enter', $event)"
        />
        <textarea v-show="textarea" class="mdui-textfield-input"
            @input="input"
            v-bind:value='value'
            :type="type"
            :placeholder="floatLabel ? '' : placeholder"
            :disabled='disabled'
            @keypress.enter="$emit('enter', $event)"
        />
        <div class="mdui-textfield-error" v-if="error">{{errorMsg}}</div>
    </div>
</template>

<script>
export default {
    name: 'mduiInput',
    model: {
        prop: 'value',
        event: 'change'
    },
    props: {
        fixedLabel: {
            type: Boolean,
            default: false
        },
        textarea: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'text'
        },
        floatLabel: {
            type: Boolean,
            default: true
        },
        disabled: {
            type: Boolean,
            default: false
        },
        error: {
            type: Boolean,
            default: false
        },
        hasBottom: {
            type: Boolean,
            default: true
        },
        errorMsg: {
            type: String,
            default: 'text'
        }
    },
    methods: {
        input(e) {
            this.$emit('change', e.target.value)
        }
    }
}
</script>

<style scoped>
input {
    cursor: text !important;
}
</style>
