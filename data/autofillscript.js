// "self" is a global object in content scripts
// Listen for a "openNeuron"
//Adds axon into the neuron-it form
self.port.on("openNeuron", function(somevalue) {
  document.getElementById("neuron-modal-form-input").value = somevalue;

});