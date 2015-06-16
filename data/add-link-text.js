self.on("click", function (node, data) {
	self.postMessage([node.textContent, node.href]);
});