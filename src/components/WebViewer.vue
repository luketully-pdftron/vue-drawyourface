<template>
  <div>
    <h2>{{loading ? 'Loading' : 'false'}}</h2>
    <div class="webviewer-container" id="webviewer-main" ref="webviewer"></div>
  </div>
</template>


<script>
export default {
  name: "WebViewer",
  props: ["publicPath", "content", "userId"],
  data() {
    return {
      docState: "",
      loading: false
    };
  },
  methods: {
    saveData(data, userId) {
      console.log(data);
      const annotData = data;
      this.$emit("change", { data, userId: userId });
    },
    updateAnnotations(annotations) {
      /* Param: New Annotations XML String
        Clear the canvas
        Write new data
      */
      const annotList = this.annotManager.getAnnotationsList();
      const hasAnnots = annotList.length > 0;

      if (hasAnnots) {
        const curAnnots = this.annotManager.exportAnnotations();
        if (curAnnots !== annotations) {
          this.annotManager.deleteAnnotations(annotList);
        }
      }
      console.log("Annotations imported");
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
        _self.docViewer = instance.docViewer;
        _self.annotManager = instance.annotManager;

        /*
          Content may have been received before the WebViewer was attached to the DOM.
          Now that we know it has been, we can pull those annotations off the queue
        */
        console.log("This is " + _self);

        // you can also access major namespaces from the instance as follows:
        // var Tools = instance.Tools;
        // var Annotations = instance.Annotations;
        instance.disableTools();
        instance.enableTools([
          "AnnotationCreateFreeHand",
          "AnnotationEraserTool"
        ]);
        // now you can access APIs through `this.instance`

        // Listen for annotations being changed and send them out as events
        (function(userId) {
          _self.annotManager.on("annotationChanged", () => {
            debugger;
            _self.saveData(_self.annotManager.exportAnnotations(), userId);
          });
        })(_self.userId);

        // or listen to events from the viewer element
        _self.docViewer.on("documentLoaded", () => {
          // call methods relating to the loaded document
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
    },
    userId() {
      // Listen for annotations being changed and send them out as events
      (function(userId) {
        _self.annotManager.on("annotationChanged", () => {
          _self.saveData(_self.annotManager.exportAnnotations(), userId);
        });
      })(_self.userId);
    }
  },
  mounted: function() {
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
