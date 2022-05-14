const sys = {
  /**
     * 获取系统特性
     * @returns {import("axios").AxiosRequestConfig}
     */
  getFeature() {
    return {
      url: '/hello/feature'
    }
  }
}

export default sys