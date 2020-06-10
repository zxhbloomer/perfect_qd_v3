<template>
  <div class="app-container">
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
      class="floatRight"
    >
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="参数名称" />
      </el-form-item>
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.config_key" clearable placeholder="参数键名" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="perfect-icon-reset" @click="doResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-camera-solid" :loading="settings.listLoading" @click="handleCopyInsert">复制新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-circle-close" :loading="settings.listLoading" @click="handleRealyDelete">物理删除</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-s-management" :loading="settings.listLoading" @click="handleExport">导出</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-info" :loading="settings.listLoading" @click="handleView">查看</el-button>
    </el-button-group>

    <el-table
      ref="multipleTable"
      v-loading="settings.listLoading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @cell-mouse-enter="handleCellMouseEnter"
      @cell-mouse-leave="handleCellMouseLeave"
    >
      <el-table-column type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" label="No" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" show-overflow-tooltip min-width="130" prop="name" label="参数名称" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" show-overflow-tooltip min-width="130" prop="config_key" label="参数键名" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" show-overflow-tooltip min-width="120" prop="value" label="参数键值" />
      <el-table-column min-width="50" :sort-orders="settings.sortOrders" label="启用状态" :render-header="renderHeaderIsEnabled">
        <template v-slot="scope">
          <el-tooltip :content="scope.row.is_enable === 'false' ? '启用状态：未启用' : '启用状态：已启用' " placement="top" :open-delay="500">
            <el-switch
              v-model="scope.row.is_enable"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              @change="handleEnable(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" :sort-orders="settings.sortOrders" min-width="120" prop="descr" label="描述" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="50" :sort-orders="settings.sortOrders" prop="u_name" label="更新人" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="180" :sort-orders="settings.sortOrders" prop="u_time" label="更新时间">
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <!-- pop窗口 数据编辑:新增、修改 -->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="false"
      width="700px"
    >
      <el-form
        ref="dataSubmitForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="参数名称：" prop="name">
              <el-input ref="refInsertFocus" v-model.trim="dataJson.tempJson.name" controls-position="right" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" :disabled="popSettingsData.dialogStatus==='update' || isViewModel" :placeholder="isPlaceholderShow('请输入')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数键名：" prop="config_key">
              <el-input ref="refUpdateFocus" v-model.trim="dataJson.tempJson.config_key" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.config_key" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="参数键值：" prop="value">
            <el-input v-model.trim="dataJson.tempJson.value" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.value" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
          </el-form-item>
        </el-row>
        <el-form-item label="描述：" prop="descr">
          <el-input v-model.trim="dataJson.tempJson.descr" clearable show-word-limit type="textarea" :maxlength="dataJson.inputSettings.maxLength.descr" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
        </el-form-item>
        <el-row v-show="popSettingsData.dialogStatus === 'update' || isViewModel">
          <el-col :span="12">
            <el-form-item label="更新人：" prop="u_name">
              <el-input v-model.trim="dataJson.tempJson.u_name" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：" prop="u_time">
              <el-input v-model.trim="dataJson.tempJson.u_time" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <div class="floatLeft">
          <el-button v-show="!isViewModel" type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset" :loading="settings.listLoading" @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" v-no-more-click plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " :loading="settings.listLoading" @click="doInsert()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate" v-no-more-click plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " :loading="settings.listLoading" @click="doUpdate()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" v-no-more-click plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " :loading="settings.listLoading" @click="doCopyInsert()">确定</el-button>
      </div>
    </el-dialog>
    <iframe id="refIframe" ref="refIframe" scrolling="no" frameborder="0" style="display:none" name="refIframe">x</iframe>
  </div>
</template>

<style scoped>
  .floatRight {
    float: right;
  }
  .floatLeft {
    float: left;
  }
  .el-form-item .el-select {
    width: 100%;
  }
</style>
<style >
  .el-input-group__append_select{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
  .el-input-group__append_reset{
    color: #FFFFFF;
    background-color: #F56C6C;
    border-color: #F56C6C;
  }
</style>

<script>
import constants_program from '@/common/constants/constants_program'
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, realDeleteSelectionApi, enabledApi } from '@/api/10_system/config/config'
import resizeMixin from './configResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import noMoreClick from '@/directive/noMoreClick'
import deepCopy from 'deep-copy'

