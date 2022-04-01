<template>
  <div id="pass_rate_exam_number_city">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <autocomplete-area v-model="searchOption.area" outlined label/>
        <v-text-field label="驾校名称" hint="驾校名称" style="flex: 0 1 200px" dense
                      v-model="searchOption.name" clearable outlined hide-details
        ></v-text-field>
        <v-menu v-model="FilterMenuRegisterDate" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="报名日期范围" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption['user.registerDate']" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker first-day-of-week="1" range v-model="searchOption['user.registerDate']" clearable></v-date-picker>
        </v-menu>

        <v-btn depressed color="success" @click="search">
          <v-icon left>mdi-magnify</v-icon>
          搜索
        </v-btn>
        <v-btn depressed color="warning" @click="commitOption({sortBy:['subject23ExamPassRate'],sortDesc:['true']})">
          <v-icon left>mdi-rotate-3d-variant</v-icon>
          重置
        </v-btn>
      </div>
      <!--操作栏-->
      <v-row>
        <v-col cols="auto">
          <div class="batchOperationBtn">
            <!--            <v-btn depressed color="primary" small @click="openFormDialog()">-->
            <!--              <v-icon left small>mdi-plus</v-icon>-->
            <!--              新增-->
            <!--            </v-btn>-->
            <!--            <v-btn depressed color="warning" small :href="$addBaseURL(`/school/export`)" target="_blank">-->
            <!--              <v-icon left small>mdi-download</v-icon>-->
            <!--              全部导出-->
            <!--            </v-btn>-->
            <v-btn depressed color="error" small @click="deleteItem()" :disabled="!!1 || !$notEmpty(selected)" >
              <v-icon left small>mdi-delete</v-icon>
              批量删除
            </v-btn>
          </div>
        </v-col>
        <v-spacer/>
        <v-col cols="auto">
          <div class="groupOperationBtn">
            <v-btn depressed tile small @click="filterToolbar=!filterToolbar" title="搜索栏"
                   :class="filterToolbar?['v-btn--active']:[]">
              <v-icon small>mdi-magnify</v-icon>
            </v-btn>
            <v-btn depressed tile small @click="fetchData" title="刷新表格">
              <v-icon small>mdi-refresh</v-icon>
            </v-btn>
            <v-menu offset-y :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn depressed tile small v-bind="attrs" v-on="on" title="表头显示">
                  <v-icon small>mdi-table-headers-eye</v-icon>
                </v-btn>
              </template>
              <v-list dense class="groupOperationMenu">
                <v-checkbox :ripple="false" v-model="headersShow" :label="item.text" :value="index" multiple
                            v-for="(item, index) in headers" :key="index" hide-details dense></v-checkbox>
              </v-list>
            </v-menu>
          </div>
        </v-col>
      </v-row>

      <!--   数据列表   -->
      <v-data-table elevation="1" class="schoolTable dataTable" fixed-header multi-sort show-select
                    :server-items-length="count"
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:top>
          <!--   编辑、新增对话框   -->
          <v-dialog v-model="formDialog" max-width="500px" persistent>
            <v-card>
              <v-card-title>
                <span class="headline">{{ $notEmpty(form.id) ? `编辑数据（ID:${form.id}）` : '新增数据' }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form :disabled="loadingSubmit" v-model="formRules.formValid" :lazy-validation="true" ref="form" >
                    <v-row >
                      <!--驾校名称-->
                      <v-col cols="12">
                        <v-text-field v-model="form.name" label="驾校名称" :rules="formRules.nameRules" dense></v-text-field>
                      </v-col>
                      <!--序号-->
<!--                      <v-col cols="12">-->
<!--                        <v-text-field v-model="form.sort" label="序号" :rules="formRules.sortRules" dense></v-text-field>-->
<!--                      </v-col>-->
                      <!--编号-->
                      <v-col cols="12">
                        <v-text-field v-model="form.code" label="编号" :rules="formRules.codeRules" dense></v-text-field>
                      </v-col>
                      <!--地区-->
                      <v-col cols="12">
                        <autocomplete-area v-model="form.area" hideTotal label></autocomplete-area>
                      </v-col>

                      <!--状态-->
                      <!--                      <v-col cols="12">-->
                      <!--                        <v-switch color="primary" v-model="form.status" :label="`状态: ${form.status===1?'启用':'停用'}`"-->
                      <!--                                  :false-value="0" :true-value="1"/>-->
                      <!--                      </v-col>-->
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer/>
                <v-btn color="blue darken-1" text @click="closeFormDialog" :disabled="loadingSubmit">关闭</v-btn>
                <v-btn color="blue darken-1" text @click="submitForm " :loading="loadingSubmit">保存</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!--   删除对话框   -->
          <v-dialog persistent v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">{{ batchDelete ? '确认批量删除吗？' : '确认删除吗？' }}</v-card-title>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                <v-btn color="error" type="" text @click="deleteItemConfirm">确定</v-btn>
                <v-spacer/>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip color="success" v-if="item.status===1" small label>启用</v-chip>
          <v-chip color="error" v-else-if="item.status===0" small label>停用</v-chip>
        </template>
        <template v-slot:[`item.allowAction`]="{ item }">
          <v-btn small  class="mr-2" @click="$router.push({path:'/coach_manage',query:{option:{searchOption:{schoolId:item.id,'school.area':item.area}}}})" color="success">
            教练管理
          </v-btn>
          <v-btn small icon class="mr-2" @click="openFormDialog(item)" title="编辑" color="warning"
                 :loading="(readLoading && info.id===item.id)">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn small icon @click="deleteItem(item)" title="删除用户" color="error">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

    </v-sheet>
  </div>
</template>

<script>
import qs from "qs";
import {addSchoolApi, delSchoolApi, editSchoolApi, readSchoolApi, schoolListApi} from "@/api/modules";
import {TpSqlBuilder} from "@/utils/tp-sql";
import AutocompleteArea from "@/components/AutocompleteArea";

export default {
  name: 'pass_rate_exam_number_city',
  components: {AutocompleteArea},
  data() {
    return {
      type: 0,
      title: '驾校管理',
      info: {},
      headers: [
        {text: '序号', value: 'id', initHide: false},
        // {text: '序号', value: 'sort', initHide: false},
        {text: '编号', value: 'code', initHide: false},
        {text: '驾校名称', value: 'name', initHide: false},
        {text: '地区', value: 'area', initHide: true},//initHide
        {text: '状态', value: 'status', initHide: true},

        {text: '科二考试人/次数', value: 'subject2ExamCount', initHide: true},//initHide
        {text: '科二考试及格率', value: 'subject2ExamPassRate', initHide: true},//initHide
        {text: '科三考试人/次数', value: 'subject3ExamCount', initHide: true},//initHide
        {text: '科三考试及格率', value: 'subject3ExamPassRate', initHide: true},//initHide
        {text: '考试总人/次数', value: 'subject23ExamCount', initHide: false},
        {text: '考试总及格率', value: 'subject23ExamPassRate', initHide: false},

        {text: '创建时间', value: 'createTime', initHide: true},
        {text: '创建者', value: 'createUser.username', initHide: true},
        {text: '更新时间', value: 'updateTime', initHide: true},
        {text: '更新者', value: 'updateUser.username', initHide: true},
        // {text: '操作', value: 'allowAction', sortable: false, align: 'center'},
      ],
      FilterMenuCreateTime: false,
      FilterMenuUpdateTime: false,
      FilterMenuRegisterDate: false,
      dialogDelete: false,
      batchDelete: false,
      filterToolbar: true,
      loading: false,
      loadingSubmit: false,
      readLoading: false,
      count: 0,
      list: [],
      selected: [],
      headersShow: [],
      formDialog: false,
      form: {
        id: null,
        name: '',
        sort: '',
        code: '',
        area: '',
        status: 1,
      },
      tableOptions: {},
      searchOption: {
        name: '',
        code: '',
        area: '',
        status: null,
        createTime: [],
        updateTime: [],
        'user.registerDate': [],
        'createUser.username': ''
      },
      searchSqlType: {
        equal: ['status','area',],/* 精确查询 */
        strLike: ['name', 'code', 'createUser.username'],/* 模糊查询 */
        dateBetween: ['createTime', 'updateTime','user.registerDate'],/* 日期范围查询 */
      },

      formRules: {
        autoValid: true,
        formValid: true,
        codeRules: [v => this.formRules.autoValid || !!v || '请输入编号'],
        // sortRules: [v => this.formRules.autoValid || !!v || '请选择序号'],
        nameRules: [v => this.formRules.autoValid || !!v || '请输入驾校名'],
      },

    }
  },
  beforeRouteEnter(to,from,next){
    if(!to.query.option){next({...to,query: {option: {sortBy:['subject23ExamPassRate'],sortDesc:['true']}}})
    }else{
      next()
    }
  },
  created() {
    let headersShow = []
    for (let k in this.headers) {
      if (this.headers[k]['initHide'] !== true) headersShow.push(parseInt(k))
    }
    this.headersShow = headersShow;
    this.initOptions();
  },
  mounted() {
    this.search();
  },
  computed: {
    headersCurrent() {
      return [...this.headersShow].sort((a, b) => a - b).map(item => this.headers[item])
    },
    /* 与路由单向同步，只读 */
    optionRouteROM() {
      return qs.parse(this.$route.query.option);
    },
    userSetting(){
      return this.$storeGet.user.setting
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.initOptions();
        this.$nextTick(() =>{this.search()})
      },
      immediate: false,
      deep: true
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  methods: {
    /* 初始化数据表选项 */
    initOptions() {
      // 初始化筛选输入框
      let searchOption = {}
      let option = {searchOption, ...this.optionRouteROM};
      for (let k in this.searchOption) {
        this.searchOption[k] = (option.searchOption && this.$notEmpty(option.searchOption[k])) ? option.searchOption[k] : this.$options.data().searchOption[k]
      }

      // 初始化排序
      this.tableOptions.page = this.$notEmpty(option.page) ? parseInt(option.page) : 1
      this.tableOptions.itemsPerPage = this.$notEmpty(option.itemsPerPage) ? parseInt(option.itemsPerPage) : 20
      this.tableOptions.sortBy = this.$notEmpty(option.sortBy) ? option.sortBy : []
      this.tableOptions.sortDesc = this.$notEmpty(option.sortDesc) ? option.sortDesc.map(item => item === 'true') : []

    },
    /* 提交到路由 */
    commitOption(option) {
      let queryOption = this.$notEmpty(this.$route.query.option) ? this.$route.query.option : '';
      let qsOption = qs.stringify(option, {strictNullHandling: true, skipNulls: true});
      if (queryOption !== qsOption) {
        this.$router.push({query: this.$notEmpty(qsOption) ? {option: qsOption} : {}});
      } else if (!this.loading) {
        this.fetchData();
      }
    },
    /* 表格选项变化【页数、排序】 */
    optionsChange(v) {
      this.commitOption({
        ...this.optionRouteROM,
        page: v.page,
        itemsPerPage: v.itemsPerPage,
        sortBy: v.sortBy,
        sortDesc: v.sortDesc
      });
    },
    /* 开始搜索 */
    search() {
      let searchOption = {...this.searchOption}
      for (let k in searchOption) {
        if (typeof (searchOption[k]) == 'string') searchOption[k] = searchOption[k].trim();
        if (!this.$notEmpty(searchOption[k])) searchOption[k] = null;
      }
      let option = {...this.optionRouteROM, searchOption};
      this.commitOption(option);
    },
    /* 获取数据 */
    async fetchData() {
      /* Vuetify => tp6 */
      let option = {...this.optionRouteROM}

      // 处理搜索筛选
      let searchOption = this.$notEmpty(this.optionRouteROM.searchOption) ? this.optionRouteROM.searchOption : {};
      let searchList = new TpSqlBuilder(this.searchSqlType, searchOption)

      // 处理排序
      let sortList = [];
      if (this.$notEmpty(option.sortBy)) {
        option.sortBy.forEach((item, index) => {
          let obj = {};
          obj[item] = option.sortDesc[index] === 'true' ? 'desc' : 'asc'
          sortList.push(obj)
        })
      }

      let data = {
        page: option.page,
        limit: option.itemsPerPage,
        searchList,
        sortList,
        searchType:'subject23Exam'
      }
      data.searchList && (data.searchList = data.searchList.filter(item=>!(item[0] === 'area' && item[2] === '全国' )))

      this.loading = true
      let res = await schoolListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        let list = [...res.list]
        this.count = res.count
        this.list = list
        this.selected = []
      }
    },
    /* 获取指定ID数据 */
    async readData(item) {
      if (this.readLoading) return;
      let data = {id: item.id}
      this.info = item
      this.readLoading = true
      let res = await readSchoolApi(data).catch(err => err)
      this.readLoading = false
      this.info = res.info
      return res;
    },
    /* ******************删除数据****************** */
    deleteItem(item = null) {
      this.batchDelete = !this.$notEmpty(item)
      if (!this.batchDelete) {
        this.editedIndex = item['id']
      }
      this.dialogDelete = true
    },
    closeDelete() {
      let batch = this.batchDelete
      this.dialogDelete = false
      if (!batch) {
        this.$nextTick(() => {
          this.editedIndex = -1
        })
      }
    },
    async deleteItemConfirm() {
      let batch = this.batchDelete
      this.loading = true;
      let data = batch ? {
        ids: this.selected.map(item => item.id),
      } : {
        id: this.editedIndex
      }
      let res = await delSchoolApi(data).then(res => res).catch(err => err).finally(() => {
        this.fetchData();
      })
      if (this.$notEmpty(res['msg']) && this.$notEmpty(res['status']) && res['status'] === 200) {
        await this.$store.dispatch('setMsg', {show: true, color: 'green', timeout: 5000, text: res['msg']})
        this.selected = []
      } else if (this.$notEmpty(res['msg'])) {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: res['msg']})
      } else {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: '发生未知错误'})
      }
      this.closeDelete()
    },
    /* ******************删除数据****************** */
    /* ******************新增、修改数据****************** */
    async openFormDialog(item) {
      if (this.$notEmpty(item) && this.$notEmpty(item['id'])) {
        let res = await this.readData(item)
        this.$objectEvaluate(this.form, res.info)
      }
      this.formDialog = true
    },
    closeFormDialog() {
      this.formDialog = false
      this.$nextTick(() => {
        this.form = this.$options.data().form
      })
    },
    async submitForm() {
      this.formRules.autoValid = false
      if (!this.$refs.form.validate()) return this.formRules.autoValid = true

      let data = {...this.form}
      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editSchoolApi : addSchoolApi;
      let res = await submitFun(data).then(res => res).catch(err => err).finally(() => {
        this.loadingSubmit = false;
        this.fetchData();
      })
      if (this.$notEmpty(res['msg']) && this.$notEmpty(res['status']) && (res['status'] === 200 || res['status'] === 201)) {
        await this.$store.dispatch('setMsg', {show: true, color: 'green', timeout: 5000, text: res['msg']})
        this.selected = []
      } else if (this.$notEmpty(res['msg'])) {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: res['msg']})
      } else {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: '发生未知错误'})
      }
      this.closeFormDialog()
      this.formRules.autoValid = true
    },
    /* ******************新增、修改数据****************** */

  }
}
</script>

<style lang="scss">
#pass_rate_exam_number_city {
  height: 100%;

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .schoolTable {
      flex: 0 1 auto;
      overflow: auto;
    }
  }

  .list-move {
    opacity: 0.1;
    transition: all 0.1s;
  }

  .list-enter-active, .list-leave-active {
    transition: all .15s;
  }

  .list-enter, .list-leave-to {
    opacity: 0;
    transform: translateY(-16px);
  }

  .menuDown {
    transition: 0.2s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  }

  .menuDownR {
    transform: rotate(-90deg);
    transition: 0.2s cubic-bezier(0.25, 0.8, 0.5, 1), visibility 0s;
  }
}
</style>
