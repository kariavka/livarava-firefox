function hideExtensionPanel(){
	var elements = document.getElementsByClassName("download-browser-extension");
	if(elements.length>0) {
		elements[0].style.visibility='hidden';
		self.postMessage("Panel was hidden....!!!!");
		//document.getElementById("download-browser-extension-close").click();
	}
}

hideExtensionPanel();
