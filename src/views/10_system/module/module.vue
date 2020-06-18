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
        <el-input v-model.trim="dataJson.searchForm.code" clearable placeholder="模块编号" />
      </el-form-item>
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="模块名称" />
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
      width="420"
      title="高级查询"
      popper-class="perfect_popper"
    >
      <el-form
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
        class="floatRight"
      >
        <el-form-item v-show="false" label="">
          <el-input v-show="false" v-model.trim="dataJson.searchForm.code" clearable placeholder="模块编号" />
        </el-form-item>
        <el-form-item v-show="false" label="">
          <el-input v-show="false" v-model.trim="dataJson.searchForm.name" clearable placeholder="模块名称" />
        </el-form-item>
        <el-form-item label="">
          <select-dicts v-model="dataJson.searchForm.types" :para="CONSTANTS.DICT_SYS_MODULE_TYPE" init-placeholder="请选择模块类型" />
        </el-form-item>
        <el-form-item label="">
          <delete-type-normal v-model="dataJson.searchForm.is_del" />
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
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" label="No" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="110" :sort-orders="settings.sortOrders" prop="type_name" label="模块类型" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="rowcount" label="按钮设置">
        <template v-slot="scope">
          <span>已有（</span>
          <el-link type="primary" :href="'#/sys/module/button?module_code=' + scope.row.code">{{ scope.row.rowcount }}
            <svg-icon v-show="scope.row.columnTypeShowIcon" icon-class="perfect-icon-eye-open1" class="el-icon--right" />
          </el-link>
          <span>）</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="code" label="模块编号" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="模块名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="path" label="请求地址" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="route_name" label="路由名" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="meta_title" label="菜单名" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="perms" label="权限标识" />
      <el-table-column show-overflow-tooltip min-width="150" prop="descr" label="描述" />
      <el-table-column min-width="70" :sort-orders="settings.sortOrders" label="删除" :render-header="renderHeaderIsDel">
        <template v-slot="scope">
          <el-tooltip :content="scope.row.is_del === 'false' ? '删除状态：已删除' : '删除状态：未删除' " placement="top" :open-delay="500">
            <el-switch
              v-model="scope.row.is_del"
              active-color="#ff4949"
              inactive-color="#13ce66"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" min-width="180" :sort-orders="settings.sortOrders" show-overflow-tooltip prop="u_time" label="更新时间">
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip min-width="120" prop="templateName" label="使用资源名称" />
      <el-table-column show-overflow-tooltip min-width="120" prop="templateDescr" label="资源描述" />
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <resource-dialog
      :visible="popSettingsData.searchDialogData.dialogVisible"
      @closeMeOk="handleResourceCloseOk"
      @closeMeCancel="handleResourceCloseCancel"
    />
    <!-- pop窗口 数据编辑:新增、修改、-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="false"
      width="800px"
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
          title="模块基本信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-form-item label="模块类型：" prop="type">
            <select-dict ref="refInsertFocus" v-model="dataJson.tempJson.type" :para="CONSTANTS.DICT_SYS_MODULE_TYPE" init-placeholder="请选择模块类型" />
          </el-form-item>
          <el-col :span="12">
            <el-form-item label="模块编号：" prop="code">
              <el-input v-model.trim="dataJson.tempJson.code" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.code" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称：" prop="name">
              <el-input ref="refUpdateFocus" v-model.trim="dataJson.tempJson.name" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述：" prop="descr">
          <el-input v-model.trim="dataJson.tempJson.descr" placeholder="请输入" clearable type="textarea" show-word-limit :maxlength="dataJson.inputSettings.maxLength.descr" />
        </el-form-item>
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
        <div v-show="dataJson.tempJson.type===CONSTANTS.DICT_SYS_MODULE_TYPE_CONTENTS">
          <el-alert
            title="目录信息"
            type="info"
            :closable="false"
          />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="请求地址：" prop="path">
                <el-input v-model.trim="dataJson.tempJson.path" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.path" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路由名：" prop="route_name">
                <el-input v-model.trim="dataJson.tempJson.route_name" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.route_name" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单名：" prop="meta_title">
                <el-input v-model.trim="dataJson.tempJson.meta_title" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.meta_title" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单icon：" prop="meta_icon">
                <el-input v-model.trim="dataJson.tempJson.meta_icon" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.meta_icon" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="模块：" prop="component">
            <el-input v-model.trim="popSettingsData.searchDialogData.selectedDataJson.component" type="textarea" placeholder="请输入" :maxlength="dataJson.inputSettings.maxLength.component" />
          </el-form-item>
        </div>
        <div v-show="dataJson.tempJson.type===CONSTANTS.DICT_SYS_MODULE_TYPE_MENU">
          <el-alert
            title="菜单信息"
            type="info"
            :closable="false"
          />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="请求地址：" prop="path">
                <el-input v-model.trim="dataJson.tempJson.path" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.path" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路由名：" prop="route_name">
                <el-input v-model.trim="dataJson.tempJson.route_name" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.route_name" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单名：" prop="meta_title">
                <el-input v-model.trim="dataJson.tempJson.meta_title" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.meta_title" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单icon：" prop="meta_icon">
                <el-input v-model.trim="dataJson.tempJson.meta_icon" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.meta_icon" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="不可关闭：" prop="affix">
                <el-switch v-model="dataJson.tempJson.affix" active-text="不可关闭" inactive-text="可以关闭" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块：" prop="component">
                <el-input v-model.trim="dataJson.tempJson.component" type="textarea" placeholder="请输入" :maxlength="dataJson.inputSettings.maxLength.component" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-show="dataJson.tempJson.type===CONSTANTS.DICT_SYS_MODULE_TYPE_PAGE">
          <el-alert
            title="页面资源信息：非必须"
            type="info"
            :closable="false"
          />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="资源类型：" prop="templateType">
                <el-input v-model="popSettingsData.searchDialogData.selectedDataJson.type" disabled>
                  <el-button slot="append" ref="selectOne" :icon="popSettingsData.searchDialogData.selectOrResetIcon" @click="handleSelectOrReset">
                    {{ popSettingsData.searchDialogData.selectOrResetName }}
                  </el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资源名称：" prop="templateName">
                <el-input v-model="popSettingsData.searchDialogData.selectedDataJson.name" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述：" prop="templateDescr">
            <el-input v-model.trim="popSettingsData.searchDialogData.selectedDataJson.descr" disabled type="textarea" />
          </el-form-item>
          <el-form-item label="JSON配置信息：" prop="templateContext">
            <el-input v-model.trim="popSettingsData.searchDialogData.selectedDataJson.context" disabled :autosize="{ minRows: 4, maxRows: 10 }" type="textarea" />
          </el-form-item>
        </div>
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
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/10_system/module/module'
import resizeMixin from './moduleResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import resourceDialog from '@/views/10_system/resource/dialog/dialog'
import SelectDicts from '@/components/00_dict/select/SelectDicts'
import SelectDict from '@/components/00_dict/select/SelectDict'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import deepCopy from 'deep-copy'

