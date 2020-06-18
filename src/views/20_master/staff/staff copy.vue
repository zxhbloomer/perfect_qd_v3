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

    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-s-management" :loading="settings.listLoading" @click="handleExport">导出</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-info" :loading="settings.listLoading" @click="handleView">查看</el-button>
    </el-button-group>
    <el-button-group>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-user-solid" :loading="settings.listLoading" @click="handleUpdate">调整岗位</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-user" :loading="settings.listLoading" @click="handleUpdate">设置角色</el-button>
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
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="员工姓名" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="120" :sort-orders="settings.sortOrders" prop="simple_name" label="姓名简称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="sex_text" label="性别" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="birthday" label="生日" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="120" :sort-orders="settings.sortOrders" prop="email" label="邮箱地址" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" prop="company_name" label="所属公司" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" prop="dept_name" label="默认部门" />

      <el-table-column header-align="center" label="岗位信息" min-width="150">
        <template v-slot="column_lists">
          <el-tag v-for="item in column_lists.row.positions" :key="item.position_id" class="position_tag" @click.stop="handlePositionClick(item.position_name)">
            {{ item.position_name }}
          </el-tag>
        </template>
      </el-table-column>

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
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" min-width="90" :sort-orders="settings.sortOrders" prop="u_name" label="更新人" />
      <el-table-column sortable="custom" min-width="180" :sort-orders="settings.sortOrders" show-overflow-tooltip prop="u_time" label="更新时间">
        <template v-slot="scope">
          {{ formatDateTime(scope.row.u_time) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-if="popSettingsData.dialogFormVisible"
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
                  <el-input ref="refFocus" v-model.trim="dataJson.tempJson.name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="员工姓名拼音：" prop="name_py">
                  <el-input v-model.trim="dataJson.tempJson.name_py" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name_py" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="员工姓名简称：" prop="simple_name">
                  <el-input v-model.trim="dataJson.tempJson.simple_name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.simple_name" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="员工姓名简称拼音：" prop="simple_name_py">
                  <el-input v-model.trim="dataJson.tempJson.simple_name_py" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.simple_name_py" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="身份证号码：" prop="id_card">
                  <el-input v-model.trim="dataJson.tempJson.id_card" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.id_card" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="护照号码：" prop="passport">
                  <el-input v-model.trim="dataJson.tempJson.passport" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.passport" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="名族：" prop="nation">
                  <el-input v-model.trim="dataJson.tempJson.nation" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.nation" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日：" prop="birthday">
                  <el-date-picker v-model="dataJson.tempJson.birthday" value-format="yyyy-MM-dd" type="date" clearable :placeholder="isPlaceholderShow('请输入')" style="width: 100%" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="性别：" prop="sex">
                  <radio-dict v-model="dataJson.tempJson.sex" :para="CONSTANTS.DICT_SYS_SEX_TYPE" :disabled="isViewModel" @change="handleSexDictChange" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="在职情况：" prop="service">
                  <select-dict v-model="dataJson.tempJson.service" :para="CONSTANTS.DICT_USR_SERVICE_TYPE" init-placeholder="请选择在职情况" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="婚否 ：" prop="is_wed">
                  <radio-dict v-model="dataJson.tempJson.is_wed" :para="CONSTANTS.DICT_USR_WED_TYPE" :disabled="isViewModel" @change="handleWedDictChange" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学历：" prop="degree">
                  <select-dict v-model="dataJson.tempJson.degree" :para="CONSTANTS.DICT_USR_DEGREE_TYPE" init-placeholder="请选择学历情况" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="描述：" prop="descr">
              <el-input v-model.trim="dataJson.tempJson.descr" clearable show-word-limit type="textarea" :maxlength="dataJson.inputSettings.maxLength.descr" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane label="联系方式">

            <el-row>
              <el-col :span="12">
                <el-form-item label="家庭电话：" prop="home_phone">
                  <el-input v-model.trim="dataJson.tempJson.home_phone" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.home_phone" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="办公室电话：" prop="office_phone">
                  <el-input v-model.trim="dataJson.tempJson.office_phone" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.office_phone" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="手机号码：" prop="mobile_phone">
                  <el-input v-model.trim="dataJson.tempJson.mobile_phone" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.mobile_phone" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机备用号码：" prop="mobile_phone_backup">
                  <el-input v-model.trim="dataJson.tempJson.mobile_phone_backup" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.mobile_phone_backup" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="邮箱地址：" prop="email">
                  <el-input v-model.trim="dataJson.tempJson.email" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.email" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱备用地址：" prop="email_backup">
                  <el-input v-model.trim="dataJson.tempJson.email_backup" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.email_backup" :placeholder="isPlaceholderShow('请输入')" :disabled="isViewModel" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row v-show="popSettingsData.dialogStatus === 'update'">
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

          </el-tab-pane>

          <el-tab-pane>
            <template slot="label">登录账号信息<el-badge v-show="popSettingsData.badge.countTwo > 0" :value="popSettingsData.badge.countTwo" type="danger" /></template>
            <el-row>
              <el-col :span="12">
                <el-form-item label="开启账号登录：" prop="is_enable">
                  <el-switch
                    v-model="dataJson.tempJson.user.is_enable"
                    active-text="开启"
                    inactive-text="关闭"
                    :disabled="isViewModel"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12" />
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="登录模式：" prop="login_type">
                  <radio-dict v-model="dataJson.tempJson.user.login_type" :para="CONSTANTS.DICT_SYS_LOGIN_TYPE" :disabled="!isAccountLoginType || isViewModel" @change="handleSysLoginTypeChange" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="登录用户名：" prop="user.login_name">
                  <el-input v-model.trim="dataJson.tempJson.user.login_name" clearable show-word-limit :maxlength="dataJson.inputSettings.user.maxLength.login_name" :placeholder="isPlaceholderShow('请输入')" :disabled="!isAccountLoginType || isViewModel" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设置密码：" prop="">
                  <el-button type="primary" icon="el-icon-unlock" :disabled="!isAccountLoginType || isViewModel" @click="handelSetPassword">设置密码</el-button>
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
                  :disabled="!isAccountLoginType"
                />
              </el-form-item>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="登录用户类型：" prop="type">
                  <select-dict v-model="dataJson.tempJson.user.type" :para="CONSTANTS.DICT_USR_LOGIN_TYPE" init-placeholder="请选择登录用户类型" :disabled="!isAccountLoginType || isViewModel" />
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
                    :disabled="!isAccountLoginType"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="用户锁定时间：" prop="locked_time">
                  <el-date-picker v-model="dataJson.tempJson.user.locked_time" value-format="yyyy-MM-dd" type="date" clearable :placeholder="isPlaceholderShow('选择日期')" style="width: 100%" :disabled="!isAccountLoginType || isViewModel" />
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
                    :disabled="!isAccountLoginType || isViewModel"
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
                    :disabled="!isAccountLoginType || isViewModel"
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
              <el-input v-model.trim="dataJson.tempJson.user.descr" clearable show-word-limit type="textarea" :maxlength="dataJson.inputSettings.maxLength.descr" :placeholder="isPlaceholderShow('选择日期')" :disabled="isViewModel" />
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane>
            <template slot="label">所属信息<el-badge v-show="popSettingsData.badge.countTwo > 0" :value="popSettingsData.badge.countTwo" type="danger" /></template>
            <el-row>
              <el-col :span="12">
                <el-form-item label="所属公司：">
                  <select-company-dept
                    v-model.trim="dataJson.tempJson.company_name"
                    :placeholder="isPlaceholderShow('请选择所属公司')"
                    :type="CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY"
                    :current-id="dataJson.tempJson.company_id"
                    :disabled="isViewModel"
                    @closeParentDialog="handleDialogClose"
                    @onReturnData="handleCompanyReturnData"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认部门：">
                  <select-company-dept
                    v-model.trim="dataJson.tempJson.dept_name"
                    :placeholder="isPlaceholderShow('请选择默认部门')"
                    :type="CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT"
                    :current-id="dataJson.tempJson.dept_id"
                    :disabled="isViewModel"
                    @closeParentDialog="handleDialogClose"
                    @onReturnData="handleDeptReturnData"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="岗位信息：">
                  <template>
                    <div class="el-input-tag input-tag-wrapper ">
                      <el-popconfirm
                        v-for="item in dataJson.tempJson.positions"
                        :key="item.position_id"
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        icon="el-icon-info"
                        icon-color="red"
                        title="点击确定后跳转到岗位页面，请注意保存当前数据。"
                        @onConfirm="handlePositionClick(item.position_name)"
                      >
                        <el-tag slot="reference" class="position_tag">
                          {{ item.position_name }}
                        </el-tag>
                      </el-popconfirm>
                    </div>
                  </template>
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
        <div class="floatLeft">
          <el-button v-show="!isViewModel" type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset" @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="handleDialogClose">取消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " @click="doInsert()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate && !isViewModel" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确定</el-button>
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
  .input-tag-wrapper {
    position: relative;
    font-size: 14px;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    outline: none;
    padding: 0 10px 0 5px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
  }
  .el-card ::v-deep .el-card__header {
    padding: 10px 10px;
  }
  .el-card ::v-deep .el-card__body {
    padding: 10px ;
  }
  .position_tag{
   cursor: pointer;
  }
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
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/20_master/staff/staff'
import { getUserBeanByIdApi } from '@/api/user'
import resizeMixin from './staffResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import DeleteTypeNormal from '@/components/00_dict/select/SelectDeleteTypeNormal'
import RadioDict from '@/components/00_dict/redio'
import SelectDict from '@/components/00_dict/select/SelectDict'
import psdDialog from '@/views/20_master/staff/dialog/setPsdDialog'
import SelectCompanyDept from '@/views/20_master/staff/selectgrid/companyDept'
import deepCopy from 'deep-copy'
export default {
  name: constants_program.P_STAFF, // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, DeleteTypeNormal, RadioDict, SelectDict, psdDialog, SelectCompanyDept },
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
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            name_py: 20,
            simple_name: 10,
            simple_name_py: 15,
            id_card: 25,
            passport: 20,
            nation: 20,
            home_phone: 15,
            office_phone: 15,
            mobile_phone: 15,
            mobile_phone_backup: 15,
            email: 20,
            email_backup: 20,
            descr: 200
          },
          user: {
            maxLength: {
              login_name: 20
            }
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
        rules: {},
        // 基本信息栏目check
        rulesOne: {
          name: [{ required: true, message: '请输入员工姓名', trigger: 'change' }]
        },
        rulesTwo: {
          'user.login_name': [{ required: true, message: '请输入登录用户名', trigger: 'change' }]
        },
        rules_disable: {
          // 默认可用
          end_date: false
        },
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
    // 是否为查看模式
    isViewModel() {
      if ((this.popSettingsData.dialogStatus === 'view') && (this.popSettingsData.dialogFormVisible === true)) {
        return true
      } else {
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
    this.initShow()
    if (this.$route.params.name !== undefined) {
      this.dataJson.searchForm.name = this.$route.params.name
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
      // reset所有验证
      this.doResetValidate()
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
        }).finally(() => {
          this.popSettingsData.dialogFormVisible = false
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
      // reset所有验证
      this.doResetValidate()
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },
    // 点击按钮 更新
    async handleUpdate() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.popSettingsData.searchDialogDataOne.selectedDataJson = {}
      var userData = await this.getUserBeanById()
      this.dataJson.tempJson.user = Object.assign({}, userData)
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      // reset所有验证
      this.doResetValidate()
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
      })
    },
    async handleView() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.popSettingsData.searchDialogDataOne.selectedDataJson = {}
      var userData = await this.getUserBeanById()
      this.dataJson.tempJson.user = Object.assign({}, userData)
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
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
      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      // reset所有验证
      this.doResetValidate()
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 复制新增时focus
      this.$nextTick(() => {
        this.$refs['refFocus'].focus()
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
      // 开始综合验证
      this.doValidateByTabs()
      this.$refs['dataSubmitForm'].validate((valid, items) => {
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
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          break
      }
      // 去除validate信息
      // reset所有验证
      this.doResetValidate()
    },
    // 插入逻辑
    doInsert() {
      // 开始综合验证
      this.doValidateByTabs()
      this.$refs['dataSubmitForm'].validate((valid, validateItems) => {
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
    // -------------------不同的页签，标签进行的验证------------------
    // 所有的数据开始validate
    doValidateAllRules() {
      if (this.isLoginEnabled) {
        this.popSettingsData.rules = { ...this.popSettingsData.rulesOne, ...this.popSettingsData.rulesTwo }
      } else {
        this.popSettingsData.rules = { ...this.popSettingsData.rulesOne }
      }
      this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
      this.$refs['dataSubmitForm'].clearValidate()
    },
    // 开始综合验证
    doValidateByTabs() {
      // 第一个tabs
      this.popSettingsData.rules = this.popSettingsData.rulesOne
      this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
      this.$refs['dataSubmitForm'].clearValidate()
      this.$refs['dataSubmitForm'].validate((valid, validateItems) => {
        if (valid === false) {
          this.popSettingsData.badge.countOne = Object.keys(validateItems).length
        } else {
          this.popSettingsData.badge.countOne = 0
        }
      })
      // 第二个tabs
      if (this.isLoginEnabled) {
        if (this.isAccountLoginType) {
          this.popSettingsData.rules = this.popSettingsData.rulesTwo
          this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
          this.$refs['dataSubmitForm'].clearValidate()
          this.$refs['dataSubmitForm'].validate((valid, validateItems) => {
            if (valid === false) {
              this.popSettingsData.badge.countTwo = Object.keys(validateItems).length
            } else {
              this.popSettingsData.badge.countTwo = 0
            }
          })
        }
      }
      // 所有的数据进行验证
      this.doValidateAllRules()
    },
    // reset所有验证
    doResetValidate() {
      this.popSettingsData.badge.countOne = 0
      this.popSettingsData.badge.countTwo = 0
      this.$nextTick(() => {
        this.doValidateAllRules()
      })
    },
    // -------------------不同的页签，标签进行的验证 s------------------
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
    // Placeholder设置
    isPlaceholderShow(val) {
      if (this.isViewModel) {
        return ''
      } else {
        return val
      }
    },
    handlePositionClick(val) {
      this.popSettingsData.dialogFormVisible = false
      // 通知路由，打开岗位页面
      this.$router.push({ name: this.PROGRAMS.P_POSITION, query: { name: val }})
    }
  }
}
</script>
