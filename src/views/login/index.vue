<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">登&#8195;&#8195;录</h3>
      </div>
      <el-form-item v-show="checkJson.errorStatus">
        <el-alert
          :title="checkJson.errorMsg"
          type="error"
          show-icon
          close-text="知道了"
          @close="handleClose"
        />
      </el-form-item>
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-form-item prop="imageCode">
        <span class="svg-container">
          <svg-icon icon-class="验证码" />
        </span>
        <el-input
          ref="imageCode"
          v-model="loginForm.imageCode"
          placeholder="验证码"
          name="imageCode"
          type="text"
          tabindex="3"
          @keyup.enter.native="handleLogin"
        />
        <span class="imageCode">
          <img :src="codeImg" class="floatRight" alt="验证码" title="点击换一张" @click="updateCode">
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>
      <el-divider class="el-form-item" />

      <p class="create-account-callout mt-3">
        <el-link><router-link :to="password_reset_href">忘记密码</router-link></el-link>
        <el-link class="floatRight"><router-link :to="signup_href">免费注册</router-link></el-link>
      </p>
    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
// import SocialSign from './components/SocialSignin'

export default {
  name: 'Login',
  // components: { SocialSign },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        imageCode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        imageCode: [{ required: true, message: '请输入验证码', trigger: 'change' }]
      },
      checkJson: {
        // 错误信息
        errorMsg: '',
        // 错误状态
        errorStatus: false
      },
      codeImg: '',
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      password_reset_href: '/password_reset',
      signup_href: '/signup'
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    },
    // 输入信息是否有变更监控，如果有变化则情况错误信息
    'loginForm': {
      handler(newVal, oldVal) {
        this.checkJson.errorMsg = ''
      },
      deep: true
    },
    // 错误信息
    'checkJson.errorMsg': {
      handler(newVal, oldVal) {
        if (newVal === undefined) {
          return
        }
        if (newVal.length === 0) {
          // 没有错误
          this.checkJson.errorStatus = false
        } else {
          // 有错误
          this.checkJson.errorStatus = true
        }
      }
    },
    // loading
    'loading': {
      handler(newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在验证登录，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
    // 获取验证码
    this.getImageCode()
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    // 获取验证码
    getImageCode() {
      this.codeImg = `${process.env.VUE_APP_BASE_API}/api/v1/imagecode?=${Math.random()}`
    },
    updateCode() {
      // 获取验证码
      this.getImageCode()
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/loginAction', this.loginForm)
            .then((data) => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            })
            .catch((data) => {
              // 获取验证码
              this.getImageCode()
              this.loginForm.imageCode = ''
              this.loading = false
              this.$nextTick(() => {
                this.checkJson.errorMsg = data.message
              })
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    handleClose() {
      this.checkJson.errorStatus = ''
    },
    handleSignUp() {
      alert(111)
    }
  }
}
</script>

<style lang="scss">

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>

.floatRight {
  float: right;
}

$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .imageCode {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
