self.port.on("detach", function() {
//  Storage.clear();
//  Storage.removeItem("download-browser-extension-dismiss");
	if (window.localStorage.getItem("download-browser-extension-dismiss")){
		window.localStorage.removeItem("download-browser-extension-dismiss");
		self.postMessage("detach: remove local storage!!!!!!!!!");
	}
	self.postMessage("detach: nothing remove......!!!!!!!!!");
  //Storage.removeItem();
});