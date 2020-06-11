export default {
  beforeCreate() {
    // 设置页面的name 页面id，和router中的name需要一致，作为缓存
    this.$options.name = this.$route.name
  },
  beforeMount() {
    window.addEventListener('resize', this.resizeHandler)
  },
  async mounted() {
    this.setUIheight()
    // 初始化表格中列的宽度
    await this.setColumnsSize(this.settings.table_min_width, this.$options.name)
  },
  created() {
  },
  updated() {
    this.setUIheight()
  },
  methods: {
    resizeHandler() {
      this.setUIheight()
    },
    setUIheight() {
      try {
        // 定义高度
        const elementHeight = document.documentElement.clientHeight - 85
        // 获取所有的ref，主要判断minus的refs
        const listRefsNames = Object.keys(this.$refs).map((key) => {
          return this.$refs[key]
        })
        let val = 0
        for (let i = 0; i < Object.keys(this.$refs).length; i++) {
          if (Object.keys(this.$refs)[i].indexOf('minus') >= 0) {
            val = val + listRefsNames[i].$el.offsetHeight
          }
        }
        let rtnVal = elementHeight - val - 20

        // 判断是否是弹出框
        if (this.meDialogStatus) {
          rtnVal = rtnVal - 150
        }
        // 此处使用的是页面上的值
        this.settings.tableHeight = rtnVal
        return rtnVal
      } catch (error) {
        console.log('mixin error')
      }
    },
    // 表格宽度发生变化时
    handleHeaderDragend(newWidth, oldWidth, column, event) {
      // 保存列的宽度
      this.saveColumnsSize(this.$options.name, column)
    }
  }
}
