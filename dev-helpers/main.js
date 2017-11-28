    function setEditorMode(editorMode) {
      var uiModeDiv = document.getElementById('api-mode');
      var editorModeDiv = document.getElementById('documentation-mode');
      if (editorMode) {
        editorModeDiv.classList.remove("body-hidden");
        uiModeDiv.classList.add("body-hidden");
      }
      else {
        editorModeDiv.classList.add("body-hidden");
        uiModeDiv.classList.remove("body-hidden");
      }
    }
	
    window["SwaggerUIBundle"] = window["swagger-ui-bundle"]
    window["SwaggerUIStandalonePreset"] = window["swagger-ui-standalone-preset"]
    window.onload = function () {
      const ui = SwaggerUIBundle({
        url: "http://petstore.swagger.io/v2/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      })

      window.ui = ui
    }