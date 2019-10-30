<template>
  <div class="webviewer-container" id="webviewer-main" ref="webviewer"></div>
</template>


<script>
export default {
  props: ["publicPath", "content"],
  methods: {
    data() {
      docState: "";
    },
    saveData(data) {
      console.log(data);
      const annotData = data;
      this.$emit("change", annotData);
    }
  },
  watch: {
    content() {
        const curAnnots = this.annotManager.exportAnnotations();

        if (curAnnots !== this.content) {
          const annotList = this.annotManager.getAnnotationsList();
          this.annotManager.deleteAnnotations(annotList);
          this.annotManager.importAnnotations(this.content);
        }
    }
  },
  mounted: function() {
    const webViewerContainer = this.$refs.webviewer;
    WebViewer(
      {
        path: "/lib",
        initialDoc: "/assets/xmas-part-sample.pdf"
      },
      webViewerContainer
    ).then(instance => {
      this.docViewer = instance.docViewer;
      this.annotManager = instance.annotManager;

      // you can also access major namespaces from the instance as follows:
      // var Tools = instance.Tools;
      // var Annotations = instance.Annotations;
      instance.disableTools();
      instance.enableTools(["AnnotationCreateFreeHand"]);
      // now you can access APIs through `this.instance`

      // Listen for annotations being changed and send them out as events
      this.annotManager.on("annotationChanged", () => {
        this.saveData(this.annotManager.exportAnnotations());
      });

      // or listen to events from the viewer element
      this.docViewer.on("documentLoaded", () => {
        // call methods relating to the loaded document
        this.$emit("loaded");
      });
    });
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

#webviewer-main {
  width: 100%;
  height: 100vh;
}
</style>
