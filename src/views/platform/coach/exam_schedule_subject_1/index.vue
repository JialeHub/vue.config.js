<template>
  <div id="exam_schedule_subject_1_coach">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-menu v-model="FilterMenuDate" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="考试日期" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption.date" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker first-day-of-week="1" range v-model="searchOption.date" clearable></v-date-picker>
        </v-menu>

        <autocomplete-area v-model="searchOption['school.area']" outlined label/>
        <autocomplete-school v-model="searchOption['school.id']" :area="searchOption['school.area']" outlined dense
                             @getItem="v=>{selectedSchool=v}"/>
        <autocomplete-coach v-model="searchOption['coach.id']" :schoolArea="searchOption['school.area']"
                            :schoolId="searchOption['school.id']" outlined dense @getItem="v=>{selectedCoach=v}"/>
        <autocomplete-student v-model="searchOption.userId" :schoolArea="searchOption['school.area']"
                              :schoolId="searchOption['school.id']" :coachId="searchOption['coach.id']" outlined dense
                              @getItem="v=>{selectedStudent=v}" @change="search()"/>


        <v-btn depressed color="success" @click="search">
          <v-icon left>mdi-magnify</v-icon>
          搜索
        </v-btn>
        <v-btn depressed color="warning" @click="commitOption({sortBy:['date'],sortDesc:['true']})">
          <v-icon left>mdi-rotate-3d-variant</v-icon>
          重置
        </v-btn>
      </div>

      <!--操作栏-->
      <v-row>
        <v-col cols="auto">
          <div class="batchOperationBtn">
            <v-btn depressed color="primary" small @click="openFormDialog()">
              <v-icon left small>mdi-plus</v-icon>
              新增
            </v-btn>
            <!--            <v-btn depressed color="warning" small :href="$addBaseURL(`/subject1Exam/export`)" target="_blank">-->
            <!--              <v-icon left small>mdi-download</v-icon>-->
            <!--              全部导出-->
            <!--            </v-btn>-->
            <v-btn depressed color="error" small @click="deleteItem()" :disabled="!$notEmpty(selected)">
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
      <v-data-table elevation="1" class="subject1ExamTable dataTable" fixed-header multi-sort show-select
                    :server-items-length="count"  show-group-by
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:top>
          <!--   编辑、新增对话框   -->
          <v-dialog persistent v-model="formDialog" max-width="600px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ $notEmpty(form.id) ? '编辑科一考试安排' : '新增科一考试安排' }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form :disabled="loadingSubmit"  v-model="formRules.formValid" :lazy-validation="true" ref="form">

                    <!--所属教练-->
                    <v-row>
                      <v-col cols="6">
                        <autocomplete-area v-model="form['school.area']" outlined label/>
                      </v-col>
                      <v-spacer/>
                      <v-col cols="6">
                        <autocomplete-school v-model="form['school.id']" :area="form['school.area']" outlined dense/>
                      </v-col>
                    </v-row>
                    <v-row >
                      <v-col cols="6">
                        <autocomplete-coach v-model="form['coach.id']" :schoolArea="form['school.area']" :schoolId="form['school.id']" outlined dense/>
                      </v-col><v-spacer/>
                      <v-col cols="6">
                        <autocomplete-student v-model="form.userId" :schoolArea="form['school.area']" :schoolId="form['school.id']" :coachId="form['coach.id']" outlined dense :rules="formRules.userIdRules"/>
                      </v-col>
                    </v-row>
                    <!--考试日期-->
                    <v-row>
                      <v-col cols="12">
                        <v-menu v-model="FilterMenuDateForm" :close-on-content-click="false"
                                transition="scale-transition" offset-y min-width="auto">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="form.date" label="考试日期" hide-details v-bind="attrs" v-on="on" :rules="formRules.dateRules"
                                          clearable/>
                          </template>
                          <v-date-picker first-day-of-week="1" v-model="form.date" clearable></v-date-picker>
                        </v-menu>
                      </v-col>
                    </v-row>

                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeFormDialog" :disabled="loadingSubmit"> 关闭</v-btn>
                <v-btn color="blue darken-1" text @click="submitForm " :loading="loadingSubmit"> 保存</v-btn>
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
        <template v-slot:[`item.allowAction`]="{ item }">
          <v-btn small icon class="mr-2" @click="openFormDialog(item)" title="编辑" color="warning"
                 :loading="(readLoading && info.id===item.id)">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn small icon @click="deleteItem(item)" title="删除" color="error">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>


    </v-sheet>
  </div>
</template>

<script>

import {
  addSubject1ExamApi,
  delSubject1ExamApi,
  editSubject1ExamApi,
  readSubject1ExamApi,
  subject1ExamListApi
} from "@/api/modules";
import qs from "qs";
import {TpSqlBuilder} from "@/utils/tp-sql";
import AutocompleteArea from "@/components/AutocompleteArea";
import AutocompleteSchool from "@/components/AutocompleteSchool";
import AutocompleteCoach from "@/components/AutocompleteCoach";
import AutocompleteStudent from "@/components/AutocompleteStudent";

