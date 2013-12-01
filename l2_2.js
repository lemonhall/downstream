var axon = require('axon')
  , sub = axon.socket('sub')
  , pub = axon.socket('pub');

var Node = require("./node_h.js");

var node = new Node(sub,pub);

node.on("getSourceReady",function(data){
	console.log("ongetSourceReady");
	//node.regNode();
});


node.on("regNodeReady",function(data){

});

//监听了CTRL+C
process.on('SIGINT', function() {
  console.log('Got SIGINT.  Press Control-D to exit.');
  node.unregNode();
  process.exit(1);
});