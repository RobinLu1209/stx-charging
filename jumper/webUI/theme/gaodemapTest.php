<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
    <title>自定义点标记</title>
    <link rel="stylesheet" href="https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css"/>
    <style>
        html, body, #container {
            height: 100%;
            width: 100%;
        }

        .custom-content-marker {
            position: relative;
            width: 25px;
            height: 34px;
        }

        .custom-content-marker img {
            width: 100%;
            height: 100%;
        }

        .custom-content-marker .close-btn {
            position: absolute;
            top: -6px;
            right: -8px;
            width: 15px;
            height: 15px;
            font-size: 12px;
            background: #ccc;
            border-radius: 50%;
            color: #fff;
            text-align: center;
            line-height: 15px;
            box-shadow: -1px 1px 1px rgba(10, 10, 10, .2);
        }

        .custom-content-marker .close-btn:hover{
            background: #666;
        }

        .amap-marker-label{
            border: 0;
            background-color: transparent;
        }

        .info{
            position: relative;
            top: 0;
            right: 0;
            min-width: 0;
        }
    </style>
</head>
<body>
<div id="container"></div>
<div class="input-card">
    <label style="color:grey">点标记操作</label>
    <div class="input-item">
        <input id="addMarker" type="button" class="btn" onclick="addMarker()" value="添加点标记">
        <input id="updateMarker" type="button" class="btn" onclick="updateIcon()" value="更新点标记图标">
    </div>
    <div class="input-item">
        <input id="clearMarker" type="button" class="btn" onclick="clearMarker()" value="删除点标记">
        <input id="updateMarker" type="button" class="btn" onclick="updateContent()" value="更新点标记内容">
    </div>
<script type="text/javascript"
        src="https://webapi.amap.com/maps?v=1.4.14&key=您申请的key值"></script>
<script type="text/javascript">
    var position = new AMap.LngLat(121.4418291, 31.0247022);

    // 创建地图实例
    var map = new AMap.Map("container", {
        zoom: 16,
        center: position,
        resizeEnable: true
    });

    // 点标记显示内容，HTML要素字符串
    var markerContent = 'hello' +
        '<div class="custom-content-marker">' +
        '   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png">' +
        '   <div class="close-btn" onclick="clearMarker()">X</div>' +
        '</div>';

    var marker = new AMap.Marker({
        position: position,
        // 将 html 传给 content
        content: markerContent,
        // 以 icon 的 [center bottom] 为原点
        offset: new AMap.Pixel(-13, -30)
    });

    marker.setLabel({
        offset: new AMap.Pixel(20, 20),  //设置文本标注偏移量
        content: "<div class='info'>我是 m label 标签</div>", //设置文本标注内容
        direction: 'right' //设置文本标注方位
    });
    // 将 markers 添加到地图
    map.add(marker);

    // 清除 marker
    function clearMarker() {

        map.remove(marker);
    }

    // 实例化点标记
    function addMarker() {
        marker = new AMap.Marker({
            icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
            position: [116.406315,39.908775],
            offset: new AMap.Pixel(-13, -30)
        });
        marker.setMap(map);
    }
    function updateIcon() {

        marker.setIcon('//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png')
    }

    function updateContent() {

        if (!marker) {
            return;
        }

        // 自定义点标记内容
        var markerContent = document.createElement("div");

        // 点标记中的图标
        var markerImg = document.createElement("img");
        markerImg.className = "markerlnglat";
        markerImg.src = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png";
        markerContent.appendChild(markerImg);

        // 点标记中的文本
        var markerSpan = document.createElement("span");
        markerSpan.className = 'marker';
        markerSpan.innerHTML = "Hi，我被更新啦！";
        markerContent.appendChild(markerSpan);

        marker.setContent(markerContent); //更新点标记内容
        marker.setPosition([116.391467, 39.927761]); //更新点标记位置
    }
</script>
</body>
</html>