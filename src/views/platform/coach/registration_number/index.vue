<template>
  <div id="registration_number_coach">
    <v-sheet elevation="0" color="rgba(255,255,255,0)">
      <!--筛选栏-->
      <div class="filterToolbar" v-show="filterToolbar">
        <v-text-field label="姓名" hint="姓名" style="flex: 0 1 200px" outlined dense
                      v-model="searchOption.realname" clearable hide-details
        ></v-text-field>
<!--        <v-text-field label="邮箱" hint="邮箱" style="flex: 0 1 200px" outlined dense-->
<!--                      v-model="searchOption.email" clearable hide-details-->
<!--        ></v-text-field>-->
<!--        <v-text-field label="手机" hint="手机" style="flex: 0 1 200px" outlined dense-->
<!--                      v-model="searchOption.phone" clearable hide-details-->
<!--        ></v-text-field>-->

        <v-menu v-model="FilterMenuRegisterDate" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field label="报名日期" style="flex: 0 1 290px" outlined dense readonly hide-details
                          v-model="searchOption.registerDate" v-bind="attrs" v-on="on" clearable
            />
          </template>
          <v-date-picker first-day-of-week="1" range v-model="searchOption.registerDate" clearable></v-date-picker>
        </v-menu>

        <autocomplete-area v-model="searchOption['school.area']" outlined label/>
        <autocomplete-school v-model="searchOption['school.id']" :area="searchOption['school.area']" outlined dense @getItem="v=>{selectedSchool=v}"/>
        <autocomplete-coach v-model="searchOption.coachId" :schoolArea="searchOption['school.area']" :schoolId="searchOption['school.id']" outlined dense @getItem="v=>{selectedCoach=v}"  @change="search()"/>

        <v-select style="flex: 0 1 200px" outlined dense :menu-props="{ offsetY: true }"
                  :items="[{text:'否',value:'0'},{text:'是',value:'1'}]" v-model="searchOption.noExam" clearable
                  label="库存状态" hint="库存状态" hide-details
        ></v-select>

<!--        <v-select style="flex: 0 1 200px" outlined dense :menu-props="{ offsetY: true }"-->
<!--                  :items="[{text:'停用',value:'0'},{text:'启用',value:'1'}]" v-model="searchOption.noExam" clearable-->
<!--                  label="选择状态" hint="状态" hide-details-->
<!--        ></v-select>-->

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
            <v-btn depressed color="primary" small @click="openFormDialog()">
              <v-icon left small>mdi-plus</v-icon>
              新增
            </v-btn>
<!--            <v-btn depressed color="warning" small :href="$addBaseURL(`/user/export`)" target="_blank">-->
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
      <v-data-table elevation="1" class="userTable dataTable" fixed-header multi-sort show-select
                    :server-items-length="count"
                    :custom-sort="(items=>items)" v-model="selected" :options.sync="tableOptions"
                    :loading="loading" :headers="headersCurrent" :items="list"
                    @update:options="optionsChange">
        <template v-slot:top>
          <!--   编辑、新增对话框   -->
          <v-dialog persistent v-model="formDialog" max-width="600px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ $notEmpty(form.id) ? '编辑学员' : '新增学员' }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form :disabled="loadingSubmit" v-model="formRules.formValid" :lazy-validation="true" ref="form">
                    <v-row>

                      <!--所属教练-->
                      <v-col cols="4">
                        <autocomplete-area v-model="form['school.area']" outlined label/>
                      </v-col>
                      <v-col cols="4">
                        <autocomplete-school v-model="form['school.id']" :area="form['school.area']" outlined dense/>
                      </v-col>
                      <v-col cols="4">
                        <autocomplete-coach v-model="form.coachId" :schoolArea="form['school.area']" :schoolId="form['school.id']" outlined dense :rules="formRules.coachIdRules"/>
                      </v-col><v-spacer/>
                      <!--姓名-->
                      <v-col cols="12">
                        <v-text-field v-model="form.realname" label="姓名" hide-details :rules="formRules.realNameRules"></v-text-field>
                      </v-col><v-spacer/>
                      <!--手机-->
                      <v-col cols="12">
                        <v-text-field v-model="form.phone" label="手机" hide-details :rules="formRules.phoneRules"></v-text-field>
                      </v-col><v-spacer/>
                      <!--身份证号-->
                      <v-col cols="12">
                        <v-text-field v-model="form.idNumber" label="身份证号" hide-details :rules="formRules.idNumberRules"></v-text-field>
                      </v-col><v-spacer/>
                      <!--邮箱-->
