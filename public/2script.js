const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const leave_meeting = document.getElementById("leave-meeting")
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});





let myVideoStream;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream,"me");
  

  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });
  
  socket.on("user-connected", (userId) => {
    connectToNewUser(userId, stream);
  });
  socket.on("user-disconnected", (userId)=>{
    if(peers[userId]) peers[userId].close();
    speakText(`user ${userId} leaved`)
  });
  document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", {msg:chatInputBox.value , user:currentUserId});
        chatInputBox.value = "";
      }
    });

    document.getElementById("sendMsg").addEventListener("click",e=>{
        if(chatInputBox.value!==""){
            socket.emit("message",{
                msg:chatInputBox.value,
                user:currentUserId,
            });
            chatInputBox.value="";
        }
    });
    chatInputBox.addEventListener("focus",()=>{
        document.getElementById("chat__Btn").remove("has__new");
        pendingMsg =0;
        document.getElementById("chat__Btn").children[1].innerHTML ="Chat";
    });

    socket.on("createMessage",(message)=>{
        let li = document.createElement("li");
        if(message.user !== currentUserId){
            li.classList.add("otherUser");
            li.innerHTML =`<div><b>User(<small>${message.user}</small>):</b>${message.msg}</div>`;
        } else{
            li.innerHTML=`<div><b>Me: </b>${message.msg}</div>`;
        }

        all_messages.append(li);
        main__chat__window.scrollTop=main__chat__window.scrollHeight;
        if(message.user != currentUserId){
            pendingMsg++;
            playChatSound();
            document.getElementById(chat__Btn).classList.add("has__new");
            document.getElementById(
                "chat__Btn"
            ).children[1].innerHTML=`Chat(${pendingMsg})`;
        }
    });

});


peer.on("call", function (call) {
    getUserMedia(
      { video: true, audio: true },
      function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement("video");
        call.on("stream", function (remoteStream) {
          addVideoStream(video, remoteStream);
        });
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );
  });
  
  peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
  });

  socket.on("disconnect",function(){
      socket.emit("leave-room", ROOM_ID, currentUserId);
  });

  
const connectToNewUser = (userId, streams) => {
    var call = peer.call(userId, streams);
    console.log(call);
    var video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      console.log(userVideoStream);
      addVideoStream(video, userVideoStream);
    });
    call.on("close", ()=>{
        video.remove();
    });
    peers[userId]= call;
  };

  
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo();
    } else {
      setStopVideo();
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  };

  
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  };
  


const addVideoStream = (videoEl, stream, uId="") => {
    videoEl.srcObject = stream;
    video.id =uId;
    videoEl.addEventListener("loadedmetadata", () => {
      videoEl.play();
    });
  
    videoGrid.append(videoEl);
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
      for (let index = 0; index < totalUsers; index++) {
        document.getElementsByTagName("video")[index].style.width =
          100 / totalUsers + "%";
      }
    }
  };

const ShowChat =(e) =>{
    e.classList.toggle("active");
    document.body.classList.toggle("showChat");
  };
  const showInvitePopup =() =>{
    document.body.classList.add("showInvite");
    document.getElementById("roomLink").value = window.location.href;
  };
  
  const hideInvitePopup =() =>{
    document.body.classList.remove("showInvite");
  }
  
  const copyToClipBoard =() =>{
    var copyText = document.getElementById("roomLink");
  
    copyText.select();
    copyText.setSelectionRange(0,99999);
    document.execCommand("copy");
    alert("copied:"+ copyText.value);
  
    hideInvitePopup();
  };
  