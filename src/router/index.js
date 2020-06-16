import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import subMenu from '@/views/10_system/submenu'

/**
 * 解决Vue-Router升级导致的Uncaught (in promise)问题
 */
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  // {
  //   path: '/redirect',
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: '/redirect/:path*',
  //       component: () => import('@/views/redirect/index')
  //     }
  //   ]
  // },
  {
    path: '/password_reset',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/signup',
    component: () => import('@/views/00_platform/signup'),
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: 'dashboard',
    name: 'P00000070', // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/01_dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true, fulltitle: ['首页'] }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/sys',
    component: Layout,
    redirect: 'noRedirect',
    name: 'M00000010', // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
    alwaysShow: true,
    meta: {
      title: '系统管理',
      icon: '系统管理',
      noCache: true
    },
    children: [
      { path: 'role',
        component: () => import('@/views/10_system/role/role'),
        name: 'P00000000',
        meta: { title: '角色管理', icon: '角色' }
      },
      { path: 'resource',
        component: () => import('@/views/10_system/resource/resource'),
        name: 'P00000020',
        meta: { title: '资源管理', icon: '资源管理' }
      },
      { path: 'syscode',
        component: () => import('@/views/00_platform/syscode/syscode'),
        name: 'P00000180',
        meta: { title: '系统编码', icon: 'syscode' }
      },
      { path: 'vue',
        component: () => import('@/views/10_system/vuesetting/vue'),
        name: 'P00000190',
        meta: { title: 'vue页面维护', icon: 'syscode' }
      },
      {
        path: 'dic',
        // component: subMenu,
        redirect: 'noRedirect',
        // name: 'M00000020', // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
        alwaysShow: true,
        meta: {
          title: '字典管理',
          icon: '字典管理',
          noCache: true
        },
        children: [
          { path: 'dicttype',
            component: () => import('@/views/10_system/dicttype/dicttype'),
            name: 'P00000030',
            meta: { title: '字典类型' }
          },
          { path: 'dictdata',
            component: () => import('@/views/10_system/dictdata/dictdata'),
            name: 'P00000050',
            meta: { title: '字典数据' }
          }
        ]
      },
      {
        path: 'module',
        // component: subMenu,
        redirect: 'noRedirect',
        // name: 'M00000020', // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
        alwaysShow: true,
        meta: {
          title: '模块管理',
          icon: '模块编辑',
          noCache: true
        },
        children: [
          { path: 'page',
            component: () => import('@/views/10_system/module/module'),
            name: 'P00000040',
            meta: { title: '模块编辑' }
          },
          { path: 'button',
            component: () => import('@/views/10_system/modulebutton/modulebutton'),
            name: 'P00000041',
            meta: { title: '模块按钮' }
          }
        ]
      },
      { path: 'config',
        component: () => import('@/views/10_system/config/config'),
        name: 'P00000060',
        meta: { title: '系统参数', icon: '系统参数' }
      },
      { path: 'tenant',
        component: () => import('@/views/10_system/tenant/tenant'),
        name: 'P00000080',
        meta: { title: '租户管理', icon: 'tenant' }
      },
      {
        path: 'fun',
        // component: subMenu,
        redirect: 'noRedirect',
        alwaysShow: true,
        meta: { title: '功能操作管理', icon: 'pages', noCache: true },
        children: [
          {
            path: 'funs',
            component: () => import('@/views/10_system/pages/function/function'),
            name: 'P00000220',
            meta: { title: '按钮维护' }
          },
          {
            path: 'pages',
            component: () => import('@/views/10_system/pages/page/page'),
            name: 'P00000200',
            meta: { title: '页面维护' }
          },
          {
            path: 'page_fun',
            component: () => import('@/views/10_system/pages/page_function/page_function'),
            name: 'P00000210',
            meta: { title: '页面按钮维护' }
          }
        ]
      },
      { path: 'sysmenu',
        component: () => import('@/views/10_system/sysmenu/sysmenu'),
        name: 'P00000120',
        meta: { title: '系统菜单设置', icon: '菜单' }
      },
      {
        path: 'org',
        // component: subMenu,
        redirect: 'noRedirect',
        name: 'M00000020', // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
        alwaysShow: true,
        meta: { title: '组织机构', icon: '组织机构', noCache: true },
        children: [
          {
            path: 'group',
            component: () => import('@/views/20_master/group/group'),
            name: 'P00000100',
            meta: { title: '集团信息' }
          },
          {
            path: 'company',
            component: () => import('@/views/20_master/company/company'),
            name: 'P00000110',
            meta: { title: '企业信息' }
          },
          {
            path: 'address',
            component: () => import('@/views/20_master/address/address'),
            name: 'P00000130',
            meta: { title: '地址簿' }
          },
          {
            path: 'staff',
            component: () => import('@/views/20_master/staff/staff'),
            name: 'P00000140',
            meta: { title: '员工管理' }
          },
          {
            path: 'dept',
            component: () => import('@/views/20_master/dept/dept'),
            name: 'P00000150',
            meta: { title: '部门信息' }
          },
          {
            path: 'position',
            component: () => import('@/views/20_master/position/position'),
            name: 'P00000160',
            meta: { title: '岗位信息' }
          },
          { path: 'orginfo',
            component: () => import('@/views/20_master/org/org'),
            name: 'P00000170',
            meta: { title: '组织机构管理' }
          }
        ]
      }
    ]
  }
]

