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
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="名称" />
      </el-form-item>
      <el-form-item label="">
        <select-dict v-model="dataJson.searchForm.visible" :para="CONSTANTS.DICT_SYS_VISIBLE_TYPE" init-placeholder="请选择菜单类型" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="perfect-icon-reset" @click="doResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-button-group v-show="!meDialogSetting.dialogStatus">
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增菜单组</el-button>
      <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleCopyInsert">添加子菜单</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-circle-close" :loading="settings.listLoading" @click="handleRealyDelete">物理删除</el-button>
    </el-button-group>
    <el-table
      ref="multipleTable"
      v-loading="settings.listLoading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%"
      default-expand-all
      row-key="id"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column header-align="center" type="index" width="45" />
      <el-table-column header-align="center" show-overflow-tooltip min-width="150" prop="name" label="菜单名称" />
      <!-- <el-table-column header-align="center" show-overflow-tooltip min-width="150" prop="code" label="菜单编号" /> -->
      <!-- <el-table-column header-align="center" show-overflow-tooltip min-width="80" prop="type_name" label="菜单类型" /> -->
      <el-table-column header-align="center" label="按钮">
        <el-table-column
          v-for="button_column in dataJson.menu_buttons"
          :key="button_column.code"
          align="center"
          :prop="button_column.code"
          :label="button_column.name"
          min-width="25"
        >
          <template v-slot="column_lists">
            <div v-for="item in column_lists.row.module_info" :key="item.id">
              <!-- 存在按钮数据时 -->
              <div v-if="item.code === button_column.code">
                〇
              </div>
            </div>
            <!-- 不存在按钮数据时 -->
            <div v-if="column_lists.row.module_info.length === 0">
              -
            </div>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-if="popSettingsData.dialogFormVisible"
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="false"
      width="900px"
    >
      <el-form
        ref="dataSubmitForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <div v-show="isNewMenuGroup">
          <el-alert title="菜单组信息" type="info" :closable="false" />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单组编号：" prop="code">
                <el-input v-model.trim="dataJson.tempJson.code" clearable show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单组名称：" prop="name">
                <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div v-show="isNewMenu">
          <el-alert title="上级菜单信息" type="info" :closable="false" />
          <br>
          <el-row>
            <el-form-item label="上级菜单：" prop="parent_id">
              <el-cascader
                ref="refInsertFocus"
                v-model="dataJson.tempJson.depth_id"
                placeholder="请选择"
                :options="dataJson.cascader.data"
                filterable
                clearable
                :props="{ checkStrictly: true, expandTrigger: 'hover'}"
                style="width: 100%"
                disabled
              />
            </el-form-item>
          </el-row>

          <el-alert title="本菜单模块信息" type="info" :closable="false" />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单名称：" prop="name">
                <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit>
                  <el-button slot="append" ref="selectOne" icon="el-icon-search" @click="handleModuleDialogClick">
                    选择
                  </el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="请求地址：" prop="path">
                <el-input v-model.trim="dataJson.tempJson.path" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单类型：" prop="type">
                <select-dict v-model="dataJson.tempJson.type" :para="CONSTANTS.DICT_SYS_MODULE_TYPE" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="模块名称：" prop="meta_title">
                <el-input v-model.trim="dataJson.tempJson.meta_title" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块icon：" prop="meta_icon">
                <el-input v-model.trim="dataJson.tempJson.meta_icon" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="路由名：" prop="route_name">
                <el-input v-model.trim="dataJson.tempJson.route_name" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块路径：" prop="meta_icon">
                <el-input v-model.trim="dataJson.tempJson.component" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 修改情况 -->
        <div v-show="isChangeModel">
          <!-- 菜单组修改 -->
          <div v-show="isRootNode">
            <el-alert title="菜单组信息" type="info" :closable="false" />
            <br>
            <el-row>
              <el-col :span="12">
                <el-form-item label="菜单组编号：" prop="code">
                  <el-input v-model.trim="dataJson.tempJson.code" clearable show-word-limit :disabled="isUpdateModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="菜单组名称：" prop="name">
                  <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- 目录修改 -->
          <div v-show="isMENUNode || isCONTENTSNode">
            <el-alert title="上级菜单信息" type="info" :closable="false" />
            <br>
            <el-row>
              <el-form-item label="上级菜单：" prop="parent_id">
                <el-cascader
                  ref="refInsertFocus"
                  v-model="dataJson.tempJson.parent_depth_id"
                  placeholder="请选择"
                  :options="dataJson.cascader.data"
                  filterable
                  clearable
                  :props="{ checkStrictly: true, expandTrigger: 'hover'}"
                  style="width: 100%"
                  @change="handleCascaderChange"
                />
              </el-form-item>
            </el-row>

            <el-alert title="本菜单模块信息" type="info" :closable="false" />
            <br>
            <el-row>
              <el-col :span="12">
                <el-form-item label="菜单名称：" prop="name">
                  <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit>
                    <el-button slot="append" ref="selectTwo" icon="el-icon-search" @click="handleModuleDialogClick">
                      选择
                    </el-button>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="请求地址：" prop="path">
                  <el-input v-model.trim="dataJson.tempJson.path" clearable show-word-limit disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="菜单类型：" prop="type">
                  <select-dict v-model="dataJson.tempJson.type" :para="CONSTANTS.DICT_SYS_MODULE_TYPE" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="模块名称：" prop="meta_title">
                  <el-input v-model.trim="dataJson.tempJson.meta_title" clearable show-word-limit disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模块icon：" prop="meta_icon">
                  <el-input v-model.trim="dataJson.tempJson.meta_icon" clearable show-word-limit disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="路由名：" prop="route_name">
                  <el-input v-model.trim="dataJson.tempJson.route_name" clearable show-word-limit disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模块路径：" prop="meta_icon">
                  <el-input v-model.trim="dataJson.tempJson.component" clearable show-word-limit disabled />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

        </div>

        <el-row v-show="isChangeModel">
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
  .grid-content {
    border-radius: 2px;
    min-height: 36px;
    margin-bottom: 10px;
  }
  .bg-purple-light {
    background: #e5e9f2;
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
import { getCascaderListApi, getListApi, updateApi, addMenuGroupApi, addSubMenuApi, deleteApi, realDeleteSelectionApi } from '@/api/10_system/sysmenu/sysmenu'
import resizeMixin from './sysmenuResizeHandlerMixin'
import elDragDialog from '@/directive/el-drag-dialog'
import SelectDict from '@/components/00_dict/select/SelectDict'
import moduleDialog from '@/views/10_system/module/dialog/dialog'
import deepCopy from 'deep-copy'

export default {
  name: constants_program.P_MENU, // 页面id，和router中的name需要一致，作为缓存
  components: { SelectDict, moduleDialog },
  directives: { elDragDialog },
  mixins: [resizeMixin],
  data() {
    return {
      dataJson: {
        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          name: '',
          code: '',
          visible: 'null',
          is_del: '0' // 未删除
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json
        listData: null,
        // 按钮json
        menu_buttons: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
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
          update: '修改',
          insert: '新增',
          copyInsert: '添加子菜单'
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
        rules: {},
        rulesFirst: {
          code: [{ required: true, message: '请输入菜单组编号', trigger: 'change' }],
          name: [{ required: true, message: '请输入菜单组名称', trigger: 'change' }]
        },
        rulesSecond: {
          parent_id: [{ required: true, message: '请输入上级菜单', trigger: 'change' }],
          name: [{ required: true, message: '请选择菜单名称', trigger: 'change' }]
        },
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的查询框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          dialogVisible: false,
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
    // 是否为新增菜单组
    isNewMenuGroup() {
      if (this.popSettingsData.dialogStatus === 'insert') {
        return true
      } else {
        return false
      }
    },
    // 是否为新增子菜单
    isNewMenu() {
      if (this.popSettingsData.dialogStatus === 'copyInsert') {
        return true
      } else {
        return false
      }
    },
    // 是否为修改
    isChangeModel() {
      if (this.popSettingsData.dialogStatus === 'update') {
        return true
      } else {
        return false
      }
    },
    // 是否为根节点
    isRootNode() {
      if (this.dataJson.tempJson.type === null || this.dataJson.tempJson.type === '') {
        return true
      } else {
        return false
      }
    },
    // 是否为目录节点
    isCONTENTSNode() {
      if (this.dataJson.tempJson.type === this.CONSTANTS.DICT_SYS_MODULE_TYPE_CONTENTS) {
        return true
      } else {
        return false
      }
    },
    // 是否为菜单节点
    isMENUNode() {
      if (this.dataJson.tempJson.type === this.CONSTANTS.DICT_SYS_MODULE_TYPE_MENU) {
        return true
      } else {
        return false
      }
    },
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
        } else {
          this.settings.btnShowStatus.showExport = false
        }
      }
    },
    // 当前行的选中
    'dataJson.currentJson': {
      handler(newVal, oldVal) {
        if (this.dataJson.currentJson.id !== undefined) {
          // this.settings.btnShowStatus.doInsert = true
          this.settings.btnShowStatus.showUpdate = true
          this.settings.btnShowStatus.showCopyInsert = true
          this.settings.btnShowStatus.showExport = true
        } else {
          // this.settings.btnShowStatus.doInsert = false
          this.settings.btnShowStatus.showUpdate = false
          this.settings.btnShowStatus.showCopyInsert = false
          this.settings.btnShowStatus.showExport = false
        }
      },
      deep: true
    },
    'popSettingsData.searchDialogDataTwo.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal === {}) {
          this.dataJson.tempJson.type = null
          this.dataJson.tempJson.name = null
          this.dataJson.tempJson.module_id = null
          this.dataJson.tempJson.path = null
          this.dataJson.tempJson.route_name = null
          this.dataJson.tempJson.meta_title = null
          this.dataJson.tempJson.meta_icon = null
          this.dataJson.tempJson.component = null
          this.dataJson.tempJson.affix = null
        } else {
          this.dataJson.tempJson.type = this.popSettingsData.searchDialogDataTwo.selectedDataJson.type
          this.dataJson.tempJson.name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.name
          this.dataJson.tempJson.module_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
          this.dataJson.tempJson.path = this.popSettingsData.searchDialogDataTwo.selectedDataJson.path
          this.dataJson.tempJson.route_name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.route_name
          this.dataJson.tempJson.meta_title = this.popSettingsData.searchDialogDataTwo.selectedDataJson.meta_title
          this.dataJson.tempJson.meta_icon = this.popSettingsData.searchDialogDataTwo.selectedDataJson.meta_icon
          this.dataJson.tempJson.component = this.popSettingsData.searchDialogDataTwo.selectedDataJson.component
          this.dataJson.tempJson.affix = this.popSettingsData.searchDialogDataTwo.selectedDataJson.affix
        }
      }
    }
  },
  created() {
    this.initShow()
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
        dbversion: 0
      }
    },
    initShow() {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
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
      // this.dataJson.currentJson.id = undefined
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
          this.popSettingsData.dialogFormVisible = false
        }, (_error) => {
          this.$notify({
            title: '更新处理失败',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
          row.is_del = !row.is_del
          this.popSettingsData.dialogFormVisible = false
        }).finally(() => {
          this.settings.listLoading = false
        })
      }).catch(action => {
        row.is_del = !row.is_del
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
      // 初始化模块选择
      this.initModuleSelectButton()

      // 控件focus
      this.$nextTick(() => {
        // this.$refs['selectOne'].focus()
      })
    },
    // 点击按钮 更新
    handleUpdate() {
      // 初始化级联数据
      this.getCascaderDataList()

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
      // 初始化模块选择
      this.initModuleSelectButton()

      // 控件focus
      this.$nextTick(() => {
        // this.$refs['selectOne'].focus()
      })
    },
    // 点击按钮 复制新增
    handleCopyInsert() {
      // 初始化级联数据
      this.getCascaderDataList()

      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.dataJson.tempJson.parent_id = this.dataJson.tempJson.id
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.template_id = undefined
      this.dataJson.tempJson.u_id = ''
      this.dataJson.tempJson.u_time = ''
      this.dataJson.tempJson.code = ''
      this.dataJson.tempJson.son_count = this.dataJson.tempJson.son_count + 1
      this.dataJson.tempJson.path = ''
      this.dataJson.tempJson.type = ''
      this.dataJson.tempJson.meta_title = ''
      this.dataJson.tempJson.meta_icon = ''
      this.dataJson.tempJson.route_name = ''
      this.dataJson.tempJson.component = ''

      // 儿子个数增加
      this.dataJson.tempJson.name = ''

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
      // 初始化模块选择
      this.initModuleSelectButton()

      // 复制新增时focus
      this.$nextTick(() => {
        // this.$refs['selectOne'].focus()
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj

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
        const recorders = response.data.menu_data
        const newRecorders = recorders.map(v => {
          return { ...v, columnTypeShowIcon: false, columnNameShowIcon: false }
        })
        this.dataJson.listData = newRecorders
        this.dataJson.menu_buttons = response.data.menu_buttons
        this.dataJson.paging = response.data.menu_data
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
            this.dataJson.tempJson.dbversion = _data.data.dbversion
            // 设置到table中绑定的json数据源
            // this.dataJson.listData.splice(this.dataJson.rowIndex, 1, this.dataJson.tempJson)
            // 设置到currentjson中
            this.dataJson.currentJson = Object.assign({}, this.dataJson.tempJson)
            this.$notify({
              title: '更新处理成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.getDataList()
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
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 初始化数据
          // this.handleSelectOrReset()
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['selectOne'].focus()
          })
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['selectOne'].focus()
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
          addMenuGroupApi(tempData).then((_data) => {
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
    handleSelectionChange(arr) {
      arr.forEach(function(val, index, arr) {
        console.log(val, index, arr)
      })
      this.dataJson.multipleSelection = arr
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
            可见状态提示：<br/>
            绿色：可见  <br/>
            红色：不可见
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
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
    // --------------弹出查询框：--------------

    // --------------弹出查询框：模块页面--------------
    // 选择or重置按钮的初始化
    initModuleSelectButton() {
      this.$nextTick(() => {
        this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
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
    // 复制新增逻辑
    doCopyInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          addSubMenuApi(tempData).then((_data) => {
            this.$notify({
              title: '复制新增处理成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.getDataList()
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
    // 级联事件
    handleCascaderChange(val) {
      // 数组中最后一个才是parent_id
      this.dataJson.tempJson.parent_id = val[val.length - 1]
    },
    // 删除按钮
    handleRealyDelete() {
      // 没有选择任何数据的情况
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 选择全部的时候
      this.$confirm('请注意：将会删除当前节点以及子节点数据！！', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.settings.listLoading = true
        this.handleRealDeleteData()
      }).catch(action => {
        // 右上角X
        if (action !== 'close') {
          // 当前页所选择的数据导出
        }
      })
    },
    // 选中数据删除
    handleRealDeleteData() {
      // loading
      this.settings.listLoading = true
      const tempData = Object.assign({}, this.dataJson.tempJson)
      // 开始删除
      realDeleteSelectionApi(tempData).then((_data) => {
        this.$notify({
          title: '删除成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        this.getDataList()
        this.dataJson.multipleSelection = []
        // loading
        this.settings.listLoading = false
      }, (_error) => {
        this.$notify({
          title: '删除错误',
          message: _error.message,
          type: 'error',
          duration: this.settings.duration
        })
        this.settings.listLoading = false
      })
    }
  }
}
</script>
