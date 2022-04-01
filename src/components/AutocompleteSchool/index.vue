<template>
  <v-autocomplete
    label="驾校名"

    v-model="select"
    :loading="loading"
    :items="items"
    :search-input.sync="search"
    :rules="rules"
    item-text="name"
    item-value="id"
    return-object
    @change="handleChange"
    clearable
    :disabled="disabled"

    hide-no-data
    class="AutocompleteSchool"
    :dense="dense"
    :outlined="outlined"
    hide-details
  ></v-autocomplete>
</template>

<script>


import {readSchoolApi, schoolListApi} from "@/api/modules";
import {TpSqlBuilder} from "@/utils/tp-sql";

export default {
  name: "AutocompleteSchool",
  props: {
    value: {},
    rules: {},
    disabled: {
      default: false
    },
    area: {
      type: String,
      default: ""
    },
    outlined: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      loading: false,
      items: [],
      search: null,
      select: null,
    };
  },
  computed: {

  },
  mounted() {

  },
  watch: {
    //外面传来的
    value: {
      handler(val) {
        let id = parseInt(val)
        //外面传了ID
        if (id) {
          if(this.select && id === this.select.id){
            this.search = this.select.name
          }else{
            //不是目前所选的
            this.readData(id)
          }
        } else {
          this.select = null
          this.search = ''
        }
      },
      immediate: true
    },
    //外面传来的
    area: {
      handler() {
        this.handleChange(null)
      },
    },

    search (v) {
      this.querySelections(v)
    },
  },
  methods: {
    handleChange(v) {
      this.$emit("input", v?v.id:null)
      this.$emit("change", v?v.id:null)
      this.$emit("getItem", v)
    },
    async readData(id) {
      let data = {id}
      this.loading = true
      let res = await readSchoolApi(data).catch(err => err)
      this.loading = false
      this.select = {...res.info}
      this.search = this.select.name
    },
    async querySelections (v) {
      this.loading = true

      // 处理搜索筛选
      let searchOption = {
        name:v,
        area:this.area,
        status:1,
      }
      let searchSqlType = {
        equal: ['status','area',],/* 精确查询 */
        strLike: ['name'],/* 模糊查询 */
      }
      let searchList = new TpSqlBuilder(searchSqlType, searchOption)
      let data = {searchList}
      data.searchList = data.searchList.filter(item=>!(item[0] === 'area' && item[2] === '全国' ))
      let res = await schoolListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        this.items = [...res.list]
      }
    },
  }
}
</script>

<style lang="scss">
.AutocompleteSchool {
  flex: 0 1 200px
}
</style>
