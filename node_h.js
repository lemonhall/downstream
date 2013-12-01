//建立与coordinator之间的链接
//=============================================================
var rpc = require('axon-rpc')
  , axon = require('axon')
  , req = axon.socket('req')
  , fs      = require('fs');

var util = require("util");
var events = require("events");
var client = new rpc.Client(req);
    req.connect(5000);


function Node(sub,pub){
    //console.log(sub);
    //console.log(pub);

    events.EventEmitter.call(this);
      this.l2_port  = 0;
      this.onStared = 0;
      this.sub      = sub;
      this.pub      = pub;
      this.counter  = 0;
      this.init_coord();

    //console.log(this.sub.connect());
    var self=this;

    this.sub.on("connect",function(){
      console.log("connections established...");

    });


    this.sub.on("reconnect attempt",function(){
      console.log("reconnect attempt");
    });


    this.sub.on("disconnect",function(self){
      console.log("connections end...");
      self.unregNode();
    });



    //===============================================================================
    this.pub.on("connect",function(){
        //console.log(sock.socks[c]);
        console.log("connection:"+self.counter+" is connecting===============================");
        if(self.counter>2){
          //var peer=self.pub.socks[self.counter];
          //peer.write(self.pack("refuse"));
          //self.setBusy();
          self.emit("reachMaxConnections",self.counter);
        }
          self.counter=self.counter+1;
          self.emit("newIncomingConnection",self.counter);
      });

    this.pub.on("disconnect",function(){
      self.counter=self.counter-1;
      console.log("connection:"+self.counter+" is disconnecting");
    });


    this.sub.on('message', function(msg){
        var msgString = msg.toString()
        console.log(msgString);

        if(msgString=="refuse"){
            sub.close();
            console.log("server max");
            self.unregNode();
        }else{
          if(self.onStared===0){
              self.pub.bind(self.l2_port);
              console.log('l2_0 pub server started on:'+self.l2_port);
              self.onStared=1;
              self.emit("downStreamReady");
          }else{
              self.pub.send(msgString);
              self.emit("downStreamWrite");
          }
        }//end of max connections..
    });//END of on meassge
}//END of init.....................................................

util.inherits(Node, events.EventEmitter);

Node.prototype.init_coord=function(){
    var self=this;
    //从中心配置那边得到源地址
    //===================================================
    client.call('getSource',function(err,source_port){
      if(!err){
        if(source_port!=0){
          console.log("I am connect to source_port:"+source_port);
          //console.log(self.sub);

          self.sub.connect(source_port);
          self.emit("getSourceReady",source_port);
          self.regNode();
        }else{
          console.log("ERR,getSource:"+source_port+" is wrong....");
        }
      }else{
        console.log("fasdfasdf");
      }
    });
    //===================================================
}


//if (peer.writable) peer.write("refuse");
//peer.destroy();
//超过了连接数，就将自己设置为忙
Node.prototype.setBusy=function(){
    var self=this;
  
    //===================================================
    client.call('setBusy',this.l2_port,function(err){
      if(!err){

      }else{
        console.log(err);
      }
    });
    //===================================================
    self.emit("setBusy");
}

Node.prototype.regNode=function(){
    //从配置中读出上次服务器给分配好的ID
    //====================================================
    var auth        = 3001;
    var pname       = process.argv[1];
    var self=this;

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
            self.l2_port=port;

             console.log(self.l2_port);
              var peer=self.sub.socks[0];
              if(peer){
                peer.write(self.sub.pack(self.l2_port.toString()));
              }

              self.emit("regNodeReady");
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
}

Node.prototype.unregNode=function(){
  var self=this;

  var port=self.l2_port;//self.l2_port;
  
  var pname=process.argv[1];
  fs.writeFileSync(pname+".json", self.l2_port);

  //===================================================
  client.call("unregNode",port,function(){

  });
  //===================================================
  self.emit("unregNode");
}//END of unregNode

module.exports = Node;