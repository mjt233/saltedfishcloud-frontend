<template>
    <div class="mdui-textfield" :class="{'mdui-textfield-floating-label': floatLabel, 'mdui-textfield-invalid': error, 'mdui-textfield-has-bottom': hasBottom}">
        <label class="mdui-textfield-label" v-if="floatLabel">{{placeholder}}</label>
        <input class="mdui-textfield-input"
            @change="$emit('change', $event.target.value)"
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
    }
}
</script>

<style scoped>
input {
    cursor: text !important;
}
</style>
