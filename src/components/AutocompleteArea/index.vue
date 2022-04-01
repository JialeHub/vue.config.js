<template>
  <v-autocomplete
    :label="label?'地区':null"
    v-model="val"
    @change="handleChange"
    :items="items"
    class="autocompleteArea"
    dense
    :disabled="disabled"
    :outlined="outlined"
    :filled="filled"
    :rounded="rounded"
    :clearable="clearable&&localArea!==val"
    clear-icon="mdi-backup-restore"
    @click:clear="handleClear"
    hide-details
    auto-select-first

  ></v-autocomplete>
</template>

<script>

import {citysStr} from "@/utils/city";

export default {
  name: "AutocompleteArea",
  props: {
    disabled:{
      default: false
    },
    value: {
      type: String,
      default: ""
    },
    hideTotal: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    outlined: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    },
    filled: {
      type: Boolean,
      default: false
    },
    label: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      val: null,
    };
  },
  computed: {
    userSetting() {
      return this.$storeGet.user.setting
    },
    items() {
      return this.hideTotal ? [...citysStr].splice(1) : citysStr
    },
    localArea() {
      return (this.userSetting && citysStr.includes(this.userSetting.citySelect))
        ? this.userSetting.citySelect
        : citysStr[0];
    }
  },
  mounted() {

  },
  watch: {
    //外面传来的
    value: {
      handler(v) {
        if (this.$notEmpty(v)) {
          this.val = v
        } else {
          this.val = this.localArea
          this.$emit("input", this.val)
        }
      },
      immediate: true
    }
  },
  methods: {
    handleChange(v) {
      this.$emit("input", v)
      this.$emit("change", v)
    },
    handleClear(){
      this.val = this.localArea
    }
  }
}
</script>

<style lang="scss">
.autocompleteArea {
  flex: 0 1 200px
}
</style>
