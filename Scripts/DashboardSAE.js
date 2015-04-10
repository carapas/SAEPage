/**
 * Created by David on 2015-04-10.
 */

var BMSCharts = [];
var BMSTables = [];
var BrakeChart;
var AccelChart;
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
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2]
            }
        ]
    };

    BMSCharts.push(new Chart(ctx).Bar(initDataVolt));

    ctx = $("#BMS2Volt").get(0).getContext("2d");
    var myNewChart2 = new Chart(ctx);
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt));

    ctx = $("#BMS3Volt").get(0).getContext("2d");
    var myNewChart3 = new Chart(ctx);
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt));

    ctx = $("#BMS4Volt").get(0).getContext("2d");
    var myNewChart4 = new Chart(ctx);
    BMSCharts.push(new Chart(ctx).Bar(initDataVolt));

    var donutData = [
        {
            value: 75,
            color: "#006600	",
            highlight: "#009900",
            label: "% Utilisé"
        },
        {
            value: 25,
            color: "#484848",
            highlight: "#686868",
            label: "% Non-utilisé"
        }
    ]

    ctx = $("#brake").get(0).getContext("2d");
    BrakeChart = new Chart(ctx).Doughnut(donutData);

    ctx = $("#accel").get(0).getContext("2d");
    AccelChart = new Chart(ctx).Doughnut(donutData);
});

var isConnected = false;
function OutputLog(msg) {
    {
        var content = '<p>' + msg + '</p>';
        $('#consolebox').append(content);
    }
};

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
            var id = str.substr(0, 1);
            var separator = str.indexOf("|");
            var arg1 = "";
            var arg2 = "";
            if (separator != -1) {
                arg1 = str.substr(1, separator - 1);
                arg2 = str.substr(separator + 1);
            }
            else
                arg1 = str.substr(1);

            if (id == "0") {
                OutputLog('Server reply : ' + arg1);
            }
            if (id == "1") {
                OutputLog('Server echo msg : ' + arg1);
            }
            if (id == "2") {
                OutputLog(arg1 + ' said : ' + arg2);
            }
            if (id == "3") {
                OutputLog(arg1 + ' broadcasted : ' + arg2);
            }
            if (id == "4") {
                OutputLog('Server streamed : ' + arg1);
            }
        };

        socket.onclose = function () {
            OutputLog('Socket Status: ' + socket.readyState + ' (Closed)');
        }

    } catch (exception) {
        OutputLog('Error' + exception);
    }
}