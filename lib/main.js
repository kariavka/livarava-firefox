var self = require("sdk/self");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var selection = require("sdk/selection");
var contextMenu = require("sdk/context-menu");
var { Hotkey } = require("sdk/hotkeys");
var pageWorkers = require("sdk/page-worker");
//find localization string for current local
var _ = require("sdk/l10n").get;

//Run autorization script
var pageMod = require("sdk/page-mod");



//Run close panel script
// This content script sends header titles from the page to the add-on:

console.log("**********************load page********************");

/*
pageMod.port.on("first-para", function(firstPara) {
	console.log("Authorization: " + firstPara[0]+ "str: "+ firstPara[1]);
	if (firstPara[0] == "no"){
		require("sdk/tabs").open("http://www.livarava.com/signin/");
	}
});
// Create a page worker that loads 

pageWorker = require("sdk/page-worker").Page({
	contentURL: "http://www.livarava.com/profile/",
	contentScriptFile: self.data.url("authorization.js"),
	contentScriptWhen: "end"
});

pageWorker.port.on("first-para", function(firstPara) {
  console.log("Authorization: " + firstPara[0]+ "nodeName: "+ firstPara[2]);
    if (firstPara[0] == "yes"){
		pageWorker.destroy();
		openNeuron(firstPara[1]);
		add_form.hide();
  }
  else {
	  console.log("go to authorization page...!!!!!");
	  add_form.hide();
	  pageWorker.destroy();
	  require("sdk/tabs").open("http://www.livarava.com/signin/");
  }
});
*/



pageMod.PageMod({
	include: "*.livarava.com",
	contentScriptWhen: 'end',
	contentScriptFile: data.url("closePanel.js"),
	onMessage: function(message) {
		console.log(message);
	}
});

//disable or uninstall addon
pageMod.PageMod({
  include: "*",
  contentScriptFile: data.url("reset-panel-storage.js"),
  onMessage: function(message) {
	console.log(message);
	if (window.localStorage.getItem("download-browser-extension-dismiss")){
		window.localStorage.removeItem("download-browser-extension-dismiss");
	}
  }
});

//pageWorkers.destroy();

//Add popup panel
var add_form = require("sdk/panel").Panel({
  contentURL: data.url("add-form.html"),
  contentScriptFile: data.url("get-text.js"),
  height: 328,
  width: 356
});

//Define hotkey
var showHotKey = Hotkey({
  combo: "alt-shift-n",
  onPress: function() {
 //   doSomething();
  }
});

//Action button constructor
var button = require("sdk/ui/button/action").ActionButton({
  id: "style-tab",
  label: "LivaRava extension",
  icon: {
    "16": "./16x16.png",
    "32": "./32x32.png",
    "64": "./64x64.png"
  },
  onClick: handleClick
});

//click event handler
function handleClick(state){
	var prefill = tabs.activeTab.attach({
		contentScriptFile: self.data.url("prefill.js")});
	prefill.port.emit("prefill");
	//Receive "prefilled" event from a script - prefill.js
	prefill.port.on("prefilled", function(text){
		console.log("received from prefill.js");
		console.log("prefilled " + text[0]+" "+text[1]);
		add_form.port.emit("prefillpopup", [text[0], text[1]]);
	});
	
	add_form.show({	position:button	});
}




//Registering an event handler "show"
add_form.on("show", function(){
	//send message "show" to script "get-text.js"
	add_form.port.emit("show",[_("addNeuronHere"), _("addAksonHere"), _("neuronIt") ]);
});

//send event "hide" sript
add_form.on("hide", function(){
  //send message "hide" to script "get-text.js"
  add_form.port.emit("hide");
});

//Receive "text-entered" event from a script
add_form.port.on("text-entered", function(text){
//only one (Neuron) parameter is required
	add_form.hide();
	openNeuron(text[0], text[1]);
//	checkAuthorization(text[0], text[1]);
});

//Receive "text-required" event from a script
add_form.port.on("empty-neuron", function(){
//	console.log("empty-neuron recieved");
	add_form.port.emit("alert-neuron", _("neuronParameterIsRequired"));
});

//open new tab with home site url
add_form.port.on("go-home", function(){
	tabs.open({
		url: "http://www.livarava.com"
	});	
    add_form.hide();
});

