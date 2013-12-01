var axon = require('axon')
  , sub = axon.socket('sub')
  , pub = axon.socket('pub');

var l2_port=0;

//建立与coordinator之间的链接
//=============================================================
var rpc = require('axon-rpc')
  , axon = require('axon')
  , req = axon.socket('req');

var client = new rpc.Client(req);
req.connect(5000);

var getL2node=function(){
//=============================================================
//从中心配置那边得到L2层的一个列表
//===================================================
    client.call('getL2',function(err,l2_list){
      if(!err){
          console.log(l2_list);
          l2_port=l2_list.pop();
          sub.connect(l2_port);
      }else{
        console.log("err");
      }
    });
}//===================================================


getL2node();

var l3_port  = 3031;
var onStared = 0;

sub.on("connect",function(){
  console.log("connections established...with port:"+l2_port);
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
    getL2node();
  }else{
      if(onStared===0){
        pub.bind(l3_port);
      console.log('l3_0 pub server started on:'+l3_port);
      onStared=1;
    }else{
      pub.send(msgString);
    }
  }//end of max connections..
});//END of on meassge