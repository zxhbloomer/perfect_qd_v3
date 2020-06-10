<template>
  <div>
    <el-input
      ref="minusLeftFilterInput"
      v-model="dataJson.filterText"
      class="filterInput"
      placeholder="输入关键字进行过滤"
    >
      <el-button slot="append" ref="buttonSearch" icon="el-icon-search" class="buttonSearch" @click="handleButtonSearch" />
    </el-input>
    <div :style="{height: height + 'px'}" class="mytree">
      <el-tree
        ref="treeObject"
        :data="dataJson.treeData"
        :props="dataJson.defaultProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        :indent="0"
        highlight-current
        node-key="id"
        default-expand-all
        class="tree"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span>
            <el-dropdown
              :show-timeout="100"
              :szie="getSize()"
            >
              <span class="el-dropdown-link el-button--text">
                操作<i class="el-icon-arrow-down el-icon--right" />
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-button
                    :szie="getSize()"
                    type="text"
                    @click="() => append(data)"
                  >
                    新增
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    :szie="getSize()"
                    type="text"
                    @click="() => edit(data)"
                  >
                    编辑
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button
                    :szie="getSize()"
                    type="text"
                    @click="() => remove(data)"
                  >
                    删除
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<style scoped>
.treeStyle {
  overflow: auto;
  border: 1px solid #ebeef5;
}
.filterInput {
  margin-bottom: 10px;
}

.leaf {
    width: 20px;
    background: #ddd
}

.folder {
    width: 20px;
    background: #888
}

.custom-tree-container {
    display: -ms-flexbox;
    display: flex;
    margin: -24px
}

.block {
    -ms-flex: 1;
    flex: 1;
    padding: 8px 24px 24px
}

.block>p {
    text-align: center;
    margin: 0;
    line-height: 4
}

.block:first-child {
    border-right: 1px solid #eff2f6
}

.custom-tree-node {
    -ms-flex: 1;
    flex: 1;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: justify;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px
}

.el-tree-node:focus > .el-tree-node__content {
  background-color: transparent !important;
}
</style>

<style >
  .buttonSearch{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
</style>

<script>
import { getTreeListApi } from '@/api/10_system/tenant/tenant'

export default {
  name: 'P00000081', // 页面id，和router中的name需要一致，作为缓存
  components: {},
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      dataJson: {
        filterText: '',
        treeData: []
      },
      // 页面设置json
      settings: {
        listLoading: true,
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    }
  },
  computed: {
  },
  watch: {
    'dataJson.filterText': {
      handler(newVal, oldVal) {
        this.$refs.treeObject.filter(newVal)
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
  },
  mounted() {
    this.initSearchButton()
  },
  methods: {
    // 选择or重置按钮的初始化
    initSearchButton() {
      this.$nextTick(() => {
        this.$refs.buttonSearch.$el.parentElement.className = ' buttonSearch ' + this.$refs.buttonSearch.$el.parentElement.className
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getDataList() {
      // 查询逻辑
      this.settings.listLoading = true
      getTreeListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.treeData = response.data
        this.getListAfterProcess()
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // 兄弟组件发过来的调用请求
    handleDataChange() {
      // 查询
      this.getDataList()
    },
    handleButtonSearch() {
      // 查询
      this.getDataList()
    },
    // 查询后处理
    getListAfterProcess() {
      if (Object.keys(this.dataJson.filterText).length !== 0) {
        this.$nextTick(() => {
          this.$refs.treeObject.filter(this.dataJson.filterText)
        })
      }
    },
    remove(val) {
      alert(val)
    }
  }
}
</script>
