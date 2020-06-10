/**
 * loading控件
 */
const EMIT_LOADING = 'global:getDataList_loading'
const EMIT_LOADING_OK = 'global:getDataList_loading_ok'

/**
 * 组织机构管理页面之间，进行通讯，兄弟通讯，
 * left：树
 * right：tabs
 *        tab1：组织机构
 *        tab2：集团信息
 *        tab3：企业信息
 *        tab4：部门信息
 *        tab5：岗位信息
 *        tab6：员工信息
 */
const EMIT_ORG_LEFT = 'global:getDataListLeft'
const EMIT_ORG_CHANGE = 'global:getDataList'
const EMIT_ORG_CHANGE_LOADING = 'global:getDataList_loading'
const EMIT_ORG_CHANGE_LOADING_OK = 'global:getDataList_loading_ok'
const EMIT_ORG_POSITION_UPDATED = 'global:position_updated'

export default {
  EMIT_LOADING,
  EMIT_LOADING_OK,
  EMIT_ORG_LEFT,
  EMIT_ORG_CHANGE,
  EMIT_ORG_CHANGE_LOADING,
  EMIT_ORG_CHANGE_LOADING_OK,
  EMIT_ORG_POSITION_UPDATED
}