//Creates context menu
//The item - Adds the current page title in neuron field, url in axon fild
var menuItem1 = contextMenu.Item({
    label: _("addPage"),
    contentScript: 'self.on("click", function (node, data) {' +
    '  self.postMessage([document.title, document.URL]);' +
    '});',
    image: self.data.url("Page-16x16.png"),
    onMessage: function (pageInfo) {
        add_form.port.emit("prefillpopup", [pageInfo[0], pageInfo[1]]);
        add_form.show({position:button});
    }
});
//The item - Adds the selected image title (or alt, or page title) in neuron field, src in axon fild
var menuItem2 = contextMenu.Item({
    label: _("addImage"),
    context: contextMenu.SelectorContext("img"),
    contentScript: 'self.on("click", function (node, data) {' +
	'var aboutImage;'+
	'if (node.title !="") {aboutImage = node.title;}'+
	'else if (node.alt !="") {aboutImage = node.alt;}'+
	'else aboutImage = document.title;'+
    'self.postMessage([aboutImage, node.src]);' +
    '});',
    image: self.data.url("Image-16x16.png"),
    onMessage: function (imgSrc) {
        add_form.port.emit("prefillpopup", [imgSrc[0], imgSrc[1]]);
        add_form.show({position:button});
//        console.log(imgSrc);
    }
});
//The item - Adds the selected link title in neuron field, src in axon fild
var menuItem3 = contextMenu.Item({
    label: _("addLink"),
    context:  contextMenu.SelectorContext("a[href]"),
	contentScriptFile: data.url('add-link-text.js'),
    image: self.data.url("Link2-16x16.png"),
    onMessage: function (imgSrc) {
        add_form.port.emit("prefillpopup", [imgSrc[0], imgSrc[1]]);
        add_form.show({position:button});
//        console.log(imgSrc);
    }
});

