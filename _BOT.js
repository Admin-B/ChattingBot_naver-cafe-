var request    = require("request");
var fs=require("fs");
require("./dateFormat.js")();

module.exports=function(HTTP_SERVER){
	Array.prototype.push=function(val){	this[this.length]=val;}
	Array.prototype.last=function(){return this[this.length-1];}

	const loginSession="";
	const naverID="";
	const sID="";
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
			body:{"ver":1,"uid":naverID,"tid":roomNo,"sid":sID,"deviceType":2001,"cmd":1006,"bdy":{"cafeId":cafeId,"roomId":roomId,"updateTimeSec":0,"size":10}},
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

				var msg=target.msg.split(" ");

				switch(msg[0]){
					case '날짜':
					case '시간':
						writeComment(chatURL,new Date().format("yyyy년 MM월 dd일 HH시 mm분"));
						break;
					case '이미지':

						uploadImage(msg[1],function(err){
							if(err){
								writeComment(chatURL,target.nickname+"님이 요청하신 파일은 올바르지 않은 이미지 주소입니다.");
								return;
							}
							writeComment(chatURL,this);
						});			
						break;				
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
	
		var msgType=0;

		if(typeof msg=="object"){
			msg=msg;
			msgType=301;
		}
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
				"ver":1,"uid":naverID,"tid":roomNo,"sid":sID,"deviceType":2001,"cmd":3001,
				"bdy":{"cafeId":cafeId,"roomId":roomId,"msgId":"","msgType":msgType,"msg":msg}
			}
		};
		request(Command_req,function(err,response,data){
			if(err){
				return;
			}
		});
	}

	var MAX_TEMP_IMAGE_COUNT=100; //임시저장 이미지의 최대 허용치를 지정합니다.
	var TEMP_IMAGE_INDEX=0;
	function uploadImage(src,callback){
		request(src,function(err,res,data){
			if(data.length>50000000){
				throw '업로드 하려는 파일의 크기가 한도를 초과하였습니다.';
			}
			var extname=res.headers['content-type'].split("/")[1];
	
			savePath=__dirname+"/resource/img/_T"+TEMP_IMAGE_INDEX+"."+extname;

			TEMP_IMAGE_INDEX++;
			if(TEMP_IMAGE_INDEX>=MAX_TEMP_IMAGE_COUNT){
				TEMP_IMAGE_INDEX=0;
			}

			request(src).pipe(fs.createWriteStream(savePath)).on('close',function(){
				var req={
					method:"post",
					url:"https://up.cafe.naver.com/AttachChatPhotoForJindoUploader.nhn",
					json:true,
					headers:{
					'Cookie':loginSession,
					},
					formData:{
						photo:{
							value:fs.createReadStream(savePath),
							options:null
						},
						callback:'/html/AttachImageDummyCallback.html',
						callback_func:Math.floor(Math.random()*10000)+'_func'
					}
				};

				request(req,function(err,res,data){
					if(err){
						return;
					}
					var temp=data.split('"savedPath":"')[1];
					if(!temp){return}
					var savedPath=temp.split('","width"')[0];

					temp=temp.split('"width":')[1];

					var width   =temp.split(',\"')[0];

					temp=temp.split('"height":')[1];
					var height  =temp.split(',"')[0];
					temp=temp.split('"size":')[1]
					var size    =temp.split(',"')[0];

					if(typeof callback=="function"){
						callback.apply({
							fileSize:Number(size),
							width:Number(width),
							height:Number(height),
							path:savedPath
						});
					}
				});

			}).on('error',function(){
				callback(true);
			});
		});
	}

	ProcessingComments({chatURL:""});
	ProcessingComments({chatURL:""});
}
