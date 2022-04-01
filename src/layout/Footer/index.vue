<template>
  <div id="appFooter">
    {{menuTitle}}
  </div>
</template>

<script>
  export default {
    name: "appFooter",
    data() {
      return {}
    },
    computed: {
      menuTitle() {
        return this.$storeGet.setting.menuTitle
      },
    }
  }
</script>

<style lang="scss">

</style>