let asyncRoutesConvertToOneRouter = [
  {
    path: '/async',
    component: Layout,
    redirect: 'noRedirect',
    children: []
  }
]

function clearAsyncRoutesConvertToOneRouter() {
  asyncRoutesConvertToOneRouter = [
    {
      path: '/async',
      component: Layout,
      redirect: 'noRedirect',
      children: []
    }
  ]
}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// 按一级路由的方式来设置，并返回
export function convertToOneRouter(orignal, _path) {
  // 初始化
  clearAsyncRoutesConvertToOneRouter()
  let path = _path === undefined ? '' : _path + '/'
  for (const item of orignal) {
    path = path + item.path
    if (item.children) {
      // convertToOneRouter(item.children, path)
      if (item.meta.fulltitle === undefined) {
        item.meta.fulltitle = []
      }
      item.meta.fulltitle.push(item.meta.title)
      findChilds(item.children, path, item, asyncRoutesConvertToOneRouter)
    } else {
      item.path = path
      if (item.meta.fulltitle === undefined) {
        item.meta.fulltitle = []
      }
      item.meta.fulltitle.push(item.meta.title)
      asyncRoutesConvertToOneRouter[0].children.push(item)
    }
  }
  return asyncRoutesConvertToOneRouter
}

// 查找子节点
function findChilds(children, _path, _parent, _childrens) {
  let path = _path === undefined ? '' : _path + '/'
  for (const _childItem of children) {
    if (_childItem.children) {
      path = _path + '/' + _childItem.path
      if (_childItem.meta.fulltitle === undefined) {
        _childItem.meta.fulltitle = []
      }
      _childItem.meta.fulltitle = [..._parent.meta.fulltitle, _childItem.meta.title]
      // _childItem.meta.fulltitle.push(_childItem.meta.title)
      findChilds(_childItem.children, path, _childItem, _childrens)
    } else {
      path = _path === undefined ? '' : _path + '/'
      _childItem.path = path.endsWith('/') ? (path + _childItem.path) : (path + '/' + _childItem.path)
      if (_childItem.meta.fulltitle === undefined) {
        _childItem.meta.fulltitle = []
      }
      // _childItem.meta.fulltitle.push(_childItem.meta.title)
      _childItem.meta.fulltitle = [..._parent.meta.fulltitle, _childItem.meta.title]
      _childrens[0].children.push(_childItem)
    }
  }
}

// // 按全路径的方式来设置，并返回
// export function convertFullPathMenuRouter(orignal, _path) {
//   const _childrens = []
//   let path = _path === undefined ? '' : _path + '/'
//   for (const item of orignal) {
//     path = path + item.path
//     if (item.children) {
//       // convertToOneRouter(item.children, path)
//       findChilds(item.children, path, _childrens)
//     } else {
//       item.path = path
//       _childrens.push(item)
//     }
//   }
//   // orignal为全路径的菜单路由
//   // store.dispatch('menuRouter/setMenuRouter', orignal)
//   return orignal
// }

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