export default {
  name: constants_program.P_CONFIG, // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination },
  directives: { elDragDialog, noMoreClick },
  mixins: [resizeMixin],
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          config_key: ''
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          config_key: '',
          value: '',
          descr: ''
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            config_key: 20,
            value: 50,
            descr: 200
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false
        },
        // loading 状态
        listLoading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          view: '查看',
          update: '修改',
          insert: '新增',
          copyInsert: '复制新增'
        },
        // 按钮状态
        btnShowStatus: {
          showInsert: false,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledReset: false,
          disabledInsert: false,
          disabledUpdate: false,
          disabledCopyInsert: false
        },
        // 重置按钮点击后
        btnResetStatus: false,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: '',
        dialogFormVisible: false,
        // pop的check内容
        rules: {
          name: [{ required: true, message: '请输入参数名称', trigger: 'change' }],
          config_key: [{ required: true, message: '请输入参数键名', trigger: 'change' }],
          value: [{ required: true, message: '请输入参数键值', trigger: 'change' }]
        }
      }
    }
  },
  computed: {
    // 是否为查看模式
    isViewModel() {
      if ((this.popSettingsData.dialogStatus === 'view') && (this.popSettingsData.dialogFormVisible === true)) {
        // 查看模式
        return true
      } else {
        // 非查看模式
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.btnResetStatus === true) {
          // 点击了重置按钮
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
          this.popSettingsData.btnResetStatus = false
        } else if (this.popSettingsData.dialogFormVisible) {
          // 有修改按钮高亮
          this.popSettingsData.btnDisabledStatus.disabledReset = false
          this.popSettingsData.btnDisabledStatus.disabledInsert = false
          this.popSettingsData.btnDisabledStatus.disabledUpdate = false
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      deep: true,
      immediate: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.initPopUpStatus()
          // 修改的情况下
          if (this.popSettingsData.dialogStatus === 'update') {
            // this.initSelectData()
          }
        }
      }
    },
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showExport = false
        }
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
    // 数据初始化
    this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
  },
  mounted() {
    // 描绘完成

  },
  methods: {
    // 下拉选项控件事件
    handleSelectChange(val) {
    },
    // 获取行索引
    getRowIndex(row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    handleSearch() {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
    handleRowUpdate(row, _rowIndex) {
      // 修改
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = _rowIndex
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refInsertFocus'].focus()
      })
    },
    // 点击按钮 更新
    handleUpdate() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refUpdateFocus'].focus()
      })
    },
    // 查看
    handleView() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.popSettingsData.dialogStatus = 'view'
      this.popSettingsData.dialogFormVisible = true
    },
    // 导出按钮
    handleExport() {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnShowStatus.showExport = false
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        // 选择全部的时候
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全数据导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          // 右上角X
          if (action !== 'close') {
            // 当前页所选择的数据导出
            this.handleExportSelectionData()
          }
        })
      } else {
        // 部分数据导出
        this.handleExportSelectionData()
      }
    },
    // 全部数据导出
    handleExportAllData() {
      // loading
      this.settings.listLoading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // 部分数据导出
    handleExportSelectionData() {
      // loading
      this.settings.listLoading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function(value, index, array) {
        selectionJson.push({ 'id': value.id })
      })
      // 开始导出
      exportSelectionApi(selectionJson).then(response => {
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // 点击按钮 复制新增
    handleCopyInsert() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.template_id = undefined
      this.dataJson.tempJson.u_id = ''
      this.dataJson.tempJson.u_time = ''
      this.dataJson.tempJson.sort = ''

      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 修改时控件focus
      this.$nextTick(() => {
        this.$refs['refInsertFocus'].focus()
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
      }
    },
    handleSortChange(column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    getDataList() {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.listLoading = true
      getListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
      }, (_error) => {
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // 更新逻辑
    doUpdate() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          updateApi(tempData).then((_data) => {
            this.dataJson.tempJson = Object.assign({}, _data.data)
            // 设置到table中绑定的json数据源
            this.dataJson.listData.splice(this.dataJson.rowIndex, 1, this.dataJson.tempJson)
            // 设置到currentjson中
            this.dataJson.currentJson = Object.assign({}, this.dataJson.tempJson)
            this.$notify({
              title: '更新处理成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
          }, (_error) => {
            this.$notify({
              title: '更新处理失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
          }).finally(() => {
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 重置查询区域
    doResetSearch() {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },
    // 重置按钮
    doReset() {
      this.popSettingsData.btnResetStatus = true
      switch (this.popSettingsData.dialogStatus) {
        case 'update':
          // 复制数据
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refUpdateFocus'].focus()
          })
          break
        case 'copyInsert':
          // 复制数据
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          this.dataJson.tempJson.dict_value = ''
          this.dataJson.tempJson.label = ''
          this.dataJson.tempJson.sort = ''

          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refInsertFocus'].focus()
          })
          break
        case 'insert':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = {}
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refInsertFocus'].focus()
          })
          break
      }

      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 插入逻辑
    doInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          insertApi(tempData).then((_data) => {
            this.dataJson.listData.push(_data.data)
            this.$notify({
              title: '新增处理成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
          }, (_error) => {
            this.$notify({
              title: '新增处理失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
          }).finally(() => {
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 复制新增逻辑
    doCopyInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          insertApi(tempData).then((_data) => {
            this.dataJson.listData.push(_data.data)
            this.$notify({
              title: '复制新增处理成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.$nextTick(() => {
              this.settings.listLoading = false
            })
          }, (_error) => {
            this.$notify({
              title: '复制新增处理失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            // this.popSettingsData.dialogFormVisible = false
          }).finally(() => {
            this.settings.listLoading = false
          })
        }
      })
    },
    // 关闭弹出窗口
    handlCloseDialog() {
      this.popSettingsData.dialogFormVisible = false
    },
    // 获取row-key
    getRowKeys(row) {
      return row.id
    },
    // table选择框
    handleSelectionChange(val) {
      this.dataJson.multipleSelection = val
    },
    /** 当单元格 hover 进入时会触发该事件 */
    handleCellMouseEnter(row, column, cell, event) {
      switch (column.columnKey) {
        case 'columnCode':
          // 字典编码列时
          this.settings.tableHover.columnTypeShowIcon = true
          break
        case 'columnName':
          // 字典编码列时
          this.settings.tableHover.columnNameShowIcon = true
          break
      }
    },
    /** 当单元格 hover 退出时会触发该事件 */
    handleCellMouseLeave(row, column, cell, event) {
      switch (column.columnKey) {
        case 'columnCode':
          // 字典编码列时
          this.settings.tableHover.columnTypeShowIcon = false
          break
        case 'columnName':
          // 字典编码列时
          this.settings.tableHover.columnNameShowIcon = false
          break
      }
    },
    // 弹出框设置初始化
    initPopUpStatus() {
      this.popSettingsData.btnDisabledStatus.disabledReset = true
      this.popSettingsData.btnDisabledStatus.disabledInsert = true
      this.popSettingsData.btnDisabledStatus.disabledUpdate = true
      this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
    },
    // 删除按钮
    handleRealyDelete() {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行删除', '未选择数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnShowStatus.showDelete = false
        })
      } else {
        // 选中数据删除
        this.handleRealDeleteSelectionData()
      }
    },
    // 选中数据删除
    handleRealDeleteSelectionData() {
      // loading
      this.settings.listLoading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function(value, index, array) {
        selectionJson.push({ 'id': value.id })
      })
      // 开始删除
      realDeleteSelectionApi(selectionJson).then((_data) => {
        this.$notify({
          title: '删除成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
        // loading
      }, (_error) => {
        this.$notify({
          title: '删除错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // Placeholder设置
    isPlaceholderShow(val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    renderHeaderIsEnabled: function(h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
            删除状态提示：<br/>
            绿色：已启用  <br/>
            红色：未启用
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },
    // 删除操作
    handleEnable(row) {
      let _message = ''
      const _value = row.is_enable
      const selectionJson = []
      selectionJson.push({ 'id': row.id })
      if (_value === true) {
        _message = '是否要删除选择的数据？'
      } else {
        _message = '是否要复原该条数据？'
      }
      // 选择全部的时候
      this.$confirm(_message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // loading
        this.settings.listLoading = true
        enabledApi(selectionJson).then((_data) => {
          this.$notify({
            title: '更新处理成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
        }, (_error) => {
          this.$notify({
            title: '更新处理失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
          row.is_enable = !row.is_enable
        }).finally(() => {
          this.popSettingsData.dialogFormVisible = false
          this.settings.listLoading = false
        })
      }).catch(action => {
        row.is_enable = !row.is_enable
      })
    }
  }
}
</script>
