function hideExtensionPanel(){
	var elements = document.getElementsByClassName("download-browser-extension");
	if(elements.length>0) {
		elements[0].style.display = 'none';
	}
}

hideExtensionPanel();
