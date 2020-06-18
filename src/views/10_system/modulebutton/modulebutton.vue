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
        <el-input v-model.trim="dataJson.searchForm.module_code" clearable placeholder="模块编号" />
      </el-form-item>
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.module_name" clearable placeholder="模块名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="perfect-icon-reset" @click="doResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-button-group v-show="!meDialogSetting.dialogStatus">
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-camera-solid" :loading="settings.listLoading" @click="handleCopyInsert">复制新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-circle-close" :loading="settings.listLoading" @click="handleRealyDelete">物理删除</el-button>
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
      style="width: 100%"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="!meDialogSetting.dialogStatus" type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" label="No" />
      <el-table-column show-overflow-tooltip min-width="100" prop="module_code" label="模块编号" />
      <el-table-column show-overflow-tooltip min-width="80" prop="module_name" label="模块名称" />
      <el-table-column show-overflow-tooltip min-width="80" prop="code" label="按钮编号" />
      <el-table-column show-overflow-tooltip min-width="80" prop="name" label="按钮名称" />
      <el-table-column show-overflow-tooltip min-width="80" prop="sort" label="排序">
        <template v-slot="scope">
          <span>{{ scope.row.sort }}</span>
          <div class="floatRight">
            <el-button class="el-icon-top" type="text" style="font-size: 16px" :disabled="scope.row.sort===scope.row.min_sort" @click="handleSortUp(scope, scope.$index)" />
            <el-button class="el-icon-bottom" type="text" style="font-size: 16px" :disabled="scope.row.sort===scope.row.max_sort" @click="handleSortDown(scope, scope.$index)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip min-width="80" prop="perms" label="权限标识" />
      <el-table-column sortable="custom" min-width="180" :sort-orders="settings.sortOrders" show-overflow-tooltip prop="u_time" label="更新时间">
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
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
        <el-alert
          title="基本信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item label="模块编号：" prop="module_code">
              <el-input v-model.trim="dataJson.tempJson.module_code" disabled>
                <el-button slot="append" ref="selectTwo" icon="el-icon-search" @click="handleModuleDialogClick">
                  选择
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称：" prop="module_name">
              <el-input ref="refUpdateFocus" v-model.trim="dataJson.tempJson.module_name" clearable show-word-limit disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="按钮：" prop="name">
              <select-dict-group v-model="dataJson.tempJson.name" :para="CONSTANTS.DICT_BTN_NAME_TYPE" @change="handleChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识：" prop="perms">
              <el-input v-model.trim="dataJson.tempJson.perms" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.perms" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-show="popSettingsData.dialogStatus === 'update'">
          <el-col :span="12">
            <el-form-item label="更新人：" prop="u_name">
              <el-input v-model.trim="dataJson.tempJson.u_id" disabled />
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
          <el-button type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset" @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " @click="doInsert()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确定</el-button>
      </div>
    </el-dialog>

    <module-dialog
      :visible="popSettingsData.searchDialogDataTwo.dialogVisible"
      @closeMeOk="handleModuleCloseOk"
      @closeMeCancel="handleModuletCloseCancel"
    />

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
import { getListApi, updateApi, insertApi, deleteApi, saveListApi, realDeleteSelectionApi } from '@/api/10_system/modulebutton/modulebutton'
import resizeMixin from './modulebuttonResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import moduleDialog from '@/views/10_system/module/dialog/dialog'
import SelectDictGroup from '@/components/00_dict/select/SelectDictGroup'
import deepCopy from 'deep-copy'

