self.port.on("get-user", getFirstPara);
function getFirstPara(){
	console.log("In script authorization....!!!!");
	var elements = document.getElementsByClassName("dropdown-toggle user-menu");
	console.log(elements.length);
	var authoriz;
//	user = window.user.authorized;
	if (elements.length > 0){
		authoriz = "yes";
		console.log("Aauthorization yes....!!!!");
		self.port.emit("my-script-response", authoriz); 
	}
	else {
		authoriz = "no";
		console.log("Authorization no....!!!!");
		self.port.emit("my-script-response", authoriz); 
	}
}
