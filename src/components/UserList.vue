<template>
  <form action="#">
    <h2>{{title}}</h2>
    <el-select
      name="userSelect"
      id="userSelector"
      @change="handleUserChange"
      :value="selected"
      placeholder="Select"
    >
      <el-option v-for="(user,id) in users" :label="user.name" :key="id" :value="id">{{ user.name }}</el-option>
    </el-select>
    <p>Current user: {{users[selected].name}} who is {{selected}}</p>
  </form>
</template>

<script>
import { Select, Option } from "element-ui";
import Vue from "vue";


/* Register Element-ui components */
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);

export default {
  data() {
    return {
      title: "User Selection List"
    };
  },
  components: {
    Select,
    Option
  },
  props: ["selected", "users"],
  methods: {
    handleUserChange(userId) {
      this.$emit("update:selected", parseInt(userId, 10));
    }
  }
};
</script>