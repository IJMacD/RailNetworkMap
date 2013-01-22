$(function(){
    var canvas = $('#map'),
        ctx = canvas[0].getContext('2d'),
        midLon = 1.342,
        midLat = 51.2,
        gridLon = 0.01,
        gridLat = 0.007,
        gridX = 20,
        gridY = 20,
        canvasWidth = canvas[0].width = canvas.width(),
        canvasHeight = canvas[0].height = canvas.height(),
        currentOutline,
        animating = false,
        lastX, lastY, startX, startY,
        mouseDown = false,
        tiles = {},
        images = {},
        selectedSymbol = 0;
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
            var currX = startX = event.offsetX,
                currY = startY = event.offsetY,
                dLon = (lastX - currX)*(gridLon/gridX),
                dLat = -(lastY - currY)*(gridLat/gridY);
            midLon += dLon;
            midLat += dLat;
            lastX = currX;
            lastY = currY;
        }
    });
    canvas.on('mouseup', function(event){
        mouseDown = false;
        animating = false;
        if(event.which == 1){
            if(startX != event.offsetX || startY != event.offsetY){
                var p = xYToLonLatGrid(event.offsetX,event.offsetY);
                setImage(p.lon.toFixed(3),p.lat.toFixed(4),selectedSymbol);
            }
        }else if(event.which == 3){
            if(startX != event.offsetX || startY != event.offsetY){
                var p = xYToLonLatGrid(event.offsetX,event.offsetY);
                setImage(p.lon.toFixed(3),p.lat.toFixed(4),-1);
            }
        }
    });
    canvas.on('mouseout', function(event){
        mouseDown = false;
        animating = false;
    });
    canvas.on('contextmenu', false);
    $.get('kent.json',function(data){currentOutline = data;render();});
    $.get('images.json',function(data){
        var key = $('#key');
        $.each(data,function(i,item){
            var img = loadImage(i,item),
                li = $('<li>').append(img);
            li.click(function(){
                selectedSymbol = i;
                highlightKey();
            });
            key.append(li);
        });
        render();
        highlightKey();
    });
    render();
    function setImage(x,y,img){
        if(!tiles[x])
            tiles[x] = {};
        tiles[x][y] = img;
    }
    function loadImage(id,src){
        var image = new Image();
        image.src = src;
        images[id] = image;
        return image;
    }
    function highlightKey(){
        $('#key li').removeClass('selected')
            .slice(selectedSymbol,selectedSymbol+1)
            .addClass('selected');
    }
    function render(t){
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        drawGrid();
        if(currentOutline)
            drawPath(currentOutline);
        drawTiles();
        if(animating)
            requestAnimationFrame(render);
    }
    function drawTiles(){
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
            i,l,j,m,p;
        for (x in tiles) {
            if(x > minLon - gridLon && x < maxLon + gridLon){
                for(y in tiles[x]){
                    if(y > minLat - gridLat && y < maxLat + gridLat){
                        if(images[tiles[x][y]]){
                            p = lonLatToXY(x,y);
                            ctx.drawImage(images[tiles[x][y]],p.x,p.y-gridY);
                        }
                    }
                }
            }
        };
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
            ctx.moveTo(0,canvasHeight-i);
            ctx.lineTo(canvasWidth,canvasHeight-i);
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
        p.y = canvasHeight - (midY + (lat - midLat)*(gridY / gridLat))+gridY/2;
        return p;
    }
    function xYToLonLat(x,y,p){
        p = (typeof p == "undefined") ? {} : p;
        var midX = canvasWidth / 2,
            midY = canvasHeight / 2;
        p.lon = midLon + (x - midX)*(gridLon/gridX);
        p.lat = midLat + (canvasHeight - y - midY + gridY/2)*(gridLat/gridY);
        return p;
    }
    function xYToLonLatGrid(x,y,p){
        p = xYToLonLat(x,y,p);
        var gridLonOver = p.lon % gridLon,
            gridLatOver = p.lat % gridLat;
        p.lon -= gridLonOver;
        p.lat -= gridLatOver;
        return p;
    }
});
