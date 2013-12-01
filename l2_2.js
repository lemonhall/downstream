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

//不管怎样，都要清算掉资源啊，否则。。。就要让大家用协作算法把资源回收回去了
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  node.unregNode();
  process.exit(1);
});