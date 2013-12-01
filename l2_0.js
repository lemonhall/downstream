var axon = require('axon')
  , sub = axon.socket('sub')
  , pub = axon.socket('pub');

sub.connect(3000);

var l2_port  = 3001;
var onStared = 0;

sub.on("connect",function(){
	console.log("connections established...");
});

sub.on("reconnect attempt",function(){
	console.log("reconnect attempt");
});


sub.on("disconnect",function(){
	console.log("connections end...");
});


sub.on('message', function(msg){
  var msgString = msg.toString()
  console.log(msgString);

  if(msgString=="refuse"){
  	sub.close();
  	console.log("server max");
  }else{
	  	if(onStared===0){
		  	pub.bind(l2_port);
			console.log('l2_0 pub server started on:'+l2_port);
			onStared=1;
		}else{
			pub.send(msgString);
		}
  }//end of max connections..
});//END of on meassge

//===============================================================================

var c=0;

pub.on("connect",function(){
	//console.log(sock.socks[c]);
	console.log("connection:"+c+" is connecting===============================");
	if(c>2){
		var peer=pub.socks[c];
		peer.write(this.pack("refuse"));
		//if (peer.writable) peer.write("refuse");
		//peer.destroy();
	}
	c=c+1;
});

pub.on("disconnect",function(){
	c=c-1;
	console.log("connection:"+c+" is disconnecting");
});