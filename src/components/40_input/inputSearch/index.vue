<template>
  <el-input
    v-model.trim="value"
    disabled
    :placeholder="isPlaceholderShow('请选择')"
  >
    <el-button
      slot="append"
      type="primary"
      icon="el-icon-search"
      :disabled="disabled"
      @click="handleClick"
    >
      选择
    </el-button>
  </el-input>
</template>

<style >
  .el-input-group__append_select{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
</style>

<script>
export default {
  name: 'InputSearch',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
  },
  mounted() {
    this.initSearchBtn()
  },
  methods: {
    handleClick() {
      this.$emit('onInputSearch')
    },
    // Placeholder设置
    isPlaceholderShow(val) {
      if (this.disabled) {
        return ''
      } else {
        return val
      }
    },
    // 选择or重置按钮的初始化
    initSearchBtn() {
      this.$nextTick(() => {
        if (this.disabled) {
          this.$children[0].$children[0].$el.parentElement.className = 'el-input-group__append'
        } else {
          this.$children[0].$children[0].$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
        }
      })
    }
  }
}
</script>
