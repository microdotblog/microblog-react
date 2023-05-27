var MyExtensionJavaScriptClass = function() {};

MyExtensionJavaScriptClass.prototype = {
run: function(arguments) {
  // Pass the baseURI of the webpage to the extension.
  arguments.completionFunction({"title": document.title, "url": document.URL, "text": document.getSelection().toString()});
}
};

// The JavaScript file must contain a global object named "ExtensionPreprocessingJS".
var ExtensionPreprocessingJS = new MyExtensionJavaScriptClass;
