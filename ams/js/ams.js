/* this js file is to be used for ams*/
$(document).ready(function() {
    //checking appache
  //  console.log("did it load 11");
    // need to check which page is active so accordingly bind events 
    $("#btn-submit").on("click", fnValidateUser);
    //get session storage
    var usr = sessionStorage.getItem("UserName");
  //  console.log("user in session " + usr);
    //$("#Userpic").attr('src', "https://widgetfactory.extranet.3ds.com/proxies/dsxpeoplephoto/picture/crop/login/"+usr+"/width/35/height/35");
    if (usr) {
        images = new Image();
       images.src =
            "https://widgetfactory.extranet.3ds.com/proxies/dsxpeoplephoto/picture/crop/login/" +
            usr + "/width/50/height/50";
        //for mobile site demo dummpy pic
      //  images.src = "../images/default_pic.png";    
        $("#Userpic").html(images);
    }
    //event to load panel
    $(document).on('click', 'a.toggle-panel', function() {
        var usr = sessionStorage.getItem("UserName");
        //console.log("left panel" + usr);
        getAMSData(usr);
        $('#mypanel').panel('toggle');
    });
    //check for autoLogin 
    var login = fnAutoLogin();
    //
    $("#submitLeave").click(function() {
        fnValidateLeave();
    });
 });
var images;

function fnAutoLogin() {
    var params = {};
    params.task = "login";
    $.ajax({
        type: 'GET',
        url: "../php/autologin.php",
        dataType: 'json',
        data: params,
        crossDomain: true,
        contentType: 'application/json;charset=utf-8;',
        error: function() {},
        complete: function(data) {
            console.log("after auto login success call");
            //console.log(data.responseText);
            var jsonData = JSON.parse(data.responseText);
           // console.log(jsonData);
            if (!jsonData.error) {
                var usrName = jsonData.username;
                console.log("user saved -- direct login");
                validUser = true;
                sessionStorage.setItem("UserName", usrName);
                //navigate to my records
                $.mobile.navigate("#myrecords", {
                    info: "this is login page",
                    transition: "flip"
                });
                // on LOAD fn for myrecords page  
                fnLoadMyRecords(usrName);
            }
        }
    });
}

function fnValidateUser() {
    var usrName = $("#txt-email").val();
    var pass = $("#txt-password").val();
    var remember = $('#chck-rememberme').is(':checked');
    var validUser;
    var params = {
        user: usrName,
        pwd: pass,
        rememberme: remember,
        method: "validate"
    };
    var d = {
        postParams: params
    };
    if (usrName === "" || pass === "") {
        validUser = false;
        $("#dlg-invalid-credentials #validateContents").html(
            "Login Credentails cannot be empty");
        $("#dlg-invalid-credentials").popup("open");
        return;
    }
   // console.log("begin verify ajax");
    // call server.php to get verify against LDAP
    $.ajax({
        type: 'POST',
        url: "../php/Server.php",
        async: false,
        dataType: 'json',
        data: JSON.stringify(d),
        contentType: 'application/json',
        beforeSend: function() {},
        error: function() {
            // not valid user
            validUser = false;
            $("#dlg-invalid-credentials #validateContents").html(
                "You are not connected to Intranet");
            $("#dlg-invalid-credentials").popup("open");
        },
        complete: function(data) {
            console.log("after success verify  call");
            data = JSON.parse(data.responseText);
           // console.log(data);
            if (data.result === true) {
                var jsonData = data;
                validUser = true;
                // store session 
                sessionStorage.setItem("UserName", usrName);
                //navigate to my records
                $.mobile.navigate("#myrecords", {
                    info: "this is login page",
                    transition: "flip"
                });
                // on LOAD fn for myrecords page  
                fnLoadMyRecords(usrName);
            } else {
                validUser = false;
                $("#dlg-invalid-credentials #validateContents")
                    .html("Invalid credentials entered!");
                $("#dlg-invalid-credentials").popup("open");
            }
            //console.log(data.responseText);
            //  return;
        }
    });

}

