<template>
  <el-input
    v-model.trim="value"
    disabled
    :placeholder="isPlaceholderShow('请选择')"
  >
    <el-button
      slot="append"
      icon="el-icon-search"
      :disabled="isViewModel"
      @click="handleStaffDialogClickTwo"
    >
      选择
    </el-button>
  </el-input>
</template>

<script>
export default {
  name: 'InputSelect',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    selectVal: {
      get() {
        return [...this.value]
      },
      set(val) {
        this.$emit('input', [...val])
      }
    }
  },
  mounted() {
    this.setSort()
  },
  methods: {

  }
}
</script>
