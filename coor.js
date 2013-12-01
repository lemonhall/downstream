var rpc = require('axon-rpc')
  , axon = require('axon')
  , rep = axon.socket('rep');

var server = new rpc.Server(rep);
rep.bind(5000);


var source_port  = 0;
var port_init = 3000;
var l2_list		 = [];
var l2_busy		 = [];
var l3_list		 = [];

var node_list    = [];


var setSource = function(s,cb){
	source_port=s;
	console.log(source_port);
	cb(null);
};
var getSource = function(cb){
	console.log("getSource:"+source_port);
	cb(null,source_port);
};

var checkExist=function(s){
	var index=node_list.indexOf(s);
	if (index > -1) {
		return 1;
	}else{
		return 0;
	}
}

var getUUID=function(s){
	console.log("getUUID GOT arg:"+s);
	if (s===0){
		console.log("getUUID it's a new node");
		port_init=port_init+1;
		if(checkExist(port_init)){
			port_init=port_init+1;
			return port_init;
		}else{;
			return port_init;
		}
	}

	if(checkExist(s)) {
		port_init=port_init+1;
		getUUID(port_init);
		console.log("getUUID exist..return.."+port_init);
		return port_init;

	}else{
		console.log("getUUID it's not exist..return.."+s);
		console.log(node_list);
		return s;
	}
}

//注册一个节点
var regNode = function(auth,cb){
	console.log(auth);
	var r=getUUID(auth);
		node_list.push(r);
		cb(null,r);
	console.log(node_list);

};

//注销一个L节点
var unregNode = function(s,cb){
	console.log("unregNode:"+s);

	var index=node_list.indexOf(s);
	if (index > -1) {
		console.log("I found it...");
    		node_list.splice(index, 1);
    	console.log(node_list);
    	cb(null);
	}else{
		console.log("I couldn't found it");
		cb(null,1);
	}
};

//得到一个节点列表
var getNode = function(cb){
	cb(null,node_list);
};

//将自己设置为忙
var setBusy = function(s,cb){
	console.log("busyL2:"+s);

	var index=l2_list.indexOf(s);
	if (index > -1) {
		console.log("I found it...");
    		l2_list.splice(index, 1);
    	console.log(l2_list);
    	l2_busy.push(s);
    	cb(null);
	}else{
		console.log("I couldn't found it");
		cb("node not exist");
	}
};

server.expose({
	"setSource" : setSource,
	"getSource" : getSource,
	"regNode"	: regNode,
	"unregNode"	: unregNode,
	"getNode"	: getNode,
	"setBusy"	: setBusy
});