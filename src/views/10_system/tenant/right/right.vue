<template>
  <div>
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
      class="floatRight"
    >
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="租户名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="el-icon-zoom-in">高级查询</el-button>
      </el-form-item>
    </el-form>

    <el-popover
      ref="popover"
      placement="top"
      width="520"
      title="高级查询"
    >
      <el-form
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
        class="floatRight"
      >
        <el-form-item v-show="false" label="">
          <el-input v-show="false" v-model.trim="dataJson.searchForm.name" clearable placeholder="名称" />
        </el-form-item>
        <el-form-item label="">
          <el-date-picker
            v-model="dataJson.searchForm.datetimerange"
            type="datetimerange"
            :picker-options="settings.pickerOptions"
            range-separator="至"
            start-placeholder="生效开始日期"
            end-placeholder="生效结束日期"
            align="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-divider />
        <div style="text-align: right; margin: 0">
          <el-button type="text" @click="doResetSearch()">重置</el-button>
          <el-button type="primary" @click="handleSearch">提交</el-button>
        </div>
      </el-form>
    </el-popover>

    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-camera-solid" :loading="settings.listLoading" @click="handleCopyInsert">复制新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-s-management" :loading="settings.listLoading" @click="handleExport">导出</el-button>
      <el-button :disabled="!settings.btnShowStatus.showAdmin" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleAdmin">管理员维护</el-button>
    </el-button-group>

    <el-table
      ref="multipleTable"
      v-loading="settings.listLoading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="height"
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
    >
      <el-table-column type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" label="No" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="120" :sort-orders="settings.sortOrders" prop="parent_name" label="父节点名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="120" :sort-orders="settings.sortOrders" prop="code" label="租户编码" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="200" :sort-orders="settings.sortOrders" prop="name" label="租户名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="simple_name" label="租户简称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="is_enable" label="启用" :render-header="renderHeaderIsEnabled">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.isdel"
            active-color="#ff4949"
            inactive-color="#13ce66"
            :active-value="true"
            :inactive-value="false"
            :width="30"
            @change="handleDel(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="enable_time" label="生效日期" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="disable_time" label="失效日期" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="is_freeze" label="冻结" :render-header="renderHeaderIsFreeze">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.isdel"
            active-color="#ff4949"
            inactive-color="#13ce66"
            :active-value="true"
            :inactive-value="false"
            :width="30"
            @change="handleDel(scope.row)"
          />
        </template>
      </el-table-column>
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
      width="1000px"
      top="5vh"
    >
      <el-form
        ref="dataForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-alert
          title="上级租户信息：非必须选择，若没有选择，代表是根节点"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-form-item label="上级租户名称：" prop="parent_name">
            <el-cascader
              ref="refInsertFocus"
              v-model="dataJson.tempJson.parent_name"
              placeholder="请选择"
              :options="dataJson.cascader.data"
              filterable
              clearable
              :props="{ checkStrictly: true, expandTrigger: 'hover'}"
              @change="handleCascaderChange"
            />
          </el-form-item>
        </el-row>
        <el-alert
          title="本租户信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item label="租户编码：" prop="code">
              <el-input v-model="dataJson.tempJson.code" placeholder="请输入编码不输入则自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统编码：" prop="serial_no">
              <el-input v-model="dataJson.tempJson.serial_no" placeholder="系统自动指定" disabled="" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="租户名称：" prop="name">
              <el-input ref="refUpdateFocus" v-model="dataJson.tempJson.name" placeholder="请输入" />
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item label="租户简称：" prop="simple_name">
              <el-input v-model="dataJson.tempJson.simple_name" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="生效日期区间：" prop="enable_time_range">
              <!-- <el-input v-model="enable_time" placeholder="请选择" /> -->
              <el-date-picker
                v-model="dataJson.tempJson.enable_time_range"
                type="datetimerange"
                :picker-options="settings.pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                align="right"
                style="width: 100%"
                clearable
                @change="dataPickChange"
              />

            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否冻结：" prop="isfreeze">
              <el-switch
                v-model="dataJson.tempJson.isfreeze"
                style="display: block"
                active-color="#ff4949"
                inactive-color="#13ce66"
                active-text="冻结"
                inactive-text="正常"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="级次：" prop="level">
              <el-input v-model="dataJson.tempJson.level" placeholder="系统自动指定" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序：" prop="sort">
              <el-input v-model="dataJson.tempJson.sort" placeholder="系统自动指定" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述：" prop="templateDescr">
          <el-input v-model.trim="dataJson.tempJson.descr" type="textarea" placeholder="请输入" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <div class="floatLeft">
          <el-button type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset " @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " @click="doInsert()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
  .floatRight {
    float: right;
  }
  .floatLeft {
    float: left;
  }
  .el-form-item .el-cascader {
    width: 100%;
  }
  .grid-content {
    border-radius: 2px;
    min-height: 36px;
    margin-bottom: 10px;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .el-alert--info.is-light{
    background: #eee;
  }
</style>
<style >
  .buttonSearch{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
  .buttonReset{
    color: #FFFFFF;
    background-color: #F56C6C;
    border-color: #F56C6C;
  }
</style>
<script>
import { getCascaderListApi, getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/10_system/tenant/tenant'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import deepCopy from 'deep-copy'

export default {
  name: 'P00000082', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination },
  directives: { elDragDialog },
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          datetimerange: ''
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
        // table使用的json，数据源
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          parent_name: '',
          parent_id: '',
          name: '',
          code: '',
          descr: '',
          dbversion: 0,
          template_id: undefined
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            dbversion: 0
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 日期类型下拉选项json
        pickerOptions: {
          shortcuts: [{
            text: '未来一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '未来一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '未来三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '未来六个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 180)
              picker.$emit('pick', [start, end])
            }
          }, {
            text: '未来一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 365)
              picker.$emit('pick', [start, end])
            }
          }
          ]
        },
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态是否启用
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false,
          showAdmin: false
        },
        // loading 状态
        listLoading: true,
        duration: 4000
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          insert: '新增',
          copyInsert: '复制新增'
        },
        // 按钮状态：是否显示
        btnShowStatus: {
          showReset: false,
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
          // code: [{ required: true, message: '请选择租户编码', trigger: 'change' }],
          name: [{ required: true, message: '请输入租户名称', trigger: 'change' }],
          simple_name: [{ required: true, message: '请输入租户简称', trigger: 'change' }],
          enable_time_range: [{ required: true, message: '请输入生效失效日期范围', trigger: 'change' }]
        },
        // 弹出的查询框参数设置
        searchDialogData: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrReset: false,
          selectOrResetName: '选择',
          selectOrResetIcon: 'el-icon-search',
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      }
    }
  },
  // 监听器
  watch: {
    // // 日期范围
    // 'dataJson.tempJson.enable_time_range': {
    //   handler(newVal, oldVal) {
    //     if (newVal === undefined || newVal === null || newVal === []) {
    //       this.dataJson.tempJson.enable_time = ''
    //       this.dataJson.tempJson.disable_time = ''
    //       this.dataJson.tempJson.show_enable_time_range = ''
    //       return
    //     }
    //     const start = parseTime(newVal[0])
    //     const end = parseTime(newVal[1])
    //     this.dataJson.tempJson.enable_time = start
    //     this.dataJson.tempJson.disable_time = end
    //     this.dataJson.tempJson.show_enable_time_range = start + ' 至 ' + end + '时间段内开始启用'
    //   },
    //   deep: true,
    //   immediate: true
    // },
    'dataJson.tempJson.enable_time': {
      handler(newVal, oldVal) {
        if (newVal === undefined || newVal === null || newVal === []) {
          // this.dataJson.tempJson.enable_time = ''
          // this.dataJson.tempJson.disable_time = ''
          // this.dataJson.tempJson.enable_time_range = []
          return
        } else {
          const start = new Date(this.dataJson.tempJson.enable_time)
          const end = new Date(this.dataJson.tempJson.disable_time)
          this.dataJson.tempJson.enable_time_range = [start, end]
        }
      },
      immediate: true,
      deep: true
    },
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
          // 弹出窗口
          // 有修改按钮高亮
          this.popSettingsData.btnDisabledStatus.disabledReset = false
          this.popSettingsData.btnDisabledStatus.disabledInsert = false
          this.popSettingsData.btnDisabledStatus.disabledUpdate = false
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      immediate: true,
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.initPopUpStatus()
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
    this.getCascaderDataList()
    // 数据初始化
    this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
  },
  methods: {
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
    // handleRowUpdate(row, _rowIndex) {
    //   // 修改
    //   this.dataJson.tempJson = Object.assign({}, row) // copy obj
    //   this.dataJson.rowIndex = _rowIndex
    //   this.popSettingsData.dialogStatus = 'update'
    //   this.popSettingsData.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    // 删除操作
    handleDel(row) {
      let _message = ''
      const _value = row.isdel
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
          this.popSettingsData.dialogFormVisible = false
        }, (_error) => {
          this.$notify({
            title: '更新处理失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
          row.is_del = !row.is_del
          // this.popSettingsData.dialogFormVisible = false
        }).finally(() => {
          this.settings.listLoading = false
        })
      }).catch(action => {
        row.isdel = !row.isdel
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
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
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 修改时控件focus
      this.$nextTick(() => {
        this.$refs['refUpdateFocus'].focus()
      })
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
      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 修改时控件focus
      this.$nextTick(() => {
        this.$refs['refInsertFocus'].$el.focus()
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
        this.settings.btnShowStatus.showAdmin = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
        this.settings.btnShowStatus.showAdmin = false
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
    getCascaderDataList() {
      // 级联查询逻辑
      this.settings.listLoading = true
      getCascaderListApi().then(response => {
        this.dataJson.cascader.data = response.data
      }).finally(() => {
        this.settings.listLoading = false
      })
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
      }).finally(() => {
        this.settings.listLoading = false
      })
    },
    // 更新逻辑
    doUpdate() {
      this.$refs['dataForm'].validate((valid) => {
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
          }, (_error) => {
            this.$notify({
              title: '更新处理失败',
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
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 初始化数据
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refUpdateFocus'].focus()
          })
          break
        case 'copyInsert':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          this.dataJson.tempJson.template_id = undefined
          this.dataJson.tempJson.templateType = ''
          this.dataJson.tempJson.templateName = ''
          this.dataJson.tempJson.templateDescr = ''
          this.dataJson.tempJson.templateContext = ''
          // 初始化数据
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refInsertFocus'].$el.focus()
          })
          break
        case 'insert':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = {}
          // 初始化数据
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refInsertFocus'].$el.focus()
          })
          break
      }

      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 插入逻辑
    doInsert() {
      this.$refs['dataForm'].validate((valid) => {
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
    // 复制新增逻辑
    doCopyInsert() {
      this.$refs['dataForm'].validate((valid) => {
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
    // 关闭弹出窗口
    handlCloseDialog() {
      this.popSettingsData.dialogFormVisible = false
    },
    // 获取row-key
    // getRowKeys(row) {
    //   return row.id
    // },
    // table选择框
    handleSelectionChange(val) {
      this.dataJson.multipleSelection = val
    },
    // 弹出框设置初始化
    initPopUpStatus() {
      this.popSettingsData.btnDisabledStatus.disabledReset = true
      this.popSettingsData.btnDisabledStatus.disabledInsert = true
      this.popSettingsData.btnDisabledStatus.disabledUpdate = true
      this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
    },
    handleCascaderChange(value) {
      const parent_id = value[value.length - 1 ]
      this.dataJson.tempJson.parent_id = parent_id
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
            绿色：未启用  <br/>
            红色：已启用
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },
    renderHeaderIsFreeze: function(h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
            删除状态提示：<br/>
            绿色：未启用  <br/>
            红色：已启用
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },
    dataPickChange(data) {
      this.dataJson.tempJson.enable_time_range = data
      if (data === null) {
        this.dataJson.tempJson.enable_time = null
        this.dataJson.tempJson.disable_time = null
      } else {
        this.dataJson.tempJson.enable_time = new Date(data[0])
        this.dataJson.tempJson.disable_time = new Date(data[1])
      }
    },
    // 管理员维护点击事件
    handleAdmin() {
      alert('TODO:xxx')
    }
  }
}
</script>
