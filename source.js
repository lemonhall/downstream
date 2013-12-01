var axon = require('axon')
  , sock = axon.socket('pub');

//建立与coordinator之间的链接
//=============================================================
var rpc = require('axon-rpc')
  , axon = require('axon')
  , req = axon.socket('req');

var client = new rpc.Client(req);
req.connect(5000);
//===================================================

var source_port=3000;

sock.bind(source_port);

console.log('0 source pub server started');
client.call('setSource',source_port, function(err){
  if(!err){

  }
});


var n=0;
setInterval(function(){
  n=n+1;
  sock.send('hello '+n);
}, 2000);


sock.on('message', function(msg){
  var msgString = msg.toString()
  console.log(msgString);
});//END of on meassge


var c=0;

//建立计数器，如果链接的peers的数目大于预设值则单独向那个新进来的peer单独发送refuse消息
sock.on("connect",function(){
	//console.log(sock.socks[c]);
	console.log("connection:"+c+" is connecting===============================");
	if(c>1){
		var peer=sock.socks[c];
		peer.write(this.pack("refuse"));
		//coor_push.send("I refuse number:"+c+" connection");
		//if (peer.writable) peer.write("refuse");
		//peer.destroy();
	}
	c=c+1;
});

sock.on("disconnect",function(){
	c=c-1;
	console.log("connection:"+c+" is disconnecting");
	//coor_push.send("connection:"+c+" is disconnecting");
});