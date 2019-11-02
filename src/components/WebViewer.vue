<template>
  <keep-alive>
    <div>
      last edited: {{ lastTimeStamp }}
      <div class="webviewer-container" id="webviewer-main" ref="webviewer"></div>
    </div>
  </keep-alive>
</template>

<script>
export default {
  name: "WebViewer",
  props: ["publicPath", "content", "userId", "lastTimeStamp"],
  data() {
    return {
      docState: "",
      loading: false
    };
  },
  methods: {
    saveData(data, userId) {
      const annotData = data;
      this.$emit("change", { data, userId: userId });
    },
    updateAnnotations(annotations) {
      /*
        Handle updating annotations on the current document.
        Here we delete the current set of annotations, and write the new incoming annotations that may have been cached in local storage.
      */
      const annotList = this.annotManager.getAnnotationsList();
      const hasAnnots = annotList.length > 0;

      if (hasAnnots) {
        const curAnnots = this.annotManager.exportAnnotations();
        if (curAnnots !== annotations) {
          this.annotManager.deleteAnnotations(annotList);
        }
      }
      this.annotManager.importAnnotations(annotations);
    },
    init(container) {
      WebViewer(
        {
          path: "/lib",
          initialDoc: "/assets/xmas-part-sample.pdf"
        },
        container
      ).then(instance => {
        const _self = this;
        _self.loading = false;

        /* Attach WebViewer globals to the Vue instance. These won't be reactive. */
        _self.docViewer = instance.docViewer;
        _self.annotManager = instance.annotManager;

        /* Handle any WebViewer manual configuration */
        instance.disableTools();
        instance.enableTools([
          "AnnotationCreateFreeHand",
          "AnnotationEraserTool"
        ]);

        /* Listen for annotations being changed and send them out as events
        This is being done with a self-executing anon function so that the userId at the time the event was created could be captured. */
        (function(userId) {
          _self.annotManager.on("annotationChanged", (e, annotations, action) => {
            _self.saveData(_self.annotManager.exportAnnotations(), userId);
          });
        })(_self.userId);

        _self.docViewer.on("documentLoaded", () => {
          _self.$emit("loaded");
          if (_self.content) {
            _self.updateAnnotations(_self.content);
          }
        });
      });
    }
  },
  watch: {
    content(annotations) {
      if (this.annotManager) {
        this.updateAnnotations(annotations);
      }
    }
  },
  mounted: function() {
    /* Pass this component reference element along to the webviewer intializer */
    const webViewerContainer = this.$refs.webviewer;
    this.loading = true;
    this.init(webViewerContainer);
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
