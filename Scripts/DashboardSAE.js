/**
 * Created by David on 2015-04-10.
 */

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

var BMSCharts = [];
var BMSTables = [];
var InputCharts = [];

$(document).ready(new function(){
    var ctx = $("#BMS1Volt").get(0).getContext("2d");
    BMSTables.push($("#BMSTable1").get(0));
    BMSTables.push($("#BMSTable2").get(0));
    BMSTables.push($("#BMSTable3").get(0));
    BMSTables.push($("#BMSTable4").get(0));
    var myNewChart = new Chart(ctx);
    var initDataVolt = {
        labels: ["Cell1", "Cell2", "Cell3", "Cell4", "Cell5", "Cell6", "Cell7", "Cell8", "Cell9", "Cell10", "Cell11", "Cell12"],
        datasets: [
            {
                label: "Cells Voltage",
                fillColor: "rgba(91,255,121,0.5)",
                strokeColor: "rgba(91,255,121,0.8)",
                highlightFill: "rgba(91,255,121,0.75)",
                highlightStroke: "rgba(91,255,121,1)",
                data: [4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2]
            }
        ]
    };

    var options = {
        scaleOverride: true,
        scaleSteps: 7,
        scaleStepWidth: 0.6,
        scaleStartValue: 0
    };
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt, options));

    ctx = $("#BMS2Volt").get(0).getContext("2d");
    var myNewChart2 = new Chart(ctx);
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt, options));

    ctx = $("#BMS3Volt").get(0).getContext("2d");
    var myNewChart3 = new Chart(ctx);
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt, options));

    ctx = $("#BMS4Volt").get(0).getContext("2d");
    var myNewChart4 = new Chart(ctx);
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt, options));

    var donutData = [
        {
            value: 75,
            color: "#006600	",
            highlight: "#009900",
            label: "% Utilise"
        },
        {
            value: 25,
            color: "#484848",
            highlight: "#686868",
            label: "% Non-utilise"
        }
    ]

    ctx = $("#brake").get(0).getContext("2d");
    InputCharts.push(new Chart(ctx).Doughnut(donutData));

    ctx = $("#accel").get(0).getContext("2d");
    InputCharts.push(new Chart(ctx).Doughnut(donutData));

    setInterval(function(){
        console.log("get subs");
        if (isConnected) {
            socket.send('5');
        }
    }, 5000);
});

var isConnected = false;
function OutputLog(msg) {
    {
        console.log(msg);
    }
}

var currentProducer = "";
function NewSubscriber(sub) {
    if (currentProducer) {
        socket.send("3unsubscribe|" + currentProducer);
    }

    currentProducer = sub;
    socket.send('3subscribe|' + currentProducer);
}

function HandleReceive(csv) {
    var intArray = csv.split(',');

    var idx = 0;
    while (idx < intArray.length) {
        idx = HandleData(idx, intArray);
    }
}

var Lengths = [17, 17, 17, 17, 4, 3, 3];

function HandleData(idx, arr) {
    // Handle BMS data
    var id = parseInt(arr[idx]);
    var data = [];
    for(var i = 1; i < Lengths[id] + 1; i++) {
        data.push(parseInt(arr[i + idx]));
    }

    if (id < 4) {
        PopulateBMSChart(BMSCharts[id], data);
        PopulateBMSTable(BMSTables[id], data);
    } else if (id == 4) { // roues
        PopulateWheelTable(data);
    } else if (id == 5) { // inputs
        PopulateInputs(data);
    } else if (id == 6) { // drive
        PopulateDrive(data);
    }

    return Lengths[id] + 1 + idx;
}

function PopulateInputs(data) {
    for (var i = 0; i < data.length; i++) {
        if (i < 2) {
            InputCharts[i].segments[0].value = data[i];
            InputCharts[i].segments[1].value = 100 - data[i];
            InputCharts[i].update();
        } else {
            $("#wheel").rotate({animateTo:data[i]});
        }
    }
}

function PopulateDrive(data) {
    var table = $("#table-drive").get(0);
    for (var i = 0; i < data.length; i++) {
        if (i < 2) {
            table.rows[i].cells[1].innerHTML = data[i] + " DEGRES";
            table.rows[i].cells[1].style.color = CalculateColor(data[i]);
        }
        else
            table.rows[i].cells[1].innerHTML = data[i] + " RPM";
    }
}

function PopulateWheelTable(data) {
    var table = $("#table-roues").get(0);
    for (var i = 0; i < data.length; i++) {
        table.rows[i].cells[1].innerHTML = data[i] + " RPM";
    }
}

function PopulateBMSChart(chart, data) {
    for(var i = 0; i < 12; i++) {
        chart.datasets[0].bars[i].value = data[i];
    }

    chart.update();
}

function PopulateBMSTable(table, data) {
    for (var i = 12; i < data.length; i++) {
        table.rows[i-12].cells[1].innerHTML = data[i];
        table.rows[i-12].cells[1].style.color = CalculateColor(data[i]);
    }
}

function CalculateColor(temp) {
    var highTemp = 60;
    var lowTemp = 10;
    if (temp < lowTemp) temp = lowTemp;
    if (temp > highTemp) temp = highTemp

    var red = Math.floor((temp-lowTemp)*255/(highTemp-lowTemp));
    console.log(red);
    return "rgb({0},{1},0)".format(red, 255-red);
}

function connect() {
    var host = $('#hostform').val();
    if (isConnected) {
        OutputLog('Already connected');
        return;
    }

    try {
        socket = new WebSocket(host);
        OutputLog('Socket Status: ' + socket.readyState);
        socket.onopen = function () {
            OutputLog('Socket Status: ' + socket.readyState + ' (open)');
            socket.send('0' + 'Carapas');
            isConnected = true;
        };

        socket.onmessage = function (msg) {
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

            var idInt = parseInt(id);
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
                    HandleReceive(arg2);
                    break;
                case 4:
                    OutputLog('Server streamed : '+arg1);
                    break;
                case 5:
                    OutputLog('Producers : '+arg1);
                    HandleProducers(arg1);
                    break;
                default:
                    OutputLog('Unhandled frame :'+str);
                    break;
            }
        };

        socket.onclose = function () {
            OutputLog('Socket Status: ' + socket.readyState + ' (Closed)');
        }

    } catch (exception) {
        OutputLog('Error' + exception);
    }
}

function HandleProducers(producers) {
    if (!producers) return;

    var listProducers = producers.split(',');

    if(!currentProducer) NewSubscriber(listProducers[0]);

    var select = $("#producers").get(0);
    select.options = [];
    select.innerHTML = "";
    listProducers.forEach(function(prod){
        var newOp = document.createElement("option");
        newOp.text = prod;
        newOp.value = prod;
        select.options[select.options.length] = newOp;
    });
}