export default {
  name: 'exam_schedule_subject_1_coach',
  components: {AutocompleteStudent, AutocompleteCoach, AutocompleteSchool, AutocompleteArea},
  data() {
    return {
      info: {},
      listTree: [],
      listTreeList: [],
      listTreeSearch: '',
      listTreeSearchSearch: '',
      headers: [
        {text: 'ID', value: 'id', initHide: true,groupable: false},
        {text: '考试日期', value: 'date', initHide: false,},
        {text: '学员ID', value: 'user_id', initHide: true,groupable: false},
        {text: '学员账号', value: 'user_username', initHide: true,groupable: false},
        {text: '学员姓名', value: 'user_realname', initHide: false,groupable: false},
        {text: '所属教练', value: 'coach_name', initHide: true,groupable: false},//initHide
        {text: '驾校地区', value: 'school_area', initHide: true,groupable: false},//initHide
        {text: '所属驾校', value: 'school_name', initHide: true,groupable: false},//initHide
        {text: '创建时间', value: 'create_time', initHide: true,groupable: false},
        {text: '更新时间', value: 'update_time', initHide: true,groupable: false},
        {text: '操作', value: 'allowAction', sortable: false, align: 'center',groupable: false},
      ],
      FilterMenuCreateTime: false,
      FilterMenuDate: false,
      FilterMenuDateForm: false,
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
      loadingTree: false,
      form: {
        id: null,
        userId: null,
        'coach.id': null,
        'school.id': null,
        'school.area': null,
        date: '',
        status: 1,
      },
      tableOptions: {},
      searchOption: {
        userId: null,
        'user.realname': '',
        createTime: [],
        date: [],
        'coach.id': null,
        'school.id': null,
        'school.area': ''
      },
      searchSqlType: {
        equal: ['status', 'userId', 'coach.id', 'school.area', 'school.id'],/* 精确查询 */
        strLike: ['user.realname'],/* 模糊查询 */
        dateBetween: ['createTime', 'date'],/* 日期范围查询 */
      },

      selectedSchool: null,
      selectedCoach: null,
      selectedStudent: null,

      formRules: {
        autoValid: true,
        formValid: true,
        userIdRules: [v => this.formRules.autoValid || !!v || '请选择学员'],
        dateRules: [v => this.formRules.autoValid || !!v || '请选择日期'],
      },
    }
  },
  beforeRouteEnter(to,from,next){
    if(!to.query.option){next({...to,query: {option: {sortBy:['date'],sortDesc:['true']}}})
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
    this.search()
  },
  computed: {
    headersCurrent() {
      return [...this.headersShow].sort((a, b) => a - b).map(item => this.headers[item])
    },
    /* 与路由单向同步，只读 */
    optionRouteROM() {
      return qs.parse(this.$route.query.option);
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.initOptions();
        this.$nextTick(() => {
          this.search()
        })
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
      let option = {searchOption: {}, ...this.optionRouteROM};
      // 初始化树模式
      if (this.$notEmpty(option.searchOption.treeMode)) option.searchOption.treeMode = option.searchOption.treeMode === 'true'
      // 初始化筛选输入框
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
        sortList
      }
      data.searchList = data.searchList.filter(item => !(item[0] === 'school.area' && item[2] === '全国'))

      this.loading = true
      let res = await subject1ExamListApi(data).catch(err => err)
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
      let res = await readSubject1ExamApi(data).catch(err => err)
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
      let res = await delSubject1ExamApi(data).then(res => res).catch(err => err).finally(() => {
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
        res.info.user
        && res.info.user.coach
        && (this.form['coach.id'] = res.info.user.coach.id)
        && (this.form['school.id'] = res.info.user.coach.school.id)
        && (this.form['school.area'] = res.info.user.coach.school.area)
      } else {
        this.form['school.area'] = this.searchOption['school.area']
        this.form['school.id'] = this.searchOption['school.id']
        this.form['coach.id'] = this.searchOption['coach.id']
        this.form['userId'] = this.searchOption['userId']
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
      delete data['school.area']
      delete data['school.id']
      delete data['coach.id']

      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editSubject1ExamApi : addSubject1ExamApi;
      let res = await submitFun(data).then(res => res).catch(err => err).finally(() => {
        this.loadingSubmit = false;
        this.fetchData();
      })
      if (this.$notEmpty(res['msg']) && this.$notEmpty(res['status']) && (res['status'] === 200 || res['status'] === 201)) {
        await this.$store.dispatch('setMsg', {show: true, color: 'green', timeout: 5000, text: res['msg']})
        this.selected = []
        this.closeFormDialog()
      } else if (this.$notEmpty(res['msg'])) {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: res['msg']})
      } else {
        await this.$store.dispatch('setMsg', {show: true, color: 'deep-orange', timeout: 5000, text: '发生未知错误'})
      }

      this.formRules.autoValid = true
    },
    /* ******************新增、修改数据****************** */


  }
}
</script>

<style lang="scss">
#exam_schedule_subject_1_coach {
  height: 100%;

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .subject1ExamTable {
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
