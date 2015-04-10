$(document).ready(function() {
var socket;
var continuousStream;

$('#connect').click(connect);
$('#clear_console').click(ClearLog);
$('#start_group_stream').click(startGroupStream);
$('#stop_group_stream').click(stopGroupStream);

function startGroupStream(){
	if(socket == null){
		alert("Start a connection first!");
		return;
	}
	OutputLog("Starting streaming...");
	var msg = "DUMMY DATA";
	continuousStream = setInterval(function(){
		socket.send('3publish|' + msg);
		OutputLog("Sent message");
	}, 1000);
};

function stopGroupStream(){
	if(socket == null)
		return;
	clearInterval(continuousStream);
};

function connect(){
	var text = $('#host').val();
	if(text==""){
		alert("Please input a host !");
		return ;	
	}
	text = $('#pseudo').val();
	if(text == ""){
		alert("Please input a car name !");
		return;
	}
	
	var host = "ws://" + $('#host').val();
	try{
		socket = new WebSocket(host);
		ConnectToServer(socket, $('#pseudo').val());
	} catch(exception){
		OutputLog('Error'+exception);
	}
};

});