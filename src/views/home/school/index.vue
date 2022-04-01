<template>
  <div id="homeSchool">
    <div class="titleH1"><h1>{{info.name?info.name:menuTitle}}</h1></div>

    <div class="main">
      <div class="menuSheets">
        <transition name="list" tag="div">
          <v-row no-gutters>
            <v-col cols="6" v-for="item in menuList" :key="info.id+item.title">
              <router-link :to="{path:item.link,query:{option:{sortBy:item.sortBy,sortDesc:item.sortDesc,searchOption:{[item.idKey]:info.id,[item.schoolAreaKey]:localArea}}}}">
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
            <v-col cols="auto" v-for="item in listCoach" :key="item.id" class="list-item">
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
import {readSchoolApi} from "@/api/modules";
import {citysStr} from "@/utils/city";

export default {
  name: 'HomeSchool',
  data(){
    return {
      id:null,
      menuList:[
        {title:'各月报名人数',link:'/school_registration_number',schoolAreaKey:'school.area',idKey:'schoolId',sortBy:['registerCount'],sortDesc:['true']},
        {title:'各月科二科三在学人数',link:'/school_students_number_subjects_2_3',schoolAreaKey:'school.area',idKey:'schoolId',sortBy:['subject23Count'],sortDesc:['true']},
        {title:'各月考试合格率及人数',link:'/school_pass_rate_exam_number',schoolAreaKey:'school.area',idKey:'schoolId',sortBy:['subject23ExamPassRate'],sortDesc:['true']},
        {title:'教练排名',link:'/school_pass_rate_exam_number',schoolAreaKey:'school.area',idKey:'schoolId',sortBy:['subject23ExamPassRate'],sortDesc:['true']},
      ],
      listCoach: [],
      loading: false,
      schoolId:null,
      info:{
        id:null,
        name:null,
      }
    };
  },
  computed: {
    menuTitle() {
      return this.$storeGet.setting.menuTitle
    },
    userSetting() {
      return this.$storeGet.user.setting
    },
    localArea() {
      return (this.userSetting && citysStr.includes(this.userSetting.citySelect))
        ? this.userSetting.citySelect
        : citysStr[0];
    },
  },
  watch:{
    '$route.params':{
      handler(params){
        if(this.$route.name==='HomeSchool'){
          this.schoolId = params.id
          if(params.id!==this.info.id+''){
            this.info=this.$options.data().info
            if(this.$route.query.name){
              this.info.name=this.$route.query.name
            }
          }
          params.id && this.readSchool()
        }
      },
      immediate:true
    }
  },
  activated() {
    this.$storeSet('setNav', this.$route.fullPath)
  },
  deactivated() {
    this.listCoach=[]
  },
  methods: {
    async readSchool() {
      this.loading = true

      let data = {id:this.schoolId}
      let res = await readSchoolApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        this.listCoach = [...res.info.coachs]
        this.info=res.info
      }
    }
  }
}
</script>

<style lang="scss">
#homeSchool {
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
