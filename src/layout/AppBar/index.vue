<template>
  <div id="appBar">
    <v-app-bar-nav-icon @click.stop="navigationSet" ></v-app-bar-nav-icon>
    <v-btn icon title="首页" v-if=" !['Home','HomeSchool','HomeCoach'].includes($route.name)" @click="backHome"><v-icon :ripple="false">mdi-home</v-icon></v-btn>
    <v-btn icon title="返回" v-if=" ['HomeSchool','HomeCoach'].includes($route.name)" @click="preHome"><v-icon :ripple="false">mdi-arrow-left</v-icon></v-btn>


    <v-spacer></v-spacer>

    <div class="citySelect">
      <autocomplete-area v-model="citySelect" @change="cityChange" rounded filled :clearable="false"/>
    </div>

    <v-app-bar-nav-icon @click.stop="settingsSet">
      <v-btn icon><v-icon>mdi-cog-outline</v-icon></v-btn>
    </v-app-bar-nav-icon>

    <v-btn icon v-if="false"><v-icon>mdi-bell-outline</v-icon></v-btn>

    <v-menu bottom min-width="200px" rounded offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on" elevation="1">
          <v-avatar  v-if="$notEmpty(avatar)" size="40">
            <img :src="$addBaseURL(avatar)"  alt=""/>
          </v-avatar>
          <v-avatar size="40"  v-else>
            <v-btn icon><v-icon>mdi-account-circle</v-icon></v-btn>
          </v-avatar>
        </v-btn>
      </template>
      <v-card >
        <v-list-item-content class="justify-center">
          <div class="mx-auto text-center">
            <v-avatar  v-if="$notEmpty(avatar)">
              <img :src="$addBaseURL(avatar)"  alt=""/>
            </v-avatar>
            <v-icon v-else>mdi-account-circle</v-icon>

            <h3 class="mt-2">{{nickname}}</h3>
            <p class="mt-1">{{username}}</p>
            <v-divider class="my-3"></v-divider>
            <v-btn depressed rounded text v-if="false">
              Edit Account
            </v-btn>
            <v-divider class="my-3" v-if="false"></v-divider>
            <v-btn depressed shaped text @click="logout">退出登录</v-btn>
          </div>
        </v-list-item-content>
      </v-card>
    </v-menu>

  </div>
</template>

<script>
import {getUserInfo, logout} from "@/utils/auth";
import {editUserInfoApi} from "@/api/modules";
import AutocompleteArea from "@/components/AutocompleteArea";
import {mapQQRequestG} from "@/api/other";
import {citysStr} from "@/utils/city";

  export default {
    name: "appBar",
    components: {AutocompleteArea},
    data() {
      return {
        citySelect:null,
      }
    },
    computed:{
      avatar(){
        return this.$storeGet.user.avatar
      },
      nickname(){
        return this.$storeGet.user.nickname
      },
      username(){
        return this.$storeGet.user.username
      },
      userSetting(){
        return this.$storeGet.user.setting
      },
    },
    created(){
      mapQQRequestG().then(res=>{
        if(res.status === 200 && res.data && res.data.result && res.data.result.ad_info && res.data.result.ad_info.city){
          let ipCity = res.data.result.ad_info.city
          ipCity.slice(-1)==='市' && (ipCity = ipCity.slice(0,-1));
          let city = citysStr.find(item=>item.split(' ')[1]===ipCity);
          this.$notEmpty(city) && this.cityChange(this.citySelect = city)
        }
      })
    },
    mounted() {

    },
    methods: {
      backHome(){
        this.$router.push(this.$storeGet.nav)
      },
      preHome(){
        if(this.$route.name==='HomeCoach'){
          let strArr = this.$route.path.split('/')
          let schoolId = strArr[strArr.length-2]
          this.$router.replace('/home/'+schoolId)
        }else if(this.$route.name==='HomeSchool'){
          this.$router.replace('/home')
        }
      },
      async cityChange(v){
        console.log(v)
        await editUserInfoApi({setting:{citySelect:v}})
        getUserInfo()
      },
      logout(){
        logout().then(() => {
          this.$router.replace({path: '/login'})
        })
      },
      navigationSet(){
        this.$emit('navigation-fun',)
      },
      settingsSet(){
        this.$emit('settings-fun',)
      },
    },

  }
</script>

<style lang="scss">
  #appBar{
    width: 100%;
    align-items: center;
    display: flex;
    position: relative;
    z-index: 0;
    .citySelect{
      width: 200px;
      margin-right: 10px;
    }
  }
</style>
