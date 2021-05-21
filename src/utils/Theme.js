const Theme = {
    /**
     * 设置APP主题色
     * @param {'pink' | 'blue' | 'deep-purple' | 'orange' | 'amber'} theme 主题色
     */
    switchTheme(theme) {
        let delList = []
        document.body.classList.forEach(e => {
            if(e.indexOf('mdui-theme-') > -1) {
                delList.push(e)
            }
        })
        delList.forEach(e => document.body.classList.remove(e))
        document.body.classList.add('mdui-theme-primary-' + theme)
        document.body.classList.add('mdui-theme-accent-' + theme)
        localStorage.setItem('theme', theme)
    },
    /**
     * 加载上次设置的主题色
     */
    loadTheme() {
        let theme = localStorage.getItem('theme')
        if (theme) {
            this.switchTheme(theme)
        }
    }
}

module.exports = Theme