<!--                      <v-col cols="12">-->
<!--                        <v-text-field v-model="form.email" label="邮箱" hide-details></v-text-field>-->
<!--                      </v-col>-->
                      <!--报名日期-->
                      <v-col cols="12">
                        <v-menu v-model="FilterMenuRegisterDateForm" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="form.registerDate" label="报名日期" hide-details v-bind="attrs" v-on="on" clearable :rules="formRules.dateRules"/>
                          </template>
                          <v-date-picker first-day-of-week="1"  v-model="form.registerDate" clearable></v-date-picker>
                        </v-menu>
                      </v-col><v-spacer/>
                      <!--状态-->
<!--                      <v-col cols="12">-->
<!--                        <v-switch color="primary" v-model="form.status" :label="`状态: ${form.status===1?'启用':'停用'}`"-->
<!--                                  :false-value="0" :true-value="1"/>-->
<!--                      </v-col>-->
                      <!--库存学员-->
                      <v-col cols="12">
                        <v-switch color="primary" v-model="form.noExam" :label="`库存学员: ${form.noExam===1?'是':'否'}`"
                                  :false-value="0" :true-value="1"/>
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
              <v-card-title class="headline">{{ batchDelete ? '确认批量删除学员吗？' : '确认删除该学员吗？' }}</v-card-title>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="blue darken-1" text @click="closeDelete">取消</v-btn>
                <v-btn color="error" type="" text @click="deleteItemConfirm">确定</v-btn>
                <v-spacer/>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <template v-slot:[`item.avatar`]="{ item }">
          <v-avatar size="36" v-if="$addBaseURL(item['avatar'])">
            <img :src="$addBaseURL(item['avatar'])" alt="无">
          </v-avatar>
          <div class="" v-else>无</div>
        </template>
<!--        <template v-slot:[`item.status`]="{ item }">-->
<!--          <v-chip color="success" v-if="item.status===1" small label>启用</v-chip>-->
<!--          <v-chip color="error" v-else-if="item.status===0" small label>停用</v-chip>-->
<!--        </template>-->
        <template v-slot:[`item.no_exam`]="{ item }">
<!--          <v-chip v-if="item.no_exam===1" small label>是</v-chip>-->
<!--          <v-chip color="success" v-else-if="item.no_exam===0" small label>否</v-chip>-->
          <v-switch color="primary" v-model="item.no_exam" :false-value="0" :true-value="1" @change="(v)=>{changeNoExam(item,v)}"/>
        </template>
        <template v-slot:[`item.status_subject`]="{ item }">
          <v-chip v-if="item.status_subject===0" small label>刚报名</v-chip>
          <v-chip color="light-blue accent-1" v-else-if="item.status_subject===1" small label>科目一</v-chip>
          <v-chip color="light-blue accent-2" v-else-if="item.status_subject===2" small label>科目二</v-chip>
          <v-chip color="light-blue accent-3" v-else-if="item.status_subject===3" small label>科目三</v-chip>
          <v-chip color="light-blue accent-4" v-else-if="item.status_subject===4" small label>科目四</v-chip>
        </template>
        <template v-slot:[`item.allowAction`]="{ item }">
          <v-btn small icon class="mr-2" @click="openFormDialog(item)" title="编辑" color="warning" :loading="(readLoading && info.id===item.id)">
            <v-icon size="20">mdi-pencil</v-icon>
          </v-btn>
          <v-btn small icon @click="deleteItem(item)" title="删除学员" color="error">
            <v-icon size="20">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>


    </v-sheet>
  </div>
</template>

<script>

import {
  addUserApi,
  delUserApi,
  editUserApi,
  readUserApi,
  studentListApi
} from "@/api/modules";
import {RSAEncrypt} from "@/utils/cryptology";
import qs from "qs";
import {TpSqlBuilder} from "@/utils/tp-sql";
import AutocompleteArea from "@/components/AutocompleteArea";
import AutocompleteSchool from "@/components/AutocompleteSchool";
import AutocompleteCoach from "@/components/AutocompleteCoach";

