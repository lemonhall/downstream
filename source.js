var axon = require('axon')
  , sock = axon.socket('pub');

sock.bind(3000);
console.log('0 source pub server started');

var n=0;
setInterval(function(){
  n=n+1;
  sock.send('hello '+n);
}, 2000);


var c=0;

sock.on("connect",function(){
	//console.log(sock.socks[c]);
	console.log("connection:"+c+" is connecting===============================");
	if(c>2){
		var peer=sock.socks[c];
		peer.write(this.pack("refuse"));
		//if (peer.writable) peer.write("refuse");
		//peer.destroy();
	}
	c=c+1;
});

sock.on("disconnect",function(){
	c=c-1;
	console.log("connection:"+c+" is disconnecting");
});