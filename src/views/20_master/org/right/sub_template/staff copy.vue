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
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="员工名称" />
      </el-form-item>
      <el-form-item label="">
        <delete-type-normal v-model="dataJson.searchForm.is_del" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="perfect-icon-reset" @click="doResetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <el-tabs type="card" class="floatLeft" @tab-click="handleTabsClick">
      <el-tab-pane>
        <template slot="label">当前组织下员工<el-badge :value="dataJson.tabsCount.currentOrgStaffCount" type="danger" /></template>
      </el-tab-pane>
      <el-tab-pane>
        <template slot="label">所有员工<el-badge :value="dataJson.tabsCount.allOrgStaffCount" type="danger" /></template>
      </el-tab-pane>
    </el-tabs>
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
      @sort-change="handleSortChange"
    >
      <el-table-column type="index" width="45" label="No" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="员工姓名">
        <template slot-scope="scope">
          <el-link style="float: right" type="primary" @click="handleView(scope.row)"><i class="el-icon-info" /></el-link>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="simple_name" label="姓名简称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="sex_text" label="性别" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="birthday" label="生日" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="email" label="邮箱地址" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" prop="company_simple_name" label="所属公司" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" prop="dept_simple_name" label="默认部门" />
      <el-table-column min-width="90" :sort-orders="settings.sortOrders" label="删除" :render-header="renderHeaderIsDel">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.is_del === 'false' ? '删除状态：已删除' : '删除状态：未删除' " placement="top" :open-delay="500">
            <el-switch
              v-model="scope.row.is_del"
              active-color="#ff4949"
              inactive-color="#13ce66"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              disabled
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
    </el-table>

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible.sync="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :append-to-body="true"
      :modal-append-to-body="false"
      width="800px"
    >
      <el-form
        ref="dataSubmitForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="155px"
        status-icon
        :validate-on-rule-change="false"
      >
        <el-tabs style="height: 500px;">
          <br>
          <el-tab-pane>
            <template slot="label">基本信息<el-badge v-show="popSettingsData.badge.countOne>0" :value="popSettingsData.badge.countOne" type="danger" /></template>
            <el-row>
              <el-col :span="12">
                <el-form-item label="员工姓名：" prop="name">
                  <el-input ref="refFocus" v-model.trim="dataJson.tempJson.name" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="员工姓名拼音：" prop="name_py">
                  <el-input v-model.trim="dataJson.tempJson.name_py" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="员工姓名简称：" prop="simple_name">
                  <el-input v-model.trim="dataJson.tempJson.simple_name" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="员工姓名简称拼音：" prop="simple_name_py">
                  <el-input v-model.trim="dataJson.tempJson.simple_name_py" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="身份证号码：" prop="id_card">
                  <el-input v-model.trim="dataJson.tempJson.id_card" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="护照号码：" prop="passport">
                  <el-input v-model.trim="dataJson.tempJson.passport" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="名族：" prop="nation">
                  <el-input v-model.trim="dataJson.tempJson.nation" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日：" prop="birthday">
                  <el-date-picker v-model="dataJson.tempJson.birthday" value-format="yyyy-MM-dd" :disabled="true" type="date" clearable style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="性别：" prop="sex">
                  <radio-dict v-model="dataJson.tempJson.sex" :para="CONSTANTS.DICT_SYS_SEX_TYPE" :disabled="true" @change="handleSexDictChange" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="在职情况：" prop="service">
                  <select-dict v-model="dataJson.tempJson.service" :para="CONSTANTS.DICT_USR_SERVICE_TYPE" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="婚否 ：" prop="is_wed">
                  <radio-dict v-model="dataJson.tempJson.is_wed" :para="CONSTANTS.DICT_USR_WED_TYPE" :disabled="true" @change="handleWedDictChange" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学历：" prop="degree">
                  <select-dict v-model="dataJson.tempJson.degree" :para="CONSTANTS.DICT_USR_DEGREE_TYPE" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="描述：" prop="descr">
              <el-input v-model.trim="dataJson.tempJson.descr" clearable show-word-limit type="textarea" :disabled="true" />
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane label="联系方式">

            <el-row>
              <el-col :span="12">
                <el-form-item label="家庭电话：" prop="home_phone">
                  <el-input v-model.trim="dataJson.tempJson.home_phone" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="办公室电话：" prop="office_phone">
                  <el-input v-model.trim="dataJson.tempJson.office_phone" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="手机号码：" prop="mobile_phone">
                  <el-input v-model.trim="dataJson.tempJson.mobile_phone" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机备用号码：" prop="mobile_phone_backup">
                  <el-input v-model.trim="dataJson.tempJson.mobile_phone_backup" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="邮箱地址：" prop="email">
                  <el-input v-model.trim="dataJson.tempJson.email" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱备用地址：" prop="email_backup">
                  <el-input v-model.trim="dataJson.tempJson.email_backup" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
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

          </el-tab-pane>

          <el-tab-pane>
            <template slot="label">登录账号信息<el-badge v-show="popSettingsData.badge.countTwo > 0" :value="popSettingsData.badge.countTwo" type="danger" /></template>
            <el-row>
              <el-col :span="12">
                <el-form-item label="开启账号登录：" prop="is_enable">
                  <el-switch
                    v-model="dataJson.tempJson.user.is_enable"
                    :disabled="true"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12" />
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="登录模式：" prop="login_type">
                  <radio-dict v-model="dataJson.tempJson.user.login_type" :para="CONSTANTS.DICT_SYS_LOGIN_TYPE" :disabled="true" @change="handleSysLoginTypeChange" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="登录用户名：" prop="user.login_name">
                  <el-input v-model.trim="dataJson.tempJson.user.login_name" clearable show-word-limit :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设置密码：" prop="">
                  <el-button type="primary" icon="el-icon-unlock" :disabled="true" @click="handelSetPassword">设置密码</el-button>
                  <el-tag v-show="!(dataJson.tempJson.user.pwd === '' || dataJson.tempJson.user.pwd === null || dataJson.tempJson.user.pwd === undefined)" type="success" effect="dark">已设置密码</el-tag>
                  <el-tag v-show="(dataJson.tempJson.user.pwd === '' || dataJson.tempJson.user.pwd === null || dataJson.tempJson.user.pwd === undefined)" type="danger" effect="dark">未设置密码</el-tag>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-form-item label="生效日期区间：" prop="">
                <el-date-picker
                  v-model="dataJson.tempJson.user.datetimerange"
                  type="datetimerange"
                  :picker-options="settings.pickerOptions"
                  range-separator="至"
                  start-placeholder="生效开始日期"
                  end-placeholder="生效结束日期"
                  align="right"
                  style="width: 100%"
                  :disabled="true"
                />
              </el-form-item>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="登录用户类型：" prop="type">
                  <select-dict v-model="dataJson.tempJson.user.type" :para="CONSTANTS.DICT_USR_LOGIN_TYPE" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否删除：" prop="is_del">
                  <el-switch
                    v-model="dataJson.tempJson.user.is_del"
                    active-color="#ff4949"
                    inactive-color="#dcdfe6"
                    active-text="已删除"
                    inactive-text="未删除"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="用户锁定时间：" prop="locked_time">
                  <el-date-picker v-model="dataJson.tempJson.user.locked_time" value-format="yyyy-MM-dd" type="date" clearable style="width: 100%" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否锁定：" prop="is_lock">
                  <el-switch
                    v-model="dataJson.tempJson.user.is_lock"
                    active-color="#ff4949"
                    inactive-color="#dcdfe6"
                    active-text="已锁定"
                    inactive-text="未锁定"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="登录错误次数：" prop="err_count">
                  <el-input v-model.trim="dataJson.tempJson.user.err_count" disabled placeholder="[无]" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否修改过密码：" prop="is_changed_pwd">
                  <el-switch
                    v-model="dataJson.tempJson.user.is_changed_pwd"
                    active-color="#ff4949"
                    inactive-color="#dcdfe6"
                    active-text="已修改"
                    inactive-text="未修改"
                    :disabled="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="最后登录时间：" prop="last_login_date">
                  <el-input v-model.trim="dataJson.tempJson.user.last_login_date" disabled placeholder="[无]" />
                </el-form-item>
              </el-col>
              <el-col :span="12" />
            </el-row>

            <el-form-item label="描述：" prop="descr">
              <el-input v-model.trim="dataJson.tempJson.user.descr" clearable show-word-limit type="textarea" :disabled="true" />
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane>
            <template slot="label">所属信息<el-badge v-show="popSettingsData.badge.countTwo > 0" :value="popSettingsData.badge.countTwo" type="danger" /></template>
            <el-row>
              <el-col :span="12">
                <el-form-item label="所属公司">
                  <select-company-dept
                    v-model.trim="dataJson.tempJson.company_simple_name"
                    :disabled="true"
                    :type="CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY"
                    @closeParentDialog="handleDialogClose"
                    @onReturnData="handleCompanyReturnData"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认部门">
                  <select-company-dept
                    v-model.trim="dataJson.tempJson.dept_simple_name"
                    :disabled="true"
                    :type="CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT"
                    @closeParentDialog="handleDialogClose"
                    @onReturnData="handleDeptReturnData"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12" />
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="权限信息">
            权限信息
          </el-tab-pane>

        </el-tabs>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <el-button plain :disabled="settings.listLoading" @click="handleDialogClose">取消</el-button>
      </div>
    </el-dialog>

    <psd-dialog
      :visible="popSettingsData.searchDialogDataTwo.dialogVisible"
      @closeMeOk="handlePsdDialogCloseOk"
      @closeMeCancel="handlePsdDialogCloseCancel"
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
import { getStaffTabListApi, getUserDataByIdApi } from '@/api/20_master/org/org'
import { getUserBeanByIdApi } from '@/api/user'
import elDragDialog from '@/directive/el-drag-dialog'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import RadioDict from '@/components/00_dict/redio'
import SelectDict from '@/components/00_dict/select/SelectDict'
import psdDialog from '@/views/20_master/staff/dialog/setPsdDialog'
import SelectCompanyDept from '@/views/20_master/staff/selectgrid/companyDept'
import deepCopy from 'deep-copy'
export default {
  name: constants_program.P_STAFF, // 页面id，和router中的name需要一致，作为缓存
  components: { DeleteTypeNormal, RadioDict, SelectDict, psdDialog, SelectCompanyDept },
  directives: { elDragDialog },
  mixins: [],
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      dataJson: {
        // 页签cout数量
        tabsCount: {
          currentOrgStaffCount: 0,
          allOrgStaffCount: 0
        },
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: deepCopy(this.PARAMETERS.PAGE_CONDITION),
          // 查询条件
          id: null,
          name: '',
          code: '', // 左边树种的结点code
          original_code: '', // 左边树种的结点code
          active_tabs_index: 0, // 当前被激活的页签
          is_del: '0' // 未删除
        },
        // table使用的json
        listData: null,
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
        duration: 4000,
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
        }
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          insert: '新增',
          copyInsert: '复制新增',
          info: '详情'
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
        // 错误数目
        badge: {
          countOne: 0,
          countTwo: 0,
          countThree: 0,
          countFour: 0
        },
        // 弹出的查询框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的框参数设置
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
        dialogFormVisible: false
      },
      meDialogSetting: {
        program: this.$store.getters.program,
        selectedDataJson: this.$store.getters.selectedDataJson,
        dialogStatus: false
      }
    }
  },
  computed: {
    // 是否已经设置了密码
    isPsdSetUp() {
      if (this.dataJson.tempJson.user.pwd === '' || this.dataJson.tempJson.user.pwd === null || this.dataJson.tempJson.user.pwd === undefined) {
        return false
      } else {
        return true
      }
    },
    // 是否为更新模式
    isUpdateModel() {
      if (this.popSettingsData.dialogStatus === 'insert' || this.popSettingsData.dialogStatus === 'copyInsert') {
        return false
      } else {
        return true
      }
    },
    isAccountLoginType() {
      if (this.dataJson.tempJson.user.is_enable === {}) {
        return false
      } else {
        return this.dataJson.tempJson.user.is_enable
      }
    },
    isLoginEnabled() {
      if (this.dataJson.tempJson.user.is_enable === true) {
        return true
      } else {
        return false
      }
    },
    /**
     * 考虑所有员工的方法
     * 1:根据code的定义规则，0001xxxx|xxxx|，每4位为一个层，所以找到第一组的4个
     * 2：并设置回code中去
     */
    getRootOrg() {
      return this.dataJson.searchForm.code.substring(0, 4)
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
          this.$nextTick(() => {
            this.$refs['dataSubmitForm'].clearValidate()
          })
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
    'popSettingsData.searchDialogDataOne.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal !== {}) {
          this.dataJson.tempJson.address_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
        } else {
          this.popSettingsData.searchDialogDataOne.selectedDataJson.id = undefined
        }
      }
    }
  },
  created() {
    // this.initShow()
    // 数据初始化
    this.initTempJsonOriginal()
    // 数据初始化
    this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
  },
  mounted() {
    // 描绘完成
    this.$on(this.EMITS.EMIT_ORG_CHANGE, _data => {
      this.dataJson.searchForm.code = _data.code
      this.dataJson.searchForm.original_code = _data.code
      this.initShow()
    })
    // 当岗位成员有发生变更，接收通知
    this.$on(this.EMITS.EMIT_ORG_POSITION_UPDATED, _data => {
      this.initShow()
    })
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
        sex: '',
        is_wed: '',
        user: {
          is_enable: false,
          login_type: '',
          pwd: ''
        }
      }
    },
    initShow() {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.initTempJsonOriginal()
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
    handleSearch() {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
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
      // 查询逻辑
      this.settings.listLoading = true
      Object.assign(this.$data.dataJson.tabsCount, this.$options.data.call(this).dataJson.tabsCount)
      getStaffTabListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.tabsCount.currentOrgStaffCount = response.data.currentOrgStaffCount
        this.dataJson.tabsCount.allOrgStaffCount = response.data.allOrgStaffCount
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        const recorders = response.data.list
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
    // 重置查询区域
    doResetSearch() {
      this.dataJson.searchForm = this.$options.data.call(this).dataJson.searchForm
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
    async getUserBeanById() {
      return await getUserBeanByIdApi({ id: this.dataJson.tempJson.user_id }).then(response => {
        // this.dataJson.tempJson.user = Object.assign({}, response.data)
        return response.data
      })
    },
    handleSexDictChange(val) {
      this.dataJson.tempJson.sex = val
    },
    handleSysLoginTypeChange(val) {
      this.dataJson.tempJson.user.login_type = val
    },
    handleWedDictChange(val) {
      this.dataJson.tempJson.is_wed = val
    },
    handelSetPassword() {
      this.popSettingsData.searchDialogDataTwo.dialogVisible = true
    },
    handlePsdDialogCloseOk(val) {
      this.dataJson.tempJson.user.pwd = val
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    handlePsdDialogCloseCancel() {
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    // -------------------不同的页签，标签进行的验证 e------------------
    // 弹出框关闭
    handleDialogClose() {
      this.popSettingsData.dialogFormVisible = false
    },
    // 返回数据后，并关闭弹出页面，企业
    handleCompanyReturnData(val) {
      this.dataJson.tempJson.company_id = val.serial_id
      this.dataJson.tempJson.company_name = val.name
      this.dataJson.tempJson.company_simple_name = val.simple_name
    },
    // 返回数据后，并关闭弹出页面，部门
    handleDeptReturnData(val) {
      this.dataJson.tempJson.dept_id = val.serial_id
      this.dataJson.tempJson.dept_name = val.name
      this.dataJson.tempJson.dept_simple_name = val.simple_name
    },
    // tabs点击事件
    handleTabsClick(tab, event) {
      if (this.dataJson.searchForm.active_tabs_index === tab.index) {
        return
      }
      switch (tab.index) {
        case '0':
          // 当组织下员工
          this.initShow()
          break
        case '1':
          // 所有员工
          this.initShow()
          break
      }
      this.dataJson.searchForm.active_tabs_index = tab.index
    },
    async handleView(val) {
      this.settings.listLoading = true
      var staffData = await this.getUserDataById(val)
      this.dataJson.tempJson = Object.assign({}, staffData)
      this.popSettingsData.searchDialogDataOne.selectedDataJson = {}
      var userData = await this.getUserBeanById()
      this.dataJson.tempJson.user = Object.assign({}, userData)
      // 修改
      this.popSettingsData.dialogStatus = 'info'
      this.popSettingsData.dialogFormVisible = true
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      this.settings.listLoading = false
    },
    // 根据user id查询用户数据
    async getUserDataById(val) {
      // 查询逻辑
      this.dataJson.searchForm.pageCondition.current = 1
      this.dataJson.searchForm.pageCondition.size = 20
      this.dataJson.searchForm.id = val.id
      return await getUserDataByIdApi(this.dataJson.searchForm).then(response => {
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        return response.data.records[0]
      })
    }
    // -------------------验证部分------------------
    // validateLogin_name(rule, value, callback) {
    //   if (!this.isAccountLoginType) {
    //     return callback()
    //   } else {
    //     if (this.dataJson.tempJson.user.login_name === '') {
    //       return callback(new Error('请输入登录用户名'))
    //     }
    //   }
    // }
    // -------------------验证部分------------------
  }
}
</script>
