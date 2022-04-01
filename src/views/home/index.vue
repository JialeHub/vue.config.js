<template>
  <div id="home">
    <div class="titleH1"><h1>{{menuTitle}}{{localCity?`(${localCity})`:''}}</h1></div>

    <div class="main">
      <div class="menuSheets">
        <transition name="list" tag="div">
          <v-row no-gutters>
            <v-col cols="6" v-for="item in menuList" :key="localCity+item.title">
              <router-link :to="{path:item.link,query:{option:{sortBy:item.sortBy,sortDesc:item.sortDesc,searchOption:{[item.schoolAreaKey]:localArea}}}}">
                <v-sheet elevation="1" height="80" outlined>
                  <div class="sheetH2"><h2>{{item.title}}</h2></div>
                </v-sheet>
              </router-link>
            </v-col>
          </v-row>
        </transition>
      </div>

      <div class="menuSheets menuSheets2">
        <v-row no-gutters justify="space-around">
          <transition-group name="list" tag="div">
            <v-col cols="auto" v-for="item in listSchool" :key="item.id" class="list-item">
              <router-link :to="$route.path+'/'+item.id+'?name='+item.name">
                <v-sheet elevation="1" height="80" outlined>
                  <div class="sheetH2"><h2>{{item.name}}</h2></div>
                </v-sheet>
              </router-link>
            </v-col>
          </transition-group>
        </v-row>
        <v-progress-circular v-if="loading" indeterminate ></v-progress-circular>
      </div>


    </div>

  </div>
</template>

<script>
import {citysStr} from "@/utils/city";
import {TpSqlBuilder} from "@/utils/tp-sql";
import {schoolListApi} from "@/api/modules";

export default {
  name: 'Home',
  data(){
    return {
      menuList:[
        {title:'各月报名人数',link:'/city_registration_number',schoolAreaKey:'school.area',sortBy:['registerCount'],sortDesc:['true']},
        {title:'各月科二科三在学人数',link:'/city_students_number_subjects_2_3',schoolAreaKey:'school.area',sortBy:['subject23Count'],sortDesc:['true']},
        {title:'各月合格率排名及考试人数',link:'/city_pass_rate_exam_number',schoolAreaKey:'school.area',sortBy:['subject23ExamPassRate'],sortDesc:['true']},
        // {title:'教练排名',link:'/city_coach_rank'},
        {title:'教练排名',link:'/school_pass_rate_exam_number',schoolAreaKey:'school.area',sortBy:['subject23ExamPassRate'],sortDesc:['true']},
      ],
      listSchool: [],
      loading: false,
    };
  },
  computed: {
    menuTitle() {
      return this.$storeGet.setting.menuTitle
    },
    localArea() {
      return (this.userSetting && citysStr.includes(this.userSetting.citySelect))
        ? this.userSetting.citySelect
        : citysStr[0];
    },
    userSetting() {
      return this.$storeGet.user.setting
    },
    localCity() {
      return this.localArea.split(' ').slice(1)[0]
    }
  },
  watch:{
    localArea:{
      handler(){
        this.fetchSchool()
      },
      immediate:true
    }
  },
  activated() {
    this.$storeSet('setNav', this.$route.fullPath)
  },
  methods: {
    async fetchSchool() {
      this.loading = true

      // 处理搜索筛选
      let searchOption = {
        area:this.localArea,
        status:1
      }
      let searchSqlType = {
        equal: ['status','area'],/* 精确查询 */
      }
      let searchList = new TpSqlBuilder(searchSqlType, searchOption)
      let data = {searchList}
      data.searchList = data.searchList.filter(item=>!(item[0] === 'area' && item[2] === '全国' ))
      let res = await schoolListApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        this.listSchool = [...res.list]
      }
    }
  }
}
</script>

<style lang="scss">
#home {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  .iframe {
    flex: 1 1 auto;
    min-height: calc(100vh - 64px) ;
  }
  .titleH1{
    margin-top: 20px;
    text-align: center;
  }
  .main{
    margin:50px 10% 0 10%;
  }
  .sheetH2{
    padding: 0 50px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    h2{
      font-weight: 500;
    }
  }
  .menuSheets2{
    text-align: center;
    margin-top: 50px;
  }


  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 0.5s;
  }
  .list-enter, .list-leave-to
    /* .list-leave-active for below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(10px);
  }

}
</style>
