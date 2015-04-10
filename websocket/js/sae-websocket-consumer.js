$(document).ready(function() {
var socket;
var continuousStream;
var continuousStream = false;

$('#connect').click(connect);
$('#clear_console').click(ClearLog);
$('#get_list_prod').click(getProds);
$('#cons_register').click(register);
$('#cons_unregister').click(unregister);

function getProds(){
	if(socket == null){
		alert("Start a connection first!");
		return;
	}
	
	socket.send('5');
};

function register(){
	if(socket == null){
		alert("Start a connection first!");
		return;
	}
	var group = $('#group_field').val();
	if(group == ""){
		alert("Choose a group");
		return;
	}
	
	socket.send('3subscribe|' + group);
	OutputLog('Registered to ' + group);
};

function unregister(){
	if(socket == null){
		return;
	}
	var group = $('#group_field').val();
	socket.send('3unsubscribe|' + group);
	OutputLog('Unregistered from ' + group);
};
			
function connect(){
	var host = "ws://" + $('#host').val();
	try{
		socket = new WebSocket(host);
		ConnectToServer(socket, "");
	} catch(exception){
		OutputLog('Error'+exception);
	}
};
});