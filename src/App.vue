<template>
  <div>
    <UserList :users="faceData" :selected="currentUser" @update:selected="changeCurrentUser"></UserList>
    <WebViewer
      v-on:loaded="handleLoaded"
      v-on:change="handleChanged"
      v-bind:publicPath="publicPath"
      :content="content"
    ></WebViewer>
  </div>
</template>


<script>
import WebViewer from "./components/WebViewer.vue";
import UserList from "./components/UserList.vue";
import { saveFace, getFace } from "./faceStore.js";

export default {
  name: "app",
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
      faceData: {
        0: {
          name: "Rosi",
          content: null
        },
        1: {
          name: "Tim",
          content: null
        },
        2: {
          name: "Sarah",
          content: null
        },
        3: {
          name: "Bob",
          content: null
        },
        4: {
          name: "Greg",
          content: null
        }
      }
    };
  },
  methods: {
    handleLoaded(e) {
      getFace(this.currentUser.toString()).then(value => {
        this.faceData[this.currentUser].content = value.drawingData || null;
      });
    },
    handleChanged(e) {
      const newContent = e;
      const keyAsAstring = this.currentUser.toString();
      this.faceData[this.currentUser].content = e;
      saveFace(keyAsAstring, this.faceData[keyAsAstring].content);
    },
    changeCurrentUser(e) {
      this.currentUser = e;
      getFace(this.currentUser.toString()).then(value => {
        this.faceData[this.currentUser].content = value.drawingData || null;
      });
    }
  },
  mounted: function() {
    // Init currentUser
    this.currentUser = 2;
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
