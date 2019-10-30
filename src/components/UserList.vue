<template>
  <form action="#">
    <h2>{{title}}</h2>
    <select name="userSelect" id="userSelector" @change="handleChange" :value="selected">
      <option v-for="(user,id) in users" :key="id" v-bind:value="id">{{ user.name }}</option>
    </select>
    <p>Current user: {{users[selected].name}} who is {{selected}}</p>
  </form>
</template>

<script>
export default {
  data() {
    return {
      title: "User Selection List"
    };
  },
  props: ["selected", "users"],
  methods: {
    handleChange(e) {
      const newVal = parseInt(e.currentTarget.value, 10);
      this.$emit("update:selected", newVal);
    }
  }
};
</script>