var self = require("sdk/self");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var selection = require("sdk/selection");
var contextMenu = require("sdk/context-menu");
var { Hotkey } = require("sdk/hotkeys");

//Add popup panel
var add_form = require("sdk/panel").Panel({
  contentURL: data.url("add-form.html"),
  contentScriptFile: data.url("get-text.js"),
  height: 310,
  width: 360
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
  label: "Style Tab",
  icon: {
    "16": "./16x16.png",
    "32": "./32x32.png",
    "64": "./64x64.png"
  },
  onClick: handleClick
});

//click event handler
function handleClick(state){
	add_form.show({
		position:button
	});
}
//Registering an event handler "show"
add_form.on("show", function(){
	//send message "show" to script "get-text.js"
	add_form.port.emit("show");
});

//send event "hide" sript
add_form.on("hide", function(){
  //send message "hide" to script "get-text.js"
  add_form.port.emit("hide");
});

//Receive "text-entered" event from a script
add_form.port.on("text-entered", function(text){

	if ( (text[0])!= "" && (text[1])!="") {
      openNeuron(text);
      add_form.hide();
    }

});

//Creates context menu
//The item - Adds the selected text in neuron field
var menuItem1 = contextMenu.Item({
  label: "Add the selected text as neuron",
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
  image: self.data.url("text-16x16.png"),
  accessKey: "n",
  onMessage: function(selectionText){
	//  openNeuron(selectionText);
//    var text = selectionText;
    add_form.port.emit("addneuron",  selectionText);
    add_form.show({position:button});
  }
});
//The item - Adds the selected text in axon field
var menuItem2 = contextMenu.Item({
    label: "Add the selected text as axon",
    context: contextMenu.SelectionContext(),
    contentScript: 'self.on("click", function () {' +
    '  var text = window.getSelection().toString();' +
    '  self.postMessage(text);' +
    '});',
    image: self.data.url("link-16x16.png"),
    onMessage: function(selectionText){
        //  openNeuron(selectionText);
//    var text = selectionText;
        add_form.port.emit("addaxon",  selectionText);
        add_form.show({position:button});
    }
});
//The item - Adds the current page url in axon field
var menuItem3 = contextMenu.Item({
    label: "Add page as axon",
    contentScript: 'self.on("click", function (node, data) {' +
    '  self.postMessage(document.URL);' +
    '});',
    image: self.data.url("link-16x16.png"),
    onMessage: function (pageURL) {
        add_form.port.emit("addaxon",  pageURL);
        add_form.show({position:button});
    }
});
//The item - Adds the image path when the menu is invoked on an image
var menuItem4 = contextMenu.Item({
    label: "Add image as axon",
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
//The item - Adds the link when the menu is invoked on a link
var menuItem5 = contextMenu.Item({
    label: "Add link as axon",
    image: self.data.url("link-16x16.png"),
    context:  contextMenu.SelectorContext("a[href]"),
    contentScriptFile: data.url('add-link.js'),
    onMessage: function(href){
        add_form.port.emit("addaxon",  href);
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
    label: "Search With",
    image: self.data.url("16x16.png"),
    context: contextMenu.SelectionContext(),
//    contentScriptFile: data.url('search.js'),
    contentScript: 'self.on("click", function (node, data) {' +
    '  var searchURL = data + window.getSelection().toString();' +
    '  window.location.href = searchURL;' +
    '});',
    items: [googleItem, wikipediaItem, livaravaItem]
});


//Opens in new tab "livarava.com" and searches text from a neuron field.
function openNeuron(someText) {
	tabs.open({
		url: "http://dev.livarava.com/neuron/new/?title="+someText[0],
		onReady: function onReady(tab){
            transmitAxon(someText[1]);
        }
	});
}
//Sends an event "openNeuron" to the "my-script.js" with parameter (text or link) from axon fild
function transmitAxon(text){
	var worker = tabs.activeTab.attach({
		contentScriptFile: self.data.url("autofillscript.js")
	});
	worker.port.emit("openNeuron", text);
}
