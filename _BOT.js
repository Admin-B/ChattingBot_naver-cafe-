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

	var loginSession="NNB=7OWJO2H6CZSVQ; npic=GZdaUzAwcXeK4TdPtLsQcY96hGWSjdbG2CFDaSRrpXIeIVUKkDGxr1u8nI5Pb35FCA==; nx_ssl=2; orprom=1; nid_inf=-358595400; ncu=9ab35d66683848ffcb387c435898d2f0374b921f9e; nci4=0b3addfae7a9c0742dc384939e751867ddb74783f094b0219f0b6adf01255c8f40ba13c30127ae8cdc6605c842df5da573507c64a99ed7d8da228755b3a42fa1b8b792b582a4beb198bf8cc2b5b880a391d1a2ad8cab98d79897b292a091929abd99b6fbfafafffcfffff2838aad88c68b8de2828980ec9b86f7849b69; personaconmain|softislive=EAE11B32508CF3CEAA06E652439E1F258021DB49C01B594318767A543203FB65; personacon|softislive=F28437E39779FC486267E00E95B4D5B93FC4000403616BCCF6304CF0735D4D92; emoticon=emo11; ncmc4=8bba5d7a672940f4ad4304131ef593e3511efa07571cee16e4061dfb725fb25db46499478d97203c05e8b54dd347c400d1d1dcfd3010717e6a9f71ab4d; BMR=; NID_AUT=NuJDEA2I1kmDaHMefo02E9/QXO4VrF0xeiYhQRT1G6+vqSfGg4iUom1th+AcE3nViyLu/Fz7Oz6OoLtQJN8W4TT/DaySdaul2HETNcn3otSpJolBcxpA1aeneW2CV7Xx; JSESSIONID=69B9BB6236665848CC834331CD5B33EA; NID_SES=AAABYL2vYfiKC3D1r862UeJrgP6HZ8FY4eHsxpsqU1A7Kl2iCs16JS5qgACiBj9vDgUAaDFp+Qh345Mw3XLFqDN7UMOb8q5+IMJGVG/U46WDtAO6PhBfaZ1SAsCac9cB+DyVVa0zJsD22UDzdi8A7xSF5bE4QMZcX5FXqtJh7VuPVtfaD6x2hWjsDCZioslsW8IC6BtOny3LZeqUMFImRL+Jvi5WgAynbxlbxD65AFX4dNNyCeWscM6RJtYkW3WvnsB0us+9OufBTMXsGaPIGONywSCwyndc4tmiDCoN61Ho7cX9ljSE8Iao/Y2ZvnR656FjxhmOQpJ0T51sd4TAMgczKzFiye8R4mcv5Ij3POaoFoVH1ZJJn69v6CI1OFJNHsehhBh7S1tIJeremWyAocKYxHdiRiBiN6h36mmckOXwMfmwSChIXBcIFb5deWh4p9uENW4D5Ach8JqHJ7Spw2SS6HM=; page_uid=TbpAYspydfhssugl5BKssssssZR-127399";

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
			body:{"ver":1,"uid":"softislive","tid":roomNo,"sid":"pBu!TrfOAeah!EgI3Gj!k8ZmLyEc2_VabBZvCjNMfJ8-","deviceType":2001,"cmd":1006,"bdy":{"cafeId":cafeId,"roomId":roomId,"updateTimeSec":0,"size":10}},
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

	ProcessingComments({chatURL:"https://chat.cafe.naver.com/room/26686242/tibyte:1467632762888?ssId=3"});
	ProcessingComments({chatURL:"https://chat.cafe.naver.com/room/26686242/tibyte:1458357117900?ssId=1"});

}