export default {
  name: constants_program.P_BUTTON, // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, moduleDialog, SelectDictGroup },
  directives: { elDragDialog },
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
          code: '',
          is_del: '0' // 未删除
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          descr: '',
          module_code: '',
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: {
          module_code: ''
        },
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            simple_name: 20
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 按钮状态
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false,
          showDelete: false
        },
        // loading 状态
        listLoading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
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
          module_code: [{ required: true, message: '请选择模块编号', trigger: 'change' }],
          code: [{ required: true, message: '请输入按钮', trigger: 'change' }],
          perms: [{ required: true, message: '请输入集团名称', trigger: 'change' }]
        },
        // 弹出的查询框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrResetName: '选择',
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: process.env.VUE_APP_BASE_API + '/api/v1/template.html?id=P00000030',
        // 错误数据文件
        errorFileUrl: ''
      },
      meDialogSetting: {
        program: this.$store.getters.program,
        selectedDataJson: this.$store.getters.selectedDataJson,
        dialogStatus: false
      }
    }
  },
  computed: {
    // 是否为更新模式
    isUpdateModel() {
      if (this.popSettingsData.dialogStatus === 'insert' || this.popSettingsData.dialogStatus === 'copyInsert') {
        return false
      } else {
        return true
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
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
        }
      }
    },
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
          this.settings.btnShowStatus.showDelete = true
        } else {
          this.settings.btnShowStatus.showExport = false
          this.settings.btnShowStatus.showDelete = false
        }
      }
    },
    'popSettingsData.searchDialogDataTwo.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal === {}) {
          this.dataJson.tempJson.module_code = ''
          this.dataJson.tempJson.module_name = ''
          this.dataJson.tempJson.parent_id = ''
        } else {
          this.dataJson.tempJson.module_code = this.popSettingsData.searchDialogDataTwo.selectedDataJson.code
          this.dataJson.tempJson.module_name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.name
          this.dataJson.tempJson.parent_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
        }
      }
    }
  },
  created() {
    this.initShow()
    if (this.$route.query.module_code !== undefined) {
      this.dataJson.searchForm.module_code = this.$route.query.module_code
    } else {
      this.dataJson.searchForm.module_code = ''
    }
  },
  mounted() {
    // 描绘完成
  },
  methods: {
    initTempJsonOriginal() {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal =
      {
        id: undefined,
        name: '',
        code: '',
        descr: '',
        module_code: '',
        dbversion: 0
      }
    },
    initShow() {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    },
    // 弹出框设置初始化
    initDialogStatus() {
      if (this.$store.getters.program !== undefined &&
          this.$store.getters.program !== null &&
          this.$store.getters.program.status === 'open') {
        this.meDialogSetting.dialogStatus = true
      } else {
        this.meDialogSetting.dialogStatus = false
      }
    },
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
    // 行双点击，仅在dialog中有效
    handleRowDbClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
      if (this.meDialogSetting.dialogStatus) {
        this.$emit('rowDbClick', this.dataJson.tempJson)
      }
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
    // 删除操作
    handleDel(row) {
      let _message = ''
      const _value = row.is_del
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
        deleteApi(selectionJson).then((_data) => {
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
          row.is_del = !row.is_del
        })
      }).catch(action => {
        row.is_del = !row.is_del
      }).finally(() => {
        this.popSettingsData.dialogFormVisible = false
        this.settings.listLoading = false
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
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
        // this.$refs['refInsertFocus'].focus()
      })
      this.$nextTick(() => {
        // 初始化模块选择
        this.initModuleSelectButton()
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
      this.$nextTick(() => {
        // 初始化模块选择
        this.initModuleSelectButton()
      })
    },
    // 点击按钮 复制新增
    handleCopyInsert() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.template_id = undefined
      this.dataJson.tempJson.u_id = ''
      this.dataJson.tempJson.u_time = ''
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
      // 复制新增时focus
      this.$nextTick(() => {
        // this.$refs['refInsertFocus'].focus()
      })
      this.$nextTick(() => {
        // 初始化模块选择
        this.initModuleSelectButton()
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj

      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
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
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        const recorders = response.data.records
        const newRecorders = recorders.map(v => {
          return { ...v, columnTypeShowIcon: false, columnNameShowIcon: false }
        })
        this.dataJson.listData = newRecorders
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
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
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '更新处理失败',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            // this.popSettingsData.dialogFormVisible = false
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
    // 重置查询区域
    doResetSearch() {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
    },
    // 重置按钮
    doReset() {
      this.popSettingsData.btnResetStatus = true
      switch (this.popSettingsData.dialogStatus) {
        case 'update':
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['refUpdateFocus'].focus()
          })
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['refInsertFocus'].focus()
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
            this.popSettingsData.dialogFormVisible = false
          }, (_error) => {
            this.$notify({
              title: '新增处理失败',
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
      this.popSettingsImport.dialogFormVisible = false
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
    renderHeaderIsDel: function(h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
            删除状态提示：<br/>
            绿色：未删除  <br/>
            红色：已删除
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },
    // --------------弹出查询框：模块页面--------------
    // 选择按钮的初始化
    initModuleSelectButton() {
      this.$nextTick(() => {
        this.$refs.selectTwo.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
      })
    },
    handleModuleDialogClick() {
      // 选择按钮
      this.popSettingsData.searchDialogDataTwo.dialogVisible = true
    },
    // 关闭对话框：确定
    handleModuleCloseOk(val) {
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    // 关闭对话框：取消
    handleModuletCloseCancel() {
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    handleChange(val, label) {
      this.dataJson.tempJson.name = label.name
      this.dataJson.tempJson.code = val
    },
    // 排序上
    handleSortUp(scope, index) {
      // loading
      this.settings.listLoading = true
      // 1：位置互换，数组对象中
      const index1 = index
      const index2 = index - 1
      this.dataJson.listData.splice(index2, 1, ...this.dataJson.listData.splice(index1, 1, this.dataJson.listData[index2]))
      // 2：计算sort
      this.doReIndexSort(scope.row.parent_id)
      // 3：提交更新
      this.doSortUpdate(this.getSortedDataList(scope.row.parent_id))
    },
    // 排序下
    handleSortDown(scope, index) {
      // loading
      this.settings.listLoading = true
      // 1：位置互换，数组对象中
      const index1 = index
      const index2 = index + 1
      this.dataJson.listData.splice(index2, 1, ...this.dataJson.listData.splice(index1, 1, this.dataJson.listData[index2]))
      // 2：计算sort
      this.doReIndexSort(scope.row.parent_id)
      // 3：提交更新
      this.doSortUpdate(this.getSortedDataList(scope.row.parent_id), scope.row.parent_id)
    },
    // sort重新计算
    doReIndexSort(parent_id) {
      this.dataJson.listData.forEach(function(item, index, arr) {
        if (item.parent_id === parent_id) {
          // 开始排序
          item.sort = index
        }
      })
    },
    // sort重新计算
    getSortedDataList(parent_id) {
      const rtnList = []
      this.dataJson.listData.forEach(function(item, index, arr) {
        if (item.parent_id === parent_id) {
          rtnList.push(item)
        }
      })
      return rtnList
    },
    // 更新逻辑
    doSortUpdate(listData, parent_id) {
      saveListApi(listData).then((_data) => {
        this.$notify({
          title: '更新处理成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        // 返回替换json
        this.doUpdateSortJson(_data.data, parent_id)
        // loading
        this.settings.listLoading = false
      }, (_error) => {
        this.$notify({
          title: '更新处理失败',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // 更新完毕后，把最新的数据更新回去
    doUpdateSortJson(updatedData, parent_id) {
      let startIndex = 0
      this.dataJson.listData.forEach(function(item, index, arr) {
        if (item.parent_id === parent_id) {
          // 位置互换，数组对象中
          const index1 = index
          const index2 = startIndex
          arr.splice(index1, 1, ...updatedData.splice(index1, 1, updatedData[index2]))
          startIndex++
        }
      })
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
    }
  }
}
</script>
