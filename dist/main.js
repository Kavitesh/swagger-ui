    function setEditorMode(editorMode) {
      var uiModeDiv = document.getElementById('api-mode');
      var editorModeDiv = document.getElementById('documentation-mode');
      var guideButton = document.getElementById('guide-button');
      var apiButton = document.getElementById('api-button');
      if (editorMode) {
        editorModeDiv.classList.remove("body-hidden");
        uiModeDiv.classList.add("body-hidden");
        apiButton.classList.remove("selected-tab");
        guideButton.classList.add("selected-tab");
        
      }
      else {
        editorModeDiv.classList.add("body-hidden");
        uiModeDiv.classList.remove("body-hidden");
        apiButton.classList.add("selected-tab");
        guideButton.classList.remove("selected-tab");
      }
    }
	
    window.onload = function () {
      const ui = SwaggerUIBundle({
        url: "default.yml",
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
	