function doLogout() {
    console.log("do logout");
    $("#txt-email").val('');
    $("#txt-password").val('');
    $("#Userpic").html('');
    //clear session
    sessionStorage.removeItem("UserName");
    sessionStorage.removeItem("SalCode");
    //clear server cookies
    var params = {};
    params.task = "logout";
    $.ajax({
        type: 'GET',
        url: "../php/autologin.php",
        dataType: 'json',
        data: params,
        crossDomain: true,
        contentType: 'application/json;charset=utf-8;',
        error: function() {},
        complete: function(data) {
            console.log("after auto login success call");
            //console.log(data.responseText);
            var jsonData = JSON.parse(data.responseText);
         //   console.log(jsonData);
        }
    });
}

function fnLoadMyRecords(usrName) {
    //$("#Userpic").attr('src', "https://widgetfactory.extranet.3ds.com/proxies/dsxpeoplephoto/picture/crop/login/"+usrName+"/width/35/height/35");
    // $.mobile.loading("show");
    images = new Image();
    images.src =
        "https://widgetfactory.extranet.3ds.com/proxies/dsxpeoplephoto/picture/crop/login/" +
        usrName + "/width/50/height/50";

    // for demo mobile site 
   // images.src = "../images/default_pic.png";     
    images.onclick = function() {
        openLeftPanel();
    };
    images.onload = function() {
        $("#Userpic").html(images);
        getAMSData(usrName);
        $("#owl-example").owlCarousel({
            items: 1,
            itemsDesktop: [1000, 1], //5 items between 1000px and 901px
            itemsDesktopSmall: [900, 1], // betweem 900px and 601px
            itemsTablet: [600, 1],
            slideSpeed: 300,
            paginationSpeed: 400,
        });
        
    };
}

function getAMSData(usrName) {
        var params = {};
        params.trigram = usrName;
     //   console.log("data to get");
        console.log(params);
        $.ajax({
            type: 'GET',
            url: "../php/Server.php",
            dataType: 'json',
            data: params,
            crossDomain: true,
            contentType: 'application/json;charset=utf-8;',
            error: function() {
                           },
            complete: function(data) {
                console.log("after success user leave card");
                var jsonData = JSON.parse(data.responseText);
                //console.log(jsonData);
                loadLeftPanel(jsonData);
            }
        });
    }
    //to load left panel 

function loadLeftPanel(data1) {
    //data for load panel
    var multi = 0;
    var data;
    if (data1.length > 1) {
        data = data1[0];
        multi = 1;
    } else {
        data = data1;
        multi = 0;
    }
   // console.log("in load left panel");
  //  console.log(data);
    //store salcode :
    sessionStorage.setItem("SalCode", data.Salcode);
    // load emp details 
    $("#employeename").text(data.EmployeeName);
    //$("#designation").text(data.designation);
    $("#brand").text(data.BrandName);
    //$("#projectname").text(data.projectname);
    //calculate carry c/f leaves
    var ld = 0.0;
    var bd = 0.0;
    bd = parseFloat(data.LeaveBalance);
    if (multi) {
        for (var i = 0; i < data1.length; i++) {
            ld += parseFloat(data1[i].TotalLeaveDays);
        }
    } else {
        ld = parseFloat(data.TotalLeaveDays);
    }
    var cf = (ld + bd) - 22;
    //console.log("carry fw" + cf);
    $("#lc").text(ld);
    $("#lcf").text(cf);
    $("#lb").text(bd);
}

function openLeftPanel() {
        console.log("panel open");
        $("#mypanel").panel("open");
    }

    // load pages as per current page

