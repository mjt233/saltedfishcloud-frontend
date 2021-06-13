module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:vue/essential',
        'standard'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: [
        'vue'
    ],
    rules: {
        indent: [2, 4],
        eqeqeq: 'off',
        'space-before-function-paren': [2, 'never'],
        'promise/param-names': 'off',
        'no-multiple-empty-lines': [2, { max: 5, maxBOF: 5 }]
    }
}
