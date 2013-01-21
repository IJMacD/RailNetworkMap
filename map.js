$(function(){
    var canvas = $('#map'),
        ctx = canvas[0].getContext('2d'),
        midLon = 1.342,
        midLat = 51.2,
        gridLon = 0.025,
        gridLat = 0.0175,
        gridX = 20,
        gridY = 20,
        canvasWidth = canvas[0].width = canvas.width(),
        canvasHeight = canvas[0].height = canvas.height();
    ctx.strokeStyle = "#ccc";
    drawGrid();
    $.get('kent.json',drawPath);
    function drawGrid(){
        var midX = canvasWidth / 2,
            midY = canvasHeight / 2,
            gridLonOver = midLon % gridLon,
            gridLatOver = midLat % gridLat,
            gridXCount = Math.floor(canvasWidth / gridX),
            gridYCount = Math.floor(canvasHeight / gridY),
            minLon = midLon - gridLonOver - (gridXCount * gridLon * 0.5),
            minLat = midLat - gridLatOver - (gridYCount * gridLat * 0.5),
            maxLon = minLon + (gridXCount * gridLon),
            maxLat = minLat + (gridYCount * gridLat),
            minX = midX - (gridLonOver/gridLon*gridX) - (gridXCount/2*gridX),
            minY = midY - (gridLatOver/gridLat*gridY) - (gridYCount/2*gridY);
        for (var i = minX; i < canvasWidth; i+=gridX) {
            ctx.beginPath();
            ctx.moveTo(i,0);
            ctx.lineTo(i,canvasHeight);
            ctx.stroke();
        };
        for (var i = minY; i < canvasHeight; i+=gridY) {
            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(canvasWidth,i);
            ctx.stroke();
        };
    }
    function drawPath(data){
        var i = 2,
            l = data.length,
            p;
        ctx.beginPath();
        ctx.moveTo(data[0],data[1]);
        for (; i < l; i+=2) {
            p = lonLatToXY(data[i],data[i+1],p)
            ctx.lineTo(p.x,p.y);
        };
        ctx.stroke();
    }
    function lonLatToXY(lon,lat,p){
        p = (typeof p == "undefined") ? {} : p;
        var midX = canvasWidth / 2,
            midY = canvasHeight / 2;
        p.x = midX + (lon - midLon)*(gridX / gridLon);
        p.y = canvasHeight - (midY + (lat - midLat)*(gridY / gridLat));
        return p;
    }
});
