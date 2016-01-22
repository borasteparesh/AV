var socket = io().connect('http:192.168.2.8:3720/NIndex');
var clients=0;
var pc;
var localStream;
socket.on('offer',function(offer){
	offer = new SessionDescription(JSON.parse(offer))
	//pc.addStream(localStream);
	pc.setRemoteDescription(offer);	
	console.log('offer received');
	pc.createAnswer(function (answer) {
		pc.setLocalDescription(answer, function() {
			socket.emit('answer', JSON.stringify(pc.localDescription));
		}, errorHandler);
	}, errorHandler,mediaConstraints);
	

});
socket.on('clients',function(data){
	clients=data.clients;
	document.getElementById('clients').value=clients;
});
socket.on('answer',function(data){
	console.log('ans received');
	//pc.addStream(localStream);
	pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(data)));
	

});
socket.on('candidate',function(data){
	var signal = JSON.parse(data);
	var candidate=new RTCIceCandidate(signal.ice);
	pc.addIceCandidate(candidate);
});
var mediaConstraints = {
		"mandatory": {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true
}
};
var mediaConstraintsMozila = {
		
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true

};
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
var configuration = {
		iceServers: [
		             {urls: "stun:23.21.150.121"},
		             {urls: "stun:stun.l.google.com:19302"},
		             {urls: "turn:numb.viagenie.ca", credential: "webrtcdemo", username: "louis%40mozilla.com"}
		             ]
}
var createPeerConnection=function(stream){
	pc = new RTCPeerConnection(configuration);
	pc.addStream(stream);
	pc.onaddstream=function(event){
		document.getElementById('remoteVideo').src=window.URL.createObjectURL(event.stream);
		document.getElementById('remoteVideo').play();
		console.log('video streamed');
	}
	pc.onicecandidate=function(event){
		
		if(!event ||!event.candidate)return;
		console.log(event);
			socket.emit('candidate',JSON.stringify({'ice':event.candidate}));
		
	}
}
function doCall(){
	if(isFirefox)
		mediaConstraints=mediaConstraintsMozila;
	if(clients==2){
		//console.log(setLocalDescription);
		pc.createOffer(function (offer) {
			pc.setLocalDescription(offer, function() {
				socket.emit('offer',JSON.stringify(pc.localDescription));
			}, errorHandler);
		}, errorHandler, mediaConstraints);

	}

}

function getUserMedia(callback) {
	navigator.getUserMedia({
		audio: true,
		video: true
	}, callback, onerror);

	function onerror(e) {
		console.error(e);
	}
}

getUserMedia(function (stream) {
	localStream=stream;
	document.getElementById('localVideo').src=window.URL.createObjectURL(stream);
	createPeerConnection(stream);
});


var errorHandler = function (err) {
	console.error(err);
};