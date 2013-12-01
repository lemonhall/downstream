var axon = require('axon')
  , sub = axon.socket('sub')
  , pub = axon.socket('pub');

sub.connect(3001);

var l3_port  = 3034;
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
        pub.bind(l3_port);
      console.log('l3_3 pub server started on:'+l3_port);
      onStared=1;
    }else{
      pub.send(msgString);
    }
  }//end of max connections..
});//END of on meassge