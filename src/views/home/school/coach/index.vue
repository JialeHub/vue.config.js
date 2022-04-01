<template>
  <div id="homeCoach">
    <div class="titleH1"><h1>{{info.name?info.name:menuTitle}}</h1></div>

    <div class="main">
      <div class="menuSheets">
        <transition name="list" tag="div">
          <v-row no-gutters>
            <v-col cols="6" v-for="item in menuList" :key="info.id+item.title">
              <router-link :to="{path:item.link,query:{option:{sortBy:item.sortBy,sortDesc:item.sortDesc,searchOption:{[item.idKey]:info.id,[item.schoolIdKey]:info.school.id,[item.schoolAreaKey]:localArea}}}}">
                <v-sheet elevation="1" height="80" outlined>
                  <div class="sheetH2"><h2>{{item.title}}</h2></div>
                </v-sheet>
              </router-link>
            </v-col>
          </v-row>
        </transition>
      </div>

    </div>

  </div>
</template>

<script>
import {readCoachApi} from "@/api/modules";
import {citysStr} from "@/utils/city";

export default {
  name: 'HomeCoach',
  data(){
    return {
      menuList:[
        {title:'各月报名人数',link:'/coach_registration_number',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coachId',sortBy:['register_date'],sortDesc:['true']},
        {title:'各月科二科三在学人数',link:'/coach_students_number_subjects_2_3',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coachId'},
        {title:'考试安排',link:'/coach_exam_schedule_subject_2_3',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coach.id',sortBy:['date'],sortDesc:['true']},
        {title:'科一考试安排',link:'/coach_exam_schedule_subject_1',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coach.id',sortBy:['date'],sortDesc:['true']},
        {title:'暂时不考学员',link:'/coach_exam_schedule_subject_1',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coachId',sortBy:['date'],sortDesc:['true']},
        {title:'科四学员',link:'/coach_students_subject_4',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coachId'},
        {title:'练车预约表',link:'/coach_appointment',schoolAreaKey:'school.area',schoolIdKey:'school.id',idKey:'coach.id',sortBy:['datetime'],sortDesc:['true']},
      ],
      loading: false,
      coachId:null,
      info:{
        id:null,
        name:null,
        school:{
          id:null,
        }
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
        if(this.$route.name==='HomeCoach'){
          this.coachId = params.id
          if(params.id!==this.info.id+''){
            this.info=this.$options.data().info
            if(this.$route.query.name){
              this.info.name=this.$route.query.name
            }
          }
          params.id && this.readCoach()
        }
      },
      immediate:true
    }
  },
  activated() {
    this.$storeSet('setNav', this.$route.fullPath)
  },
  methods: {
    async readCoach() {
      this.loading = true
      let data = {id:this.coachId}
      let res = await readCoachApi(data).catch(err => err)
      this.loading = false
      if (res.status === 200) {
        this.info=res.info
      }
    }
  }
}
</script>

<style lang="scss">
#homeCoach {
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
