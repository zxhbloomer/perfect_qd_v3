<!--字典表下拉选项框，可多选-->
<template>
  <el-select
    :placeholder="initPlaceholder"
    :loading="dataJson.settings.listLoading"
    loading-text="拼命加载..."
    clearable
    :value="value"
    multiple
    @input="$emit('input', $event)"
    @change="handleChange"
  >
    <el-option
      v-for="item in dataJson.selectOptions"
      :key="item.value"
      :label="item.name"
      :value="item.value"
    />
  </el-select>
</template>

<script>
import { getDictDataApi } from '@/api/00_common/commonComponent'

export default {
  name: 'SelectDictComponent',
  props: {
    // 返回和设定的值
    value: {
      type: Array,
      default: null
    },
    // placeholder
    initPlaceholder: {
      type: String,
      default: ''
    },
    // 查询的参数
    para: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataJson: {
        // 资源类型下拉选项json
        selectOptions: [],
        searchForm: {
          para: ''
        },
        settings: {
          // 页面设置json
          // loading 状态
          listLoading: true
        }

      }
    }
  },
  // 监听器
  watch: {
  },
  created() {
    // 初始化查询
    this.init()
  },
  mounted() {
    // 描绘完成
  },
  methods: {
    // 初始化
    init() {
      this.dataJson.settings.listLoading = true
      this.dataJson.searchForm.para = ''
      this.getRemoteData()
    },
    getRemoteData() {
      this.dataJson.searchForm.para = this.para
      getDictDataApi(this.dataJson.searchForm).then((_data) => {
        this.dataJson.selectOptions = _data.data
        this.dataJson.settings.listLoading = false
      }, (_error) => {
      })
    },
    handleChange(val) {
      this.$emit('change', val)
    }
  }
}
</script>
