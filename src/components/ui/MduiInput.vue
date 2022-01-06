<template>
    <div class="mdui-textfield" :class="{'mini': mini, 'mdui-textfield-floating-label': floatLabel && !validateError && value.length <= 0, 'mdui-textfield-invalid': isError, 'mdui-textfield-has-bottom': hasBottom}">
        <label class="mdui-textfield-label" v-if="floatLabel || fixedLabel">{{placeholder}}</label>
        <input v-if="!textarea" class="mdui-textfield-input"
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
        <textarea v-else class="mdui-textfield-input"
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
        <div class="mdui-textfield-error">{{errorMsg}}</div>
    </div>
</template>

<script>
import mdui from 'mdui'
export default {
    name: 'mduiInput',
    model: {
        prop: 'value',
        event: 'change'
    },
    props: {
        /**
         * 校验器，当数据不符合校验器规则时显示错误信息
         * 校验器为一个函数，参数1接收当前的内容，返回true验证通过，false验证不通过
         */
        validator: {
            type: Function
        },
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
    computed: {
        isError() {
            return this.error || this.validateError
        }
    },
    data() {
        return {
            validateError: false,
            inputCnt: 0,
            forceFixedLabel: false
        }
    },
    methods: {
        input(e) {
            if (this.validator && this.inputCnt > 0) {
                const err = this.validator(e.target.value) == false
                if (err != this.validateError) {
                    this.validateError = err
                }
            }
            this.$emit('change', e.target.value)
            this.inputCnt++
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
