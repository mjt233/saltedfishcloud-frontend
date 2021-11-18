<template>
    <div class="mdui-textfield" :class="{'mini': mini, 'mdui-textfield-floating-label': floatLabel, 'mdui-textfield-invalid': error, 'mdui-textfield-has-bottom': hasBottom}">
        <label class="mdui-textfield-label" v-if="floatLabel || fixedLabel">{{placeholder}}</label>
        <input v-show="!textarea" class="mdui-textfield-input"
            :autocomplete="autocomplete ? 'on' : type == 'password' ? 'new-password' : 'off'"
            @input="input"
            @change="input"
            v-bind:value='value'
            :type="type"
            :placeholder="floatLabel || fixedLabel ? '' : placeholder"
            :disabled='disabled'
            @keypress.enter="$emit('enter', $event)"
            :maxlength="maxLength"
            ref="input"
        />
        <textarea v-show="textarea" class="mdui-textfield-input"
            :autocomplete="autocomplete ? 'on' : type == 'password' ? 'new-password' : 'off'"
            @input="input"
            v-bind:value='value'
            :type="type"
            :placeholder="floatLabel ? '' : placeholder"
            :disabled='disabled'
            :maxlength="maxLength"
            @keypress.enter="$emit('enter', $event)"
            ref="textarea"
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
        autocomplete: {
            type: Boolean,
            default: true
        },
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
        },
        mini: {
            type: Boolean
        },
        maxLength: {

        }
    },
    methods: {
        input(e) {
            this.$emit('change', e.target.value)
        },
        focus() {
            if (this.textarea) {
                this.$refs.textarea.focus()
            } else {
                this.$refs.input.focus()
            }
        },
        blur() {
            if (this.textarea) {
                this.$refs.textarea.blur()
            } else {
                this.$refs.input.blur()
            }
        }
    }
}
</script>

<style scoped>
input {
    cursor: text !important;
}
.mini {
    display: inline-block;
    padding: 0;
}
</style>
