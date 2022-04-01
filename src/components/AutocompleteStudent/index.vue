<template>
  <v-autocomplete
    :label="`学员姓名${noExam===0?'(非库存)':( noExam===1 ? '(库存)':'')}`"

    v-model="select"
    :loading="loading"
    :items="items"
    :rules="rules"
    :search-input.sync="search"
    item-text="realname"
    item-value="id"
    return-object
    @change="handleChange"
    clearable
    :disabled="disabled"

    hide-no-data
    class="AutocompleteStudent"
    :dense="dense"
    :outlined="outlined"
    hide-details
  ></v-autocomplete>
</template>

<script>


import {readUserApi, studentListApi} from "@/api/modules";
import {TpSqlBuilder} from "@/utils/tp-sql";

export default {
  name: "AutocompleteStudent",
  props: {
    value: {},
    schoolId: {},
    coachId: {},
    rules: {},
    disabled: {
      default: false
    },
    noExam: {
      default:null
    },
    statusSubject: {
      default:null
    },
    schoolArea: {
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
        //外面传了ID且不是目前所选的
        if (id) {
          if(this.select && id === this.select.id){
            this.search = this.select.realname
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
    schoolArea: {
      handler() {
        this.handleChange(null)
      },
    },
    //外面传来的
    schoolId: {
      handler() {
        this.handleChange(null)
      },
    },
    //外面传来的
    coachId: {
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
      let res = await readUserApi(data).catch(err => err)
      this.loading = false
      this.select = {...res.info}
      this.search = this.select.realname
      this.handleChange(this.select)
    },
    async querySelections (v) {
      this.loading = true

      // 处理搜索筛选
      let searchOption = {
        realname:v,
        status:1,
        noExam:this.noExam,
        coachId:this.coachId,
        'school.id':this.schoolId,
        'school.area':this.schoolArea,
      }
      let searchSqlType= {
        equal: ['status','school.area','school.id','coachId','noExam'],/* 精确查询 */
          strLike: ['realname'],/* 模糊查询 */
      }
      let searchList = new TpSqlBuilder(searchSqlType, searchOption)
      this.statusSubject && searchList.push(['statusSubject',...this.statusSubject])
      let data = {searchList}
      data.searchList = data.searchList.filter(item=>!(item[0] === 'school.area' && item[2] === '全国' ))
      let res = await studentListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        this.items = [...res.list]
      }
    },
  }
}
</script>

<style lang="scss">
.AutocompleteStudent {
  flex: 0 1 200px
}
</style>
