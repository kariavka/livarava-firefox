var textNeuron = document.getElementById("neuron");
var textAxon = document.getElementById("axon");
var btnSubmit = document.getElementById("sendit");

//textNeuron.addEventListener('input', function() {changeNeuronData()}, false);
//textAxon.addEventListener('input', function() {changeAxonData()}, false);
//btnSubmit.addEventListener('click', function (){onSubmit()}, false);

//The event handler by pressing the submit button
document.getElementById("form-add").onsubmit = function(){
	sendInfo();
	return false;
}

//function sends text from axon and neuron fields
function sendInfo(){
	var neuron = textNeuron.value;
	var axon = textAxon.value;
	if (neuron != "" && axon != "") {
		textNeuron.value = "";
		textAxon.value = "";
		localStorage.setItem("neuronStorage", "");
		localStorage.setItem("axonStorage", "");
		self.port.emit("text-entered", [neuron, axon]);
	}
}
// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
//
// Set the focus to the text area so the user can
// just start typing.
self.port.on("show", function onShow() {
//	if (localStorage.getItem("neuronStorage")!="" && typeof localStorage.getItem("neuronStorage") != 'undefined' ) textNeuron.value = localStorage.getItem("neuronStorage");
//	if (localStorage.getItem("axonStorage")!="" && typeof localStorage.getItem("axonStorage") != 'undefined') textAxon.value = localStorage.getItem("axonStorage");
	textNeuron.focus();
});

//To listen for "hide" message sent from the main add-on code
self.port.on("hide", function onHide() {
	//Storage text fields info
	localStorage.setItem("neuronStorage", textNeuron.value);
	localStorage.setItem("axonStorage", textAxon.value);
});
//To listen for "addneuron" message sent from the main add-on code
self.port.on("addneuron", function onMessage(selectionText) {
	textNeuron.value = selectionText;
	localStorage.setItem("neuronStorage", selectionText);
});
//To listen for "addaxon" message sent from the main add-on code
self.port.on("addaxon", function onMessage(selectionText) {
	textAxon.value = selectionText;
	localStorage.setItem("axonStorage", selectionText);
	textAxon.focus();
});