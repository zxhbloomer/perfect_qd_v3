<template>
  <div class="el-select">
    <el-input
      ref="refSelectGrid"
      v-popover:popover
      :placeholder="placeholder"
      readonly
      style="cursor:pointer"
      @click.native="handleClick"
      @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')"
      @keydown.native.enter.prevent="handleClick"
      @keydown.native.esc.stop.prevent="dataJson.settings.visible = false"
      @keydown.native.tab="dataJson.settings.visible = false"
    >
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]" />
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick" />
      </template>
    </el-input>
    <el-popover
      ref="popover"
      v-model="dataJson.settings.visible"
      :title="title"
      width="900"
      trigger="manual"
      content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。"
    >
      <div>
        <el-table
          :data="dataJson.tableData"
          style="width: 100%"
        >
          <el-table-column
            prop="date"
            label="日期"
            width="180"
          />
          <el-table-column
            prop="name"
            label="姓名"
            width="180"
          />
          <el-table-column
            prop="address"
            label="地址"
          />
        </el-table>
      </div>
    </el-popover>
  </div>
</template>

<style>
  .pointer_cursor {
    cursor:pointer
  }
</style>

<script>

export default {
  name: 'SelectGrid', // 页面id，和router中的name需要一致，作为缓存
  components: { },
  mixins: [],
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataJson: {
        // 页面设置json
        settings: {
          isUpIcon: true,
          visible: false
        }
      }
    }
  },
  computed: {
    showClose() {
      const hasValue = false
      return hasValue
    },
    iconClass() {
      return (this.dataJson.settings.visible ? 'arrow-up is-reverse' : 'arrow-up')
    }
  },
  // 监听器
  watch: {
    'dataJson.settings.visible': {
      handler(newVal, oldVal) {
        if (newVal) {
          // 显示popover
          this.dataJson.settings.isUpIcon = true
        } else {
          // 隐藏popover
          this.dataJson.settings.isUpIcon = false
        }
      },
      immediate: true
    }
  },
  created() {
    // 页面初始化
    this.initCreated()
    // 点击其他不在的区域触发事件
    document.addEventListener('click', (e) => {
      if (this.dataJson.settings.visible !== false) {
        if (!this.$el.contains(e.target)) {
          this.dataJson.settings.visible = false
        }
      }
    })
  },
  mounted() {
    // 描绘完成
    const originalClass = this.$refs['refSelectGrid'].$el.children[0].className
    const newClass = originalClass + ' , pointer_cursor '
    this.$refs['refSelectGrid'].$el.children[0].className = newClass
  },
  methods: {
    // 页面初始化
    initCreated() {
    },
    // 单击事件
    handleClick() {
      this.dataJson.settings.visible = !this.dataJson.settings.visible
    },
    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy()
    },
    handleClearClick(event) {
    }
  }
}
</script>
