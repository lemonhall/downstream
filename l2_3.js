var axon = require('axon')
  , sub = axon.socket('sub')
  , pub = axon.socket('pub')
  , fs      = require('fs');

var source_port=0;

//建立与coordinator之间的链接
//=============================================================
var rpc = require('axon-rpc')
  , axon = require('axon')
  , req = axon.socket('req');

var client = new rpc.Client(req);
req.connect(5000);
//从中心配置那边得到源地址
//===================================================
client.call('getSource',function(err,source_port){
  if(!err){
  	
  	if(source_port!=0){
  		console.log("I am connect to source_port:"+source_port);
  		sub.connect(source_port);
  	}else{
  		console.log("ERR,getSource:"+source_port+" is wrong....");
  	}
  }else{
  	console.log("fasdfasdf");
  }
});
//===================================================

var l2_port  = 0;
var onStared = 0;

//从配置中读出上次服务器给分配好的ID
//====================================================
var auth 	 	  = 3001;
var pname 		  = process.argv[1];

fs.readFile(pname+".json", function (err, data) {
  if (!err){
  	auth = parseInt(data);
  	console.log(auth);
  	console.log("向中心配置那边配置一个l2的地址:"+auth);
	//向中心配置那边配置一个l2的地址
	//===================================================
	client.call('regNode',auth,function(err,port){
	  if(!err){
	  	
	  	if(port!=0){
	  		console.log("I get a pub port of "+port);
	  		l2_port=port;
	  		sub.emit("port ready");
	  	}else{
	  		console.log("ERR,regL2:"+port+" is wrong....");
	  	}
	  }else{
	  	console.log("fasdfasdf");
	  }
	});
	//===================================================
  }
});
	
var unregNode=function(){
    var pname=process.argv[1];
	fs.writeFileSync(pname+".json", l2_port);

	//===================================================
	client.call('unregNode',l2_port,function(err){
	  if(!err){

	  }else{
	  	console.log(err);
	  }
	});
	//===================================================
}

//====================================================

sub.on("port ready",function(){
		console.log("prtttt.as.df.asdf");
		console.log(l2_port);
		//var peer=sub.socks[0];
			//peer.write(this.pack(l2_port.toString()));
});

sub.on("connect",function(){
	console.log("connections established...");

});

//监听了CTRL+C
process.on('SIGINT', function() {
  console.log('Got SIGINT.  Press Control-D to exit.');
  unregNode();
  process.exit(1);
});

sub.on("reconnect attempt",function(){
	console.log("reconnect attempt");
});


sub.on("disconnect",function(){
	console.log("connections end...");
	unregNode();
});


sub.on('message', function(msg){
  var msgString = msg.toString()
  console.log(msgString);

  if(msgString=="refuse"){
  	sub.close();
  	console.log("server max");
  	unregNode();
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
			//超过了连接数，就将自己设置为忙
			//===================================================
			client.call('setBusy',l2_port,function(err){
			  if(!err){

			  }else{
			  	console.log(err);
			  }
			});
			//===================================================
	}
	c=c+1;
});

pub.on("disconnect",function(){
	c=c-1;
	console.log("connection:"+c+" is disconnecting");
});