//The item - Adds the selected text in neuron field
var menuItem4 = contextMenu.Item({
  label: _("addSelected")+" "+_("asNeuron"),
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
  image: self.data.url("text-16x16.png"),
  onMessage: function(selectionText){
	//  openNeuron(selectionText);
//    var text = selectionText;
    add_form.port.emit("addneuron",  selectionText);
    add_form.show({position:button});
  }
});
//The item - Adds the selected text in axon field
var menuItem5 = contextMenu.Item({
    label: _("addSelected")+" "+_("asAxon"),
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function () {' +
    '  var text = window.getSelection().toString();' +
    '  self.postMessage(text);' +
    '});',
    image: self.data.url("text-16x16.png"),
    onMessage: function(selectionText){
        //  openNeuron(selectionText);
//    var text = selectionText;
        add_form.port.emit("addaxon",  selectionText);
        add_form.show({position:button});
    }
});
//The item - Adds the current page url in axon field
var menuItem6 = contextMenu.Item({
    label: _("addPage")+" "+_("asAxon"),
    contentScript: 'self.on("click", function (node, data) {' +
    '  self.postMessage(document.URL);' +
    '});',
    image: self.data.url("link-16x16.png"),
    onMessage: function (pageURL) {
        add_form.port.emit("addaxon",  pageURL);
        add_form.show({position:button});
    }
});
//The item - Adds the current page url in neuron field
var menuItem7 = contextMenu.Item({
    label: _("addPage")+" "+_("asNeuron"),
    contentScript: 'self.on("click", function (node, data) {' +
    '  self.postMessage(document.URL);' +
    '});',
    image: self.data.url("link-16x16.png"),
    onMessage: function (pageURL) {
        add_form.port.emit("addneuron",  pageURL);
        add_form.show({position:button});
    }
});
//The item - Adds the image path as axon when the menu is invoked on an image
var menuItem8 = contextMenu.Item({
    label: _("addImage")+" "+_("asAxon"),
    context: contextMenu.SelectorContext("img"),
    contentScript: 'self.on("click", function (node, data) {' +
    '  self.postMessage(node.src);' +
    '});',
    image: self.data.url("link-16x16.png"),
    onMessage: function (imgSrc) {
        add_form.port.emit("addaxon",  imgSrc);
        add_form.show({position:button});
//        console.log(imgSrc);
    }
});
//The item - Adds the image path as neuron when the menu is invoked on an image
var menuItem9 = contextMenu.Item({
    label: _("addImage")+" "+_("asNeuron"),
    context: contextMenu.SelectorContext("img"),
    contentScript: 'self.on("click", function (node, data) {' +
    '  self.postMessage(node.src);' +
    '});',
    image: self.data.url("link-16x16.png"),
    onMessage: function (imgSrc) {
        add_form.port.emit("addneuron",  imgSrc);
        add_form.show({position:button});
//        console.log(imgSrc);
    }
});
//The item - Adds the link when the menu is invoked on a link
var menuItem10 = contextMenu.Item({
    label: _("addLink")+" "+_("asAxon"),
    image: self.data.url("link-16x16.png"),
    context:  contextMenu.SelectorContext("a[href]"),
    contentScriptFile: data.url('add-link.js'),
    onMessage: function(href){
        add_form.port.emit("addaxon",  href);
        add_form.show({position:button});
//        require("sdk/tabs").open("http://livarava.com#" + href);
    }
});
//The item - Adds the link when the menu is invoked on a link

var menuItem11 = contextMenu.Item({
    label: _("addLink")+" "+_("asNeuron"),
//  label: "Add link as neuron",	
    image: self.data.url("link-16x16.png"),
    context:  contextMenu.SelectorContext("a[href]"),
    contentScriptFile: data.url('add-link.js'),
    onMessage: function(href){
        add_form.port.emit("addneuron",  href);
        add_form.show({position:button});
//        require("sdk/tabs").open("http://livarava.com#" + href);
    }
});

/*Creates Search menu and adds three items
  The item "Google" - It searches the selected text in "Google"
  The item "Wikipedia" - It searches the selected text in "Wikipedia"
  The item "Livarava" - It searches the selected text in "Livarava"*/
var googleItem = contextMenu.Item({
    label: "Google",
    data: "http://www.google.com/search?q="
});
var wikipediaItem = contextMenu.Item({
    label: "Wikipedia",
    data: "http://en.wikipedia.org/wiki/Special:Search?search="
});
var livaravaItem = contextMenu.Item({
    label: "Livarava",
    data: "http://www.livarava.com/#"
});
var searchMenu = contextMenu.Menu({
    label: _("searchIn"),
    image: self.data.url("16x16.png"),
    context: contextMenu.SelectionContext(),
//    contentScriptFile: data.url('search.js'),
    contentScript: 'self.on("click", function (node, data) {' +
    '  var searchURL = data + encodeURIComponent(window.getSelection().toString());' +
    '  window.location.href = searchURL;' +
    '});',
    items: [googleItem, wikipediaItem, livaravaItem]
});

//var tabs = require("sdk/tabs");
//Opens in new tab "livarava.com" and searches text from a neuron field.
function openNeuron(liva, rava) {
	var currentURL = "http://www.livarava.com/neuron/new/?liva="+encodeURIComponent(liva)+"&rava="+encodeURIComponent(rava);
	tabs.open({
		url: currentURL,
		onReady: function (tab){
			if (rava != "")
				checkAuthorization(currentURL);
        }
	});
}

function checkAuthorization(currentURL){
	var worker = tabs.activeTab.attach({
		contentScriptFile: self.data.url("authorization.js")
	});
	worker.port.emit("get-user");
	worker.port.on("my-script-response", function(authoriz) {
		console.log(authoriz);
		if (authoriz=="no") {
			tabs.activeTab.close();
			tabs.open({
				url: "http://www.livarava.com/signin/",
				onReady: function (tab){
					doAuthorized(currentURL);
				}
			});
		}
	});
}

function doAuthorized(currentURL){
	var worker = tabs.activeTab.attach({
		contentScriptFile: self.data.url("authorization.js")
	});
	worker.port.emit("get-user");
	worker.port.on("my-script-response", function(authoriz) {
		console.log("do authorized: "+authoriz);
		if (authoriz=="yes"){
			tabs.activeTab.close();
			tabs.open(currentURL);
		}
	});
}


/*
function checkAuthorization(neuron, axon){
	pageMod.PageMod({
		include: "*.livarava.com",
		exclude: "http://livarava.com/signin",
		contentScriptWhen: 'end',
		contentScriptFile: data.url("authorization.js"),
		onMessage: function(authoriz) {
					console.log("before refer");
					if (authoriz=="yes"){
						console.log("authorization: "+authoriz);
					}
					else{
						console.log("authorization: "+authoriz);
			//			add_form.hide();
						console.log("authorization: no!!!!");
						require("sdk/tabs").open("http://www.livarava.com/signin/");
						//window.location.href = "http://www.livarava.com/signin/";
					}
		}
	});
}
*/
/*
function checkAuthorization(neuron, axon){
	pageMod.PageMod({
		include: "*.livarava.com",
		exclude: "http://livarava.com/signin/",
		contentScriptFile: self.data.url("authorization.js"),
		contentScriptWhen: "end",
		onAttach: function(worker) {
			worker.port.emit("get-user");
			worker.port.on("my-script-response", function(authoriz) {
				console.log("before refer");
				if (authoriz=="yes"){
					console.log("authorization: "+authoriz);
				}
				else{
					console.log("authorization: "+authoriz);
		//			add_form.hide();
					console.log("authorization: no!!!!");
					require("sdk/tabs").open("http://www.livarava.com/signin/");
				}
			});
		}
	});
}
	
	pageMod.port.on("first", function(authoriz){
		console.log("before refer");
		if (authoriz=="yes"){
			console.log("authorization: "+authoriz);
		}
		else{
			console.log("authorization: "+authoriz);
//			add_form.hide();
			console.log("authorization: no!!!!");
			require("sdk/tabs").open("http://www.livarava.com/signin/");
		}
	
	});
	console.log("In check authorization....!!!!");
	pageMod.port.emit("get-user");
}

*/

//Sends an event "openNeuron" to the "autofillscript.js" with parameter (text or link) from axon fild
//old version