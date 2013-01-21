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
        canvasHeight = canvas[0].height = canvas.height(),
        currentOutline,
        animating = false,
        lastX, lastY,
        mouseDown = false;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#ccc";
    canvas.on('mousedown', function(event){
        mouseDown = true;
        lastX = event.offsetX;
        lastY = event.offsetY;
        animating = true;
        render();
    });
    canvas.on('mousemove', function(event){
        if(mouseDown){
            var currX = event.offsetX,
                currY = event.offsetY,
                dLon = (lastX - currX)*(gridLon/gridX),
                dLat = -(lastY - currY)*(gridLat/gridY);
            midLon += dLon;
            midLat += dLat;
            lastX = currX;
            lastY = currY;
        }
    });
    canvas.on('mouseup mouseout', function(event){
        mouseDown = false;
        animating = false;
    });
    $.get('kent.json',function(data){currentOutline = data;render();});
    render();
    function render(t){
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        drawGrid();
        if(currentOutline)
            drawPath(currentOutline);
        if(animating)
            requestAnimationFrame(render);
    }
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
    function xYToLonLat(x,y,p){
        p = (typeof p == "undefined") ? {} : p;
        p.lon = midLon + (x - midX)*(gridLon/gridX);
        p.lat = midLat + (canvasHeight - (y - midY))*(gridLat/gridY);
        return p;
    }
});