function loadSelfData() {
    console.log("to load self swipe DATA");
    var chartData = generateChartData();
  //  console.log("amschart data");
   // console.log(chartData);
    var chart = AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "panEventsEnabled": false,
        "pan": true,
        "theme": "light",
        "marginRight": 80,
        "autoMarginOffset": 20,
        "marginTop": 7,
        "dataProvider": chartData,
        "valueAxes": [{
            "axisAlpha": 0.2,
            "dashLength": 1,
            "position": "left"
        }],
        "mouseWheelZoomEnabled": true,
        "graphs": [{
            "id": "g1",
            "balloonText": "[[category]]<br/><b><span style='font-size:14px;'>value: [[value]]</span></b>",
            "bullet": "round",
            "bulletBorderAlpha": 1,
            "bulletColor": "#FFFFFF",
            "hideBulletsCount": 50,
            "title": "red line",
            "valueField": "visits",
            "useLineColorForBulletBorder": true
        }],
        "chartScrollbar": {
            "autoGridCount": true,
            "graph": "g1",
            "scrollbarHeight": 40
        },
        "chartCursor": {},
        "categoryField": "date",
        "categoryAxis": {
            "parseDates": true,
            "axisColor": "#DADADA",
            "dashLength": 1,
            "minorGridEnabled": true
        },
        "export": {
            "enabled": true
        }
    });
    chart.addListener("rendered", zoomChart);
    zoomChart();
    // this method is called when chart is first inited as we listen for "dataUpdated" event
    function zoomChart() {
            // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
            chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
        }
        // generate some random data, quite different range

    function generateChartData() {
        var chartData = [];
        var firstDate = new Date();
        firstDate.setDate(firstDate.getDate() - 5);
        for (var i = 0; i < 1000; i++) {
            // we create date objects here. In your data, you can have date strings
            // and then set format of your dates using chart.dataDateFormat property,
            // however when possible, use date objects, as this will speed up chart rendering.
            var newDate = new Date(firstDate);
            newDate.setDate(newDate.getDate() + i);
            var visits = Math.round(Math.random() * (40 + i / 5)) + 20 +
                i;
            chartData.push({
                date: newDate,
                visits: visits
            });
        }
        return chartData;
    }
}

function myrecordlistclick(e) {
 //   console.log("clicked li");
    var linkedPage = e.target.getAttribute("href");
    console.log(linkedPage);
    switch (linkedPage) {
        //   case  "#selfswipedata" : loadSelfData();break;//loadSelfDataHighchart(); //
        default:
    }
}

function drawChart(data) {
        var cdata = [];
        var adata = [];
        for (var i = 0, l = data.length; i < l; i++) {
            //var t = new Date(data[i].SwipeDate).getTime();
            var t = Number(data[i].SwipeDate) * 1000;
            var h = data[i].TotalTime;
            h1 = parseFloat(h.replace(":", "."));
            var temp = [t, h1];
            cdata.push(temp);
            adata.push([t, 9.5]);
        }
        //highstocks need sorted data
        cdata.sort();
        adata.sort();
        var obj = {
            name: 'Swipe hrs',
            type: 'column',
            data: cdata,
            zones: [{
                value: 9.15,
                color: '#d0432b'
            }, {
                color: '#57b847'
            }]
        };
        var obj1 = {
            name: 'Avg hrs',
            type: 'column',
            data: adata
        };
        seriesOptions = [];
        seriesOptions.push(obj);
        //seriesOptions.push(obj1);
        //display chart 
        $('#chartdiv').highcharts('StockChart', {
            rangeSelector: {
                selected: 2
            },
            legend: {
                enabled: true
            },
            credits: {
                enabled: false
            },
            chart: {
                zoomType: 'x',
                events: {
                    load: computeAvg,
                    redraw: computeAvg
                }
            },
            title: {
                text: 'Swipe hours (HH:MM)'
            },
            series: seriesOptions
        });
    }
    //fn to computr avg

function computeAvg() {
    var chart = this,
        series = chart.series,
        yAxis = chart.yAxis[0],
        xAxis = chart.xAxis[0],
        extremes = xAxis.getExtremes(),
        min = extremes.min,
        max = extremes.max,
        plotLine = chart.get('avgLine'),
        sum = 0,
        count = 0;
    Highcharts.each(series, function(serie, i) {
        if (serie.name !== 'Navigator') {
            Highcharts.each(serie.data, function(point, j) {
                if (point.x >= min && point.x <= max) {
                    sum += point.y;
                    count++;
                }
            });
        }
    });
    var avg = (sum / count).toFixed(2);
    // console.log("avg hours :" + sum/count);
    // console.log("count " + count);
    if (!isNaN(avg)) {chart.setTitle(null, {
        text: 'Avg hours : ' + avg
    });}
    yAxis.removePlotLine('avgLine');
    yAxis.addPlotLine({
        value: (avg),
        color: 'red',
        width: 2,
        id: 'avgLine'
    });
}

