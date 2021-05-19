const sys = {
    store: {
        prefix: 'admin/sys',
        getStoreState() {
            return {
                url: `${this.prefix}/store/state`
            }
        }
    }
}

module.exports = sys