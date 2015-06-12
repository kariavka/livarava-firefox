self.port.on("prefill", function() {
	console.log("in prefill func, title - "+ document.title + " url - "+ document.URL);
	self.port.emit("prefilled", [document.title, document.URL]);
});