function loadSelfDataHighchart() {
        //ajax call to load  all swipe data 
        var esalcode = sessionStorage.getItem("SalCode");
        var params = {
            method: "selfswipehours",
            salCode: esalcode,
            userName: "k8q"
        };
        var d = {
            postParams: params
        };
        $.ajax({
            type: 'POST',
            url: "../php/Server.php",
            dataType: 'json',
            data: JSON.stringify(d),
            crossDomain: true,
            contentType: 'application/json;charset=utf-8;',
            error: function(msg) {
                console.log(msg);
            },
            complete: function(data) {
                console.log("after success user swipe hours");
                var jsonData = data.responseJSON;
                drawChart(jsonData);
            }
        });
   
    }
    // apply leave module

function fnValidateLeave() {
    //validate 
    console.log("sample valid");
    var leaveType = $("#applyLeaveForm #selleavetype").val();
    var halfLeave = $("#applyLeaveForm #hdleave").val();
    var sDate = $("#applyLeaveForm #sDate").val();
    var eDate = $("#applyLeaveForm #eDate").val();
    var comment = $("#applyLeaveForm #comment").val();
    var errorFlag = 0;
    //console.log(leaveType);
    //console.log(sDate);
    //console.log(comment);
    //console.log(halfLeave);
    if ("none" == leaveType || !sDate || !eDate || !comment) {
        errorFlag = 1;
        $("#dlg-invalid-form #errorContents").html(
            "Incomplete Data submitted !");
    }
    if (halfLeave === "true" && sDate !== eDate) {
        errorFlag = 1;
        $("#dlg-invalid-form #errorContents").html(
            "Half Day leaves should be of same day !");
    }
    var x = new Date(sDate);
    var y = new Date(eDate);
    if (x > y) {
        errorFlag = 1;
        $("#dlg-invalid-form #errorContents").html(
            "Start Date should be less than End Date !");
    }
    if (errorFlag) {
        //show error
        $("#dlg-invalid-form h3").html("Submit failed");
        $("#dlg-invalid-form").popup("open");
        errorFlag = 0;
    } else {
        // send data to apply leaves
        Date.prototype.changeFormat = function(d) {
            var dArr = d.split('-');
            var str = dArr[2] + '/' + dArr[1] + '/' + dArr[0];
            // var str = d.replace(/-/g, "/");
            return str;
        };
        var strDate = new Date();
        //var eusr = sessionStorage.getItem("UserName");
        var esalcode = sessionStorage.getItem("SalCode");
        var objLeave = {
            leaveType: leaveType,
            halfLeave: halfLeave,
            sDate: strDate.changeFormat(sDate),
            eDate: strDate.changeFormat(eDate),
            comment: comment,
            userName: "k8q",
            salCode: esalcode,
            method: "applyLeave"
        };
      //  console.log("data to be send");
      //  console.log(objLeave);
          applyLeaveModule(objLeave);
        // send data across to apply leave module
    }
}

function applyLeaveModule(data) {
    var d = {
        postParams: data
    };
    $.ajax({
        type: 'POST',
        url: "../php/Server.php",
        dataType: 'json',
        data: JSON.stringify(d),
        crossDomain: true,
        contentType: 'application/json;charset=utf-8;',
        error: function() {},
        complete: function(data) {
            console.log("after leave apply ");
            //console.log(navigator);
            //console.log(data.responseText);
            if ("vibrate" in navigator) {
                // vibration API supported
                console.log("vibration supported in api");
                navigator.vibrate = navigator.vibrate ||
                    navigator.webkitVibrate || navigator.mozVibrate ||
                    navigator.msVibrate;
                if (navigator.vibrate) {
                    // vibration API supported
                    navigator.vibrate(1000);
                }
            }
            var ldata = JSON.parse(data.responseText);
            var result = ldata.IsSuccess;
            if (result === true) {
                $("#dlg-invalid-form h3").html("Success");
                //$("#dlg-valid-form").popup("open");
            } else $("#dlg-invalid-form h3").html(
                "Submit Failed");
            $("#dlg-invalid-form #errorContents").html(ldata.NotificationMessage);
            $("#dlg-invalid-form").popup("open");
        }
    });
}
$(document).on("pageshow", "#selfswipedata", function() {
    //console.log("in new draw1");
    //  loadSelfData();
    loadSelfDataHighchart();
});