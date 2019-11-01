<template>
  <div id="app">
    <h1>Draw your face</h1>

    <router-view
      class="view"
      @change="handleChanged"
      @loaded="handleLoaded"
      @update:selected="changeCurrentUser"
      :publicPath="publicPath"
      :content="content"
      :users="faceData"
      :selected="currentUser"
      :userId="currentUser"
      :lastTimeStamp="faceData[currentUser].timestamp"
    ></router-view>
  </div>
</template>


<script>
import WebViewer from "./components/WebViewer.vue";
import UserList from "./components/UserList.vue";
import VueRouter from "vue-router";
import { saveFace, getFace } from "./faceStore.js";
import iniialData from "./data/users.js";

const router = new VueRouter({
  mode: "history",
  base: __dirname,
  routes: [
    {
      path: "/",
      component: UserList
    },
    {
      path: "/user/:id",
      component: WebViewer
    }
  ]
});

export default {
  name: "app",
  router,
  components: {
    WebViewer,
    UserList
  },
  computed: {
    content() {
      return this.faceData[this.currentUser].content;
    }
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      currentUser: 2,
      faceData: intialData
    };
  },
  watch: {
    $route(to, from) {
      if (to.params.id !== undefined)
        this.currentUser = parseInt(to.params.id, 10);
    },
    currentUser() {
      getFace(this.currentUser.toString()).then(value => {
        if (value) {
          this.faceData[this.currentUser].content = value.drawingData || null;
          this.faceData[this.currentUser].timestamp =
            new Date(parseFloat(value.timestamp)).toLocaleTimeString() || null;
        }
      });
    }
  },
  methods: {
    handleLoaded(e) {
      /* Set up an arbitrary initial value once the document is loaded and if there isn't one already set */
      if (!this.currentUser) {
        this.currentUser = 2;
      }
    },
    handleChanged({ data, userId }) {
      /* Saved the changed data based on the userId at the time of editing */
      const keyAsString = userId.toString();
      this.faceData[userId].content = data;
      saveFace(keyAsString, this.faceData[userId].content);
    },
    changeCurrentUser(e) {
      this.currentUser = e;
      this.$router.push({ path: `/user/${e}` });
    }
  },
  mounted() {
    const route = this.$router.currentRoute;
    if (route.params.id) this.currentUser = parseInt(route.params.id, 10);
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
