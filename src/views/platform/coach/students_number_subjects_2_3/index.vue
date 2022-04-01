<template>
  <div id="students_number_subjects_2_3_coach">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">

        <v-text-field label="学员姓名" hint="学员姓名" style="flex: 0 1 200px" outlined dense
                      v-model="searchOption.realname" clearable hide-details
        ></v-text-field>

        <v-menu v-model="FilterMenuSearchDate" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="科二科三在学时间段" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption.searchDate" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker first-day-of-week="1" range v-model="searchOption.searchDate" clearable></v-date-picker>
        </v-menu>

        <autocomplete-area v-model="searchOption['school.area']" outlined label/>
        <autocomplete-school v-model="searchOption['school.id']" :area="searchOption['school.area']" outlined dense @getItem="v=>{selectedSchool=v}"/>
        <autocomplete-coach v-model="searchOption.coachId" :schoolArea="searchOption['school.area']" :schoolId="searchOption['school.id']" outlined dense @getItem="v=>{selectedCoach=v}"  @change="search()"/>

        <v-btn depressed color="success" @click="search" >
          <v-icon left>mdi-magnify</v-icon>
          搜索
        </v-btn>
        <v-btn depressed color="warning" @click="commitOption({})">
          <v-icon left>mdi-rotate-3d-variant</v-icon>
          重置
        </v-btn>
      </div>

      <!--操作栏-->
      <v-row  >
        <v-col cols="auto">
          <div class="batchOperationBtn">
            <!--            <v-btn depressed color="warning" small :href="$addBaseURL(`/user/export`)" target="_blank">-->
            <!--              <v-icon left small>mdi-download</v-icon>-->
            <!--              全部导出-->
            <!--            </v-btn>-->
            <v-btn depressed color="error" small :disabled="!!1 || !$notEmpty(selected)">
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
      <v-data-table elevation="1" class="userTable dataTable" fixed-header multi-sort show-select
                    :server-items-length="count"
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:top>
        </template>
        <template v-slot:[`item.avatar`]="{ item }">
          <v-avatar size="36" v-if="$addBaseURL(item['avatar'])">
            <img :src="$addBaseURL(item['avatar'])" alt="无">
          </v-avatar>
          <div class="" v-else>无</div>
        </template>
      </v-data-table>


    </v-sheet>
  </div>
</template>

<script>

import {
  editUserApi,
  readUserApi,
  studentListApi
} from "@/api/modules";
import qs from "qs";
import {TpSqlBuilder} from "@/utils/tp-sql";
import AutocompleteArea from "@/components/AutocompleteArea";
import AutocompleteSchool from "@/components/AutocompleteSchool";
import AutocompleteCoach from "@/components/AutocompleteCoach";

export default {
  name: 'students_number_subjects_2_3_coach',
  components: {AutocompleteCoach, AutocompleteSchool, AutocompleteArea},
  data() {
    return {
      info: {},
      listTree: [],
      listTreeList: [],
      listTreeSearch:'',
      listTreeSearchSearch:'',
      headers: [
        {text: 'ID', value: 'id',initHide:true},
        {text: '账号', value: 'username',initHide:true},
        // {text: '头像', value: 'avatar',initHide:false},
        // {text: '学员昵称', value: 'nickname',initHide:false},
        {text: '姓名', value: 'realname',initHide:false},

        {text: '科二已学学时', value: 'subject2AppointmentCount',initHide:false},
        {text: '科二考试次数', value: 'subject2ExamCount',initHide:false},
        {text: '科三已学学时', value: 'subject3AppointmentCount',initHide:false},
        {text: '科三考试次数', value: 'subject3ExamCount',initHide:false},

        {text: '科二初学日期', value: 'status_subject2_date',initHide:true},//initHide
        {text: '科二通过日期', value: 'status_subject3_date',initHide:true},//initHide
        {text: '科三通过日期', value: 'status_subject4_date',initHide:true},//initHide
        // {text: '生日', value: 'birthday',initHide:true},
        // {text: '性别', value: 'gender',initHide:false},
        {text: '手机', value: 'phone',initHide:true},
        {text: '身份证', value: 'id_number',initHide:true},
        // {text: '地址', value: 'areaCode',initHide:true},
        // {text: '链接', value: 'url',initHide:true},
        // {text: '介绍', value: 'profile',initHide:true},
        {text: '报名日期', value: 'register_date',initHide:true},
        {text: '驾校地区', value: 'school_area',initHide:true},//initHide
        {text: '所属驾校', value: 'school_name',initHide:true},//initHide
        {text: '所属教练', value: 'coach_name',initHide:false},
        {text: '邮箱', value: 'email',initHide:true},
        // {text: '状态', value: 'status',initHide:false},
        // {text: '库存学员', value: 'no_exam',initHide:false},
        {text: '创建时间', value: 'create_time',initHide:true},
        // {text: '创建者', value: 'createUser.username'},
        // {text: '更新时间', value: 'update_time', initHide: true},
        // {text: '更新者', value: 'updateUser.username', initHide: true},
        // {text: '操作', value: 'allowAction', sortable: false, align: 'center'},
      ],
      FilterMenuCreateTime: false,
      FilterMenuRegisterDate: false,
      FilterMenuSearchDate: false,
      FilterMenuRegisterDateForm: false,
      batchDelete: false,
      filterToolbar: true,
      loading: false,
      loadingSubmit: false,
      readLoading: false,
      count: 0,
      list: [],
      selected: [],
      headersShow: [],
      loadingTree: false,
      form: {
        id: null,
        'school.id': null,
        'school.area': null,
        coachId: null,
        idNumber: null,
        username: '',
        email: '',
        phone: '',
        noExam: 0,
        nickname: '',
        realname: '',
        birthday: null,
        gender: null,
        url: '',
        areaCode: '',
        avatar: '',
        profile: '',
        registerDate: '',
        status: 1,
      },
      tableOptions: {},
      searchOption: {
        username: '',
        email: '',
        phone: '',
        nickname: '',
        realname: '',
        createTime: [],
        registerDate: [],
        searchDate: [],
        coachId:null,
        'createUser.username': '',
        'school.id': null,
        'school.area': '',
      },
      searchSqlType: {
        equal: ['status','noExam','coachId','school.area','school.id'],/* 精确查询 */
        strLike: ['username', 'email', 'phone', 'nickname', 'realname', 'createUser.username'],/* 模糊查询 */
        dateBetween: ['createTime','registerDate','searchDate'],/* 日期范围查询 */
      },
      selectedSchool:null,
      selectedCoach:null,
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
        this.$nextTick(() =>{this.search()})
      },
      immediate: false,
      deep: true
    },
  },
  methods: {
    changeNoExam(item,v){
      editUserApi({id:item.id,noExam:v}).then(res=>res).catch(err => err)
    },
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
      let qsOption = qs.stringify(option, {strictNullHandling: true,skipNulls:true});
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
        searchType:'studentsNumberSubject23'
      }
      data.searchList = data.searchList.filter(item=>!(item[0] === 'school.area' && item[2] === '全国' ))

      this.loading = true
      let res = await studentListApi(data).catch(err => err)
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
      if (this.readLoading) return ;
      let data = {id: item.id}
      this.info = item
      this.readLoading = true
      let res = await readUserApi(data).catch(err => err)
      this.readLoading = false
      this.info = res.info
      return res;
    },
  }
}
</script>

<style lang="scss">
#students_number_subjects_2_3_coach {
  height: 100%;

  > .v-sheet {
    height: 100%;
    display: flex;
    flex-direction: column;

    .filterToolbar, .row {
      flex: 0 0 auto;
    }

    .userTable {
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
