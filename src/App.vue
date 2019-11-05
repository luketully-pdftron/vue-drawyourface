<template>
  <div id="app">
    <h1>Draw your face</h1>
    <button @click="handleSave(currentUser)" id="save-button">Save</button>
    <router-view
      class="view"
      @update:document="updateDocument"
      @loaded="handleLoaded"
      @update:selected="changeCurrentUser"
      :publicPath="publicPath"
      :initialContent="content"
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
import initialData from "./data/users.js";

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
      faceData: initialData
    };
  },
  watch: {
    $route(to, from) {
      if (to.params.id !== undefined)
        this.currentUser = parseInt(to.params.id, 10);
    },
    currentUser() {
      if (this.loaded) {
        this.getDrawing();
      }
    }
  },
  methods: {
    getDrawing() {
      /* Retrieve face data for the current user from our local store */
      getFace(this.currentUser.toString()).then(value => {
        const time = new Date(parseFloat(value.timestamp)).toTimeString();
        if (value["drawingData"])
          this.faceData[this.currentUser].content = value.drawingData || null;
        if (value["timestamp"])
          this.faceData[this.currentUser].timestamp = time || null;
      });
    },
    handleLoaded(e) {
      this.loaded = true;
      
      /* Set up an arbitrary initial value once the document is loaded and if there isn't one already set */
      if (!this.currentUser) {
        this.currentUser = 2;
      } else {
        this.getDrawing();
      }

      
    },
    updateDocument({ data, userId }) {
      /* Update the document properties in local state */
      this.faceData[userId].content = data;
    },
    handleSave() {
      const userId = this.currentUser;

      /* Saved the changed data based on the userId at the time of editing */
      const keyAsString = userId.toString();

      /* Save current face data to IndexedDB */
      saveFace(keyAsString, this.faceData[userId].content).then(value => {
        const time = new Date(parseFloat(value.timestamp)).toTimeString();
        this.faceData[userId].timestamp = time;
      });
    },
    changeCurrentUser(e) {
      this.currentUser = e; // Assign a new current user
      this.$router.push({ path: `/user/${this.currentUser}` }); // Change the route
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
