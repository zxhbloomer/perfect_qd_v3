<template>
  <div v-cloak id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style >
  /* add by zxh 解决闪烁 */
  [v-cloak] {
    display:none !important;
  }
</style>
