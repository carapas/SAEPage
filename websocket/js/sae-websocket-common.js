function OutputLog(msg){
	var content = '<p>' + msg + '</p>';
	$('#consolebox').append(content);
};

function ClearLog(){
	$('#consolebox').html("");
};

function ProcessMsg(msg){
	var str = "";
	str = msg.data;
	var id  = str.substr(0, 1);
	var separator = str.indexOf("|");
	var arg1 = "";
	var arg2 = "";
	if(separator != -1)
	{
		arg1 = str.substr(1, separator-1);
		arg2 = str.substr(separator+1);
	}
	else
		arg1 = str.substr(1);				
	
	var idInt = parseInt(id)
	switch(idInt){
		case 0:
			OutputLog('Server reply : '+arg1);	
			break;
		case 1:
			OutputLog('Server echo msg : '+arg1);	
			break;
		case 2:
			OutputLog(arg1 + ' said : ' + arg2);	 	
			break;
		case 3:
			OutputLog(arg1 + ' broadcasted : ' + arg2);
			break;
		case 4:
			OutputLog('Server streamed : '+arg1);
			break
		case 4:
			OutputLog('Server streamed : '+arg1);
			break;
		case 5:
			OutputLog('Producers : '+arg1);
			break;
		default:
			OutputLog('Unhandled frame :'+str) 
			break;
	}
};

function ConnectToServer(socket, pseudo){
	try{
		OutputLog('Socket Status: '+socket.readyState);
		socket.onopen = function(){
			OutputLog('Socket Status: '+socket.readyState+' (open)');
			socket.send('0'+pseudo);
		}
		socket.onmessage = ProcessMsg;
		
		socket.onclose = function(){
			OutputLog('Socket Status: '+socket.readyState+' (Closed)');
		}			
				
	} catch(exception){
		OutputLog('Error'+exception);
	}
};