export default {
  name: 'registration_number_coach',
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
        // {text: '生日', value: 'birthday',initHide:true},
        // {text: '性别', value: 'gender',initHide:false},
        {text: '手机', value: 'phone',initHide:false},
        {text: '身份证', value: 'id_number',initHide:false},
        // {text: '地址', value: 'areaCode',initHide:true},
        // {text: '链接', value: 'url',initHide:true},
        // {text: '介绍', value: 'profile',initHide:true},
        {text: '报名日期', value: 'register_date',initHide:false},
        {text: '科一初学日期', value: 'status_subject1_date',initHide:true},
        {text: '科二初学日期', value: 'status_subject2_date',initHide:true},
        {text: '科三初学日期', value: 'status_subject3_date',initHide:true},
        {text: '科四初学日期', value: 'status_subject4_date',initHide:true},
        {text: '目前在学进度', value: 'status_subject',initHide:true},//initHide
        {text: '驾校地区', value: 'school_area',initHide:true},//initHide
        {text: '所属驾校', value: 'school_name',initHide:true},//initHide
        {text: '所属教练', value: 'coach_name',initHide:true},//initHide
        {text: '邮箱', value: 'email',initHide:true},
        // {text: '状态', value: 'status',initHide:false},
        {text: '库存学员', value: 'no_exam',initHide:false},
        {text: '创建时间', value: 'create_time',initHide:true},
        // {text: '创建者', value: 'createUser.username'},
        {text: '更新时间', value: 'update_time', initHide: true},
        // {text: '更新者', value: 'updateUser.username', initHide: true},
        {text: '操作', value: 'allowAction', sortable: false, align: 'center'},
      ],
      FilterMenuCreateTime: false,
      FilterMenuRegisterDate: false,
      FilterMenuRegisterDateForm: false,
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
        'school.id': null,
        'school.area': null,
        coachId: null,
        idNumber: null,
        username: '',
        email: '',
        phone: '',
        statusSubject: 0,
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
        noExam: null,
        createTime: [],
        registerDate: [],
        coachId:null,
        'createUser.username': '',
        'school.id': null,
        'school.area': '',
      },
      searchSqlType: {
        // notNone: ['coachId'],/* 不为null */
        equal: ['status','noExam','coachId','school.area','school.id'],/* 精确查询 */
        strLike: ['username', 'email', 'phone', 'nickname', 'realname', 'createUser.username'],/* 模糊查询 */
        dateBetween: ['createTime','registerDate'],/* 日期范围查询 */
      },

      formRules: {
        autoValid: true,
        formValid: true,
        coachIdRules: [v => this.formRules.autoValid || !!v || '请选择学员'],
        dateRules: [v => this.formRules.autoValid || !!v || '请选择日期'],
        realNameRules: [v => this.formRules.autoValid || !!v || '请输入名字'],
        phoneRules: [v => this.formRules.autoValid || /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/.test(v) || '请输入正确的手机号'],
        idNumberRules: [v => this.formRules.autoValid || /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(v) || '请输入正确的身份证号'],
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
    dialogDelete(val) {
      val || this.closeDelete()
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
        sortList
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
      let res = await delUserApi(data).then(res => res).catch(err => err).finally(() => {
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
        res.info.coach
        && res.info.coach.school
        && (this.form['school.id']=res.info.coach.school.id)
        && (this.form['school.area']=res.info.coach.school.area)
      }else{
        this.form['school.area']=this.searchOption['school.area']
        this.form['school.id']=this.searchOption['school.id']
        this.form['coachId']=this.searchOption['coachId']
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

      data.roles = [4]
      data.username=data.phone
      data['password'] = data.realname

      delete data['school.area']
      delete data['school.id']
      if (this.$notEmpty(data['password'])) data['password'] = RSAEncrypt(data['password'])

      this.loadingSubmit = true;
      let submitFun = this.$notEmpty(data.id) ? editUserApi : addUserApi;
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
#registration_number_coach {
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
