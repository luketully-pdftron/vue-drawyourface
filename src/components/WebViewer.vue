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
  props: ["publicPath", "initialContent", "userId", "lastTimeStamp"],
  data() {
    return {
      docState: "",
      loading: false
    };
  },
  methods: {
    updateDocument(data, userId) {
      const annotData = data;
      this.$emit("update:document", { data, userId: userId });
    },
    drawTimeStamp() {
      const timeStampAnnot = this.timeStampAnnot;

      /* Make sure a new time stamp isn't created each time */
      if (!timeStampAnnot) {
        timeStampAnnot = new this.Annotations.FreeTextAnnotation();
      }

      /* Style the timestamp */
      timeStampAnnot.TextAlign = "right";
      timeStampAnnot.PageNumber = 1;
      timeStampAnnot.Width = 400;
      timeStampAnnot.Height = "18pt";
      timeStampAnnot.FontSize = "16pt";
      timeStampAnnot.X = this.docViewer.getPageWidth(0) - 400;
      timeStampAnnot.Y = this.docViewer.getPageHeight(0) - 24;

      timeStampAnnot.setContents(this.lastTimeStamp);
      timeStampAnnot.setPadding(new this.Annotations.Rect(0, 0, 0, 0));

      /* Determine whether or not to update or add the annotation */
      if (this.annotManager.hasAnnotation(timeStampAnnot)) {
        /* The second time the timestamp changes, we'll update the annotation */
        this.annotManager.updateAnnotation(timeStampAnnot);
      } else {
        /* The first time the timestamp changes, we'll add the annotation */
        this.annotManager.addAnnotation(timeStampAnnot);
      }

      /* Always redraw the annotation */
      this.annotManager.redrawAnnotation(timeStampAnnot);
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
        _self.Annotations = instance.Annotations;

        /* Handle any WebViewer manual configuration */
        instance.disableTools(); // Disable all tools
        instance.enableTools([
          "AnnotationCreateFreeHand",
          "AnnotationEraserTool"
        ]); // Enable tools individually

        /* Listen for annotations being changed and send them out as events
        This is being done with a self-executing anon function so that the userId at the time the event was created could be captured. */
        (function(userId) {
          _self.annotManager.on(
            "annotationChanged",
            (e, annotations, action) => {
              if (!e.imported) {
                _self.updateDocument(
                  _self.annotManager.exportAnnotations(),
                  userId
                );
              }
            }
          );
        })(_self.userId);

        _self.docViewer.on("documentLoaded", () => {
          _self.$emit("loaded");
          if (_self.content) {
            _self.updateAnnotations(_self.content);
            _self.drawInitialAnnotations();
          }
        });
      });
    }
  },
  watch: {
    initialContent(annotations) {
      if (this.annotManager) {
        this.updateAnnotations(annotations);
      }
    },
    lastTimeStamp() {
      const annotManager = this.annotManager;
      debugger;
      if (this.annotManager) {
        this.drawTimeStamp(this.lastTimeStamp);
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