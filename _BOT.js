var cheerio    = require("cheerio");
var request    = require("request");
var fs=require("fs");
require("./dateFormat.js")();

module.exports=function(HTTP_SERVER){
	var io = require("socket.io").listen(HTTP_SERVER);
	var gScoket; 
	
	io.sockets.on('connection',function(socket){
		gScoket=socket;
		OnSocket();
	});

	//웹소켓
	function OnSocket(){ //gSocket 객체가 로드된 이후 시점.
	}
/*
	var chatURL="https://chat.cafe.naver.com/room/26686242/tibyte:1467632762888?ssId=3";

	var cafeId=chatURL.split("/room/")[1].split("/")[0];;
	var roomId=chatURL.split("/room/")[1].split("/")[1].split("?")[0];
	var roomNo=roomId.split(':')[1];

	var ready_ProcComt=[];
	var lastId=-Infinity;
*/

	Array.prototype.push=function(val){	this[this.length]=val;}
	Array.prototype.last=function(){return this[this.length-1];}

	//로그인 세션
	var loginSession="";
	function ProcessingComments(Info){
		var chatURL=Info.chatURL;
		if(!chatURL){
			return;
		}

		var cafeId =Info.cafeId;
		var roomId =Info.roomId;
		var roomNo =Info.roomNo;
		if(!cafeId || !roomId || !roomNo){
			cafeId=chatURL.split("/room/")[1].split("/")[0];
			roomId=chatURL.split("/room/")[1].split("/")[1].split("?")[0];
			roomNo=roomId.split(':')[1];
		}
		var lastId =Info.lastId;
		if(isNaN(lastId)){
			lastId=-Infinity;
		}
		var ready_ProcComt=Info.ready_ProcComt;
		if(!ready_ProcComt){
			ready_ProcComt=[];
		}

		var headers={
				'Referer':"https://chat.cafe.naver.com/room/"+cafeId+"/"+roomId+"?ssId=1",
				'Cookie':loginSession
			};

		//Request
		var Command_req={
			method:'post',
			url:"https://chat.cafe.naver.com/api/Command.nhn",
			headers:headers,
			body:{"ver":1,"uid":"","tid":roomNo,"sid":"","deviceType":,"cmd":,"bdy":{"cafeId":cafeId,"roomId":roomId,"updateTimeSec":0,"size":10}},
			json:true
		};

		request(Command_req,function(err,response,data){
			if(err){
				return;
			}
			var msgList=data.bdy.msgList;
			
			if(!Array.isArray(msgList)){
				return;
			}

			for(var i=msgList.length-1; i>=0; i--){
				var msg=msgList[i].msg;
				var id =msgList[i].msgSn;
				
				if(msg.substring(0,1)=="#" && lastId < id){

					ready_ProcComt.push({
						nickname:msgList[i].senderNickname,
						id:id,
						msg:msg.substring(1,msg.length)
					});
				}
			}
			for(var i=ready_ProcComt.length-1; i>=0; i--){
				var target=ready_ProcComt[i];
				console.log(target);
				switch(target.msg){
					case '날짜':
					case '시간':
						writeComment(chatURL,new Date().format("yyyy년 MM월 dd일 HH시 mm분"));
						break;
					case '':
				}
				lastId=ready_ProcComt.pop().id;
			}

			var _Info={
				chatURL:chatURL,
				cafeId:cafeId,
				roomId:roomId,
				roomNo:roomNo,
				ready_ProcComt:ready_ProcComt,
				lastId:lastId
			};
			setTimeout(function(){
				ProcessingComments(_Info);
			},500); // 함수 완료 후 , 0.5 초 뒤에 재귀
		});
	}

	function writeComment(URL,msg){
		var chatURL=URL;
		var cafeId=chatURL.split("/room/")[1].split("/")[0];
		var roomId=chatURL.split("/room/")[1].split("/")[1].split("?")[0];
		var roomNo=roomId.split(':')[1];

		var headers={
				'Referer':"https://chat.cafe.naver.com/room/"+cafeId+"/"+roomId+"?ssId=1",
				'Cookie':loginSession
		};

		var Command_req={
			method:"post",
			url:"https://chat.cafe.naver.com/api/Command.nhn",
			json:true,
			headers:headers,
			body:{
				"ver":1,"uid":"softislive","tid":"1483412107643","sid":"pBu!TrfOAeah!EgI3Gj!k32ZeQSR_M8Wtyelf5AJE_0-","deviceType":2001,"cmd":3001,
				"bdy":{"cafeId":cafeId,"roomId":roomId,"msgId":"1483412107643","msgType":0,"msg":msg}
			}
		};
		request(Command_req,function(err,response,data){
			if(err){
				return;
			}
		});
	}

//카페주소
	ProcessingComments({chatURL:"https://chat.cafe.naver.com/room/"});
	ProcessingComments({chatURL:"https://chat.cafe.naver.com/room/"});

}