export default {
  name: constants_program.P_PAGE, // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, resourceDialog, SelectDicts, DeleteTypeNormal, SelectDict },
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
          is_del: 'null',
          isenable: '',
          types: []
        },
        // 分页控件的json
        paging: deepCopy(this.PARAMETERS.PAGE_JSON),
        // table使用的json，数据源
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          type: '',
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
            path: 10,
            route_name: 20,
            meta_title: 20,
            meta_icon: 20,
            component: 100
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: [],
        dicType: 'module_type'
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: deepCopy(this.PARAMETERS.SORT_PARA),
        // 按钮状态是否启用
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
          type: [{ required: true, message: '请选择模块类型', trigger: 'change' }],
          code: [{ required: true, message: '请输入模块编号', trigger: 'change' }],
          name: [{ required: true, message: '请输入模块名称', trigger: 'change' }]
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
    isUpdate() {
      if (this.popSettingsData.dialogStatus === 'update') {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
    // 监听弹出窗口是否有返回值
    'popSettingsData.searchDialogData.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal.id !== undefined) {
          this.dataJson.tempJson.template_id = newVal.id
        }
      },
      deep: true,
      immediate: true
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
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.initPopUpStatus()
          // 修改的情况下
          if (this.popSettingsData.dialogStatus === 'update') {
            this.initResourceData()
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
  methods: {
    initResourceData() {
      // 设置资源部分的数据，从表格上复制
      this.popSettingsData.searchDialogData.selectedDataJson = {
        id: this.dataJson.tempJson.template_id,
        type: this.dataJson.tempJson.templateType,
        name: this.dataJson.tempJson.templateName,
        descr: this.dataJson.tempJson.templateDescr,
        context: this.dataJson.tempJson.templateContext
      }
      this.initSelectOrResectButton()
    },
    // 弹出框设置初始化
    initPopUpStatus() {
      this.popSettingsData.btnDisabledStatus.disabledReset = true
      this.popSettingsData.btnDisabledStatus.disabledInsert = true
      this.popSettingsData.btnDisabledStatus.disabledUpdate = true
      this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
      this.popSettingsData.searchDialogData.selectedDataJson = {}
      this.initSelectOrResectButton()
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
    // 选择资源窗口判断是否已经选择
    isResourceSelected() {
      if (this.popSettingsData.searchDialogData.selectedDataJson.id === undefined) {
        // 未选择
        return false
      } else {
        // 已经选择
        return true
      }
    },
    // 选择or重置按钮的初始化
    initSelectOrResectButton() {
      if (this.isResourceSelected() === false) {
        this.$nextTick(() => {
          this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
        })
        this.popSettingsData.searchDialogData.selectOrReset = false
        this.popSettingsData.searchDialogData.selectOrResetName = '选择'
        this.popSettingsData.searchDialogData.selectOrResetIcon = 'el-icon-search'
      } else {
        this.$nextTick(() => {
          this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_reset'
        })
        this.popSettingsData.searchDialogData.selectOrReset = true
        this.popSettingsData.searchDialogData.selectOrResetName = '清空'
        this.popSettingsData.searchDialogData.selectOrResetIcon = 'el-icon-circle-close'
      }
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
          // this.popSettingsData.dialogFormVisible = false
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
        this.$refs['refInsertFocus'].$el.focus
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
            this.dataJson.tempJson = _data.data
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
          this.initResourceData()
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
          this.initResourceData()
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refInsertFocus'].$el.focus
          })
          break
        case 'insert':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = {}
          // 初始化数据
          this.initResourceData()
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refInsertFocus'].$el.focus
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
    // 弹出查询对话框
    handleSelectOrReset() {
      // this.$store.dispatch('popUpSearchDialog/show', true)
      if (this.popSettingsData.searchDialogData.selectOrReset === false) {
        // 选择按钮
        this.popSettingsData.searchDialogData.dialogVisible = true
      } else {
        // 重置按钮
        this.popSettingsData.searchDialogData.selectedDataJson = {}
        this.initSelectOrResectButton()
        this.dataJson.tempJson.template_id = undefined
        this.dataJson.tempJson.templateType = ''
        this.dataJson.tempJson.templateName = ''
        this.dataJson.tempJson.templateDescr = ''
        this.dataJson.tempJson.templateContext = ''
      }
    },
    // 关闭对话框：确定
    handleResourceCloseOk(val) {
      this.popSettingsData.searchDialogData.selectedDataJson = val
      this.popSettingsData.searchDialogData.dialogVisible = false
      this.initSelectOrResectButton()
      this.dataJson.tempJson.template_id = this.popSettingsData.searchDialogData.selectedDataJson.id
      this.dataJson.tempJson.templateType = this.popSettingsData.searchDialogData.selectedDataJson.type
      this.dataJson.tempJson.templateName = this.popSettingsData.searchDialogData.selectedDataJson.name
      this.dataJson.tempJson.templateDescr = this.popSettingsData.searchDialogData.selectedDataJson.descr
      this.dataJson.tempJson.templateContext = this.popSettingsData.searchDialogData.selectedDataJson.context
    },
    // 关闭对话框：取消
    handleResourceCloseCancel() {
      this.popSettingsData.searchDialogData.dialogVisible = false
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
    }
  }
}
</script>
