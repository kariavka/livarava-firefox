var textNeuron = document.getElementById("neuron");
var textAxon = document.getElementById("axon");
var btnSubmit = document.getElementById("sendit");

//textNeuron.addEventListener('input', function() {changeNeuronData()}, false);
//textAxon.addEventListener('input', function() {changeAxonData()}, false);
//btnSubmit.addEventListener('click', function (){onSubmit()}, false);
//"text-required"

//The event handler by pressing the submit button
document.getElementById("form-add").onsubmit = function(){
	//only Neuron parameter is required
	if (textNeuron.value != "") {
		sendInfo();
	}
	else {
//		alert("parameters is empty");
		self.port.emit("empty-neuron");
		return false;
	}
}
//click on home image
document.getElementById("goHome").onclick = function(){
//		var newTab = "http://www.livarava.com";
	console.log("click home");
	self.port.emit("go-home");
/*	function openNeuron(someText) {
		tabs.open({
			url: "http://www.livarava.com"
	});
	}*/
}

//function sends text from axon and neuron fields
function sendInfo(){
	var neuron = textNeuron.value;
	var axon = textAxon.value;
//	textNeuron.value = "";
//	textAxon.value = "";
//	localStorage.setItem("neuronStorage", "");
//	localStorage.setItem("axonStorage", "");
	self.port.emit("text-entered", [neuron, axon]);
	
}
// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
//
// Set the focus to the text area so the user can
// just start typing.
self.port.on("show", function onShow(text) {
//	if (localStorage.getItem("neuronStorage")!="" && typeof localStorage.getItem("neuronStorage") != 'undefined' ) textNeuron.value = localStorage.getItem("neuronStorage");
//	if (localStorage.getItem("axonStorage")!="" && typeof localStorage.getItem("axonStorage") != 'undefined') textAxon.value = localStorage.getItem("axonStorage");
//	textNeuron.focus();
	console.log("show");
	if (text[0] != "") textNeuron.placeholder = text[0];
	if (text[1] != "") textAxon.placeholder = text[1];
	if (text[2] != "") btnSubmit.value = text[2];
});
//To listen for "prefill" message sent from the main add-on code
self.port.on("prefillpopup", function onPrefill(text) {
	//Storage text fields info
	
	console.log("prefillpopup");
	textNeuron.value = text[0];
	textAxon.value = text[1];
});
//To listen for "hide" message sent from the main add-on code
self.port.on("hide", function onHide() {
	//Storage text fields info
	localStorage.setItem("neuronStorage", textNeuron.value);
	localStorage.setItem("axonStorage", textAxon.value);
});
//To listen for "elert_neuron" message sent from the main add-on code
self.port.on("alert-neuron", function onAl(text) {
//	console.log("alert-neuron recieved");
	if (text != "") textNeuron.placeholder = text;
	textNeuron.focus(); 
});

//To listen for "addneuron" message sent from the main add-on code
self.port.on("addneuron", function onMessage(selectionText) {
	textNeuron.value = selectionText;
	localStorage.setItem("neuronStorage", selectionText);
	textNeuron.focus();
});
//To listen for "add axon" message sent from the main add-on code
self.port.on("addaxon", function onMessage(selectionText) {
	textAxon.value = selectionText;
	localStorage.setItem("axonStorage", selectionText);
	textAxon.focus();
});