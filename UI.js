var colors = ['#F44336', '#9C27B0','#00BFA5', '#00BFA5'];
var color_select = Math.floor(Math.random() * colors.length);
document.body.style.backgroundColor = colors[color_select];

var m1 = 1;
var m2 = 1;
var v1 = 10;
var v2 = 40;
var a = 15;
var b = 20;

var v1f = 0;
var v2f = 0;
var af = 0;
var bf = 0;
var e = 0.8;
var klost = 0;
var outline1 = document.getElementById("balloutline1");
var outline2 = document.getElementById("balloutline2");
var ball1 = document.getElementById("ball1");
var ball2 = document.getElementById("ball2");
var playing = false;
var interval = null;
var collided = false;
var ein_cached = 0;

function fixres(){
    var w = window.innerWidth;
    var h = window.innerHeight;

    var outline1 = document.getElementById("balloutline1");
    var outline2 = document.getElementById("balloutline2");
    document.getElementById("collisionline").style.top = h*0.45 + 'px';
    outline1.style.top = h*0.45 - 26 + 'px';
    outline1.style.left = w*0.50 + 'px';
    outline2.style.top = h*0.45 + 26 + 'px';
    outline2.style.left = w*0.50 + 'px';

    ball1.style.left = w*0.50 - v1*10*Math.cos(a*Math.PI/180) + 'px';
    ball2.style.left = w*0.50 - v2*10*Math.cos(b*Math.PI/180) + 'px';
    ball1.style.top = h*0.45 - 26 - v1*10*Math.sin(a*Math.PI/180) + 'px';
    ball2.style.top = h*0.45 + 26 + v2*10*Math.sin(b*Math.PI/180) + 'px';
    document.getElementById("container").style.height = h*0.85+'px';
}

function acopy(o) { // found on https://www.codementor.io/avijitgupta/deep-copying-in-js-7x6q8vh5d
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? acopy(v) : v;
   }
   return output;
}

function calculateResult(m1, m2, v1, v2, a, b, e){
    var v1x = v1*Math.cos(a*Math.PI/180);
    var v2x = v2*Math.cos(b*Math.PI/180);

    var v1y = -v1*Math.sin(a*Math.PI/180);
    var v2y = v2*Math.sin(b*Math.PI/180);

    if(!document.getElementById("sticky").checked){ // Not a perfectly inelastic collision
        var system = [
            [m1, m2],
            [-1, 1]
        ];
        var answers = [
            m1*v1y + m2*v2y,
            e*(v1y - v2y)
        ];

        var v1fy = cramer(acopy(system), answers, 0);
        var v2fy = cramer(acopy(system), answers, 1);
        var v1fx = v1x;
        var v2fx = v2x;
        v1f = Math.round(hypotenuse(v1fx, v1fy)*1000000000000)/1000000000000;
        v2f = Math.round(hypotenuse(v2fx, v2fy)*1000000000000)/1000000000000;

        af = 0;
        bf = 0;
        if(v1f != 0){
            af = Math.round(Math.asin(Math.max(Math.min(1, v1fy/v1f), -1))*180/Math.PI*1000000000000)/1000000000000;
        }
        if (v2f != 0){
            bf = Math.round(Math.asin(Math.max(Math.min(1, v2fy/v2f), -1))*180/Math.PI*1000000000000)/1000000000000;
        }

        klost = -((0.5*m1*v1f*v1f+0.5*m2*v2f*v2f)-(0.5*m1*v1*v1+0.5*m2*v2*v2)); 
        if(e == 1){
            klost = 0; // remove approximation errors
        }
    } else{
        var system = [ //indexed by vfx, vfy
            [m1+m2, 0],
            [0, m1+m2]
        ];
        var answers = [
            m1*v1x + m2*v2x,
            m1*v1y + m2*v2y
        ];

        var vfx = cramer(acopy(system), answers, 0);
        var vfy = cramer(acopy(system), answers, 1);
        
        v1f = Math.round(hypotenuse(vfx, vfy)*1000000000000)/1000000000000;
        v2f = v1f;

        af = 0;
        bf = 0;
        if(v1f != 0){
            af = Math.round(Math.asin(Math.max(Math.min(1, vfy/v1f), -1))*180/Math.PI*1000000000000)/1000000000000;
            bf = Math.round(Math.asin(Math.max(Math.min(1, vfy/v1f), -1))*180/Math.PI*1000000000000)/1000000000000;
        }
        klost = -((0.5*(m1+m2)*v1f*v1f) - (0.5*m1*v1*v1 + 0.5*m2*v2*v2));

    }


}

function sticky(){
    if(document.getElementById("sticky").checked){
        ein_cached = document.getElementById("ein").value;
        document.getElementById("ein").value = 0;
        document.getElementById("ein").disabled = true;
    } else{
        document.getElementById("ein").disabled = false;
        document.getElementById("ein").value = ein_cached;
    }
    stopAnimation();
    calculateResult(m1, m2, v1, v2, a, b, e);
    adjustVisuals();
}

function adjustVisuals(){
    var w = window.innerWidth;
    var h = window.innerHeight;
    document.getElementById("ball1").style.backgroundColor = 'rgb(' + (255-m1) + ',' + (255-m1) + ',' + (255-m1) + ')';
    document.getElementById("ball1").style.color = 'rgb(' + m1 + ',' + m1 + ',' + m1 + ')';
    document.getElementById("ball2").style.backgroundColor = 'rgb(' + (255-m2) + ',' + (255-m2) + ',' + (255-m2) + ')';
    document.getElementById("ball2").style.color = 'rgb(' + m2 + ',' + m2 + ',' + m2 + ')';
    document.getElementById("ball1").style.left = w*0.50 - v1*10*Math.cos(a*Math.PI/180) + 'px';
    document.getElementById("ball2").style.left = w*0.50 - v2*10*Math.cos(b*Math.PI/180) + 'px';
    document.getElementById("ball1").style.top = h*0.45 - 26 - v1*10*Math.sin(a*Math.PI/180) + 'px';
    document.getElementById("ball2").style.top = h*0.45 + 26 + v2*10*Math.sin(b*Math.PI/180) + 'px';

    //Now calculate dotted line length, pos.
    var x1 = parseFloat(outline1.style.left)-parseFloat(ball1.style.left);
    var y1 = parseFloat(outline1.style.top)-parseFloat(ball1.style.top);
    var l1 = hypotenuse(x1, y1);
    
    document.getElementById("d1").style.width = l1 + 'px';
    document.getElementById("d1").style.transform = "translate(" + parseFloat(ball1.style.left)  +"px," +  parseFloat(ball1.style.top) +"px) rotate(" + a + "deg)";

    var x2 = parseFloat(outline2.style.left)-parseFloat(ball2.style.left);
    var y2 = parseFloat(ball2.style.top)-parseFloat(outline2.style.top);
    var l2 = hypotenuse(x2, y2);

    document.getElementById("d2").style.width = l2 + 'px';
    document.getElementById("d2").style.transform = "translate(" + parseFloat(ball2.style.left)  +"px," +  parseFloat(ball2.style.top) +"px) rotate(" + (-b) + "deg)";

    document.getElementById("d3").style.width = v1f*10 + 'px';
    document.getElementById("d3").style.transform = "translate(" + parseFloat(outline1.style.left)  +"px," + parseFloat(outline1.style.top)  +"px) rotate(" + (-af) + "deg)";

    document.getElementById("d4").style.width = v2f*10 + 'px';
    document.getElementById("d4").style.transform = "translate(" + parseFloat(outline2.style.left)  +"px," + parseFloat(outline2.style.top)  +"px) rotate(" + (-bf) + "deg)";
    document.getElementById("v1out").value = v1f;
    document.getElementById("v2out").value = v2f;
    document.getElementById("aout").value = af;
    document.getElementById("bout").value = -bf;
    document.getElementById("klost").value = klost;
}

function togglePlay(){
    if(playing){
        stopAnimation();
    } else{
        startAnimation();
    }
}

function startAnimation(){
    interval = setInterval(function(){animate();}, 20);
    playing = true;
    document.getElementById("toggler").innerHTML = "Stop Simulation";
}
function out(id){
    var ball = document.getElementById(id);
    var x = parseFloat(ball.style.left);
    var y = parseFloat(ball.style.top);

    return ((x > window.innerWidth+27) ||
            (y < -27) ||
            (y > window.innerHeight+27))
}
function animate(){
    if(out("ball1") && out("ball2")){
        stopAnimation();
    }
    var lines = document.getElementsByClassName("dotted");
    for(var i =0; i<lines.length; i++){ // make sure preview lines are hidden
        if(!lines[i].classList.contains("hide")){
            lines[i].classList.add("hide");
        }
    }

    b1x = parseFloat(ball1.style.left);
    b1y = parseFloat(ball1.style.top);
    b2x = parseFloat(ball2.style.left);
    b2y = parseFloat(ball2.style.top);
    if(b1x == parseFloat(outline1.style.left)
            && b2x == parseFloat(outline2.style.left)
            && b1y == parseFloat(outline1.style.top)
            && b2y == parseFloat(outline2.style.top)){
            collided = true;
    }
    if(b1x <= parseFloat(outline1.style.left)
        && b2x <= parseFloat(outline2.style.left)
        && b1y <= parseFloat(outline1.style.top)
        && b2y >= parseFloat(outline2.style.top)
        && !collided){

        var v1x = v1*Math.cos(a*Math.PI/180)/6;
        var v2x = v2*Math.cos(b*Math.PI/180)/6;

        var v1y = v1*Math.sin(a*Math.PI/180)/6;
        var v2y = v2*Math.sin(b*Math.PI/180)/6;
        ball1.style.left = Math.min(b1x + v1x, parseFloat(outline1.style.left)) + 'px';
        ball1.style.top = Math.min(b1y + v1y, parseFloat(outline1.style.top)) + 'px';

        ball2.style.left = Math.min(b2x + v2x, parseFloat(outline2.style.left)) + 'px';
        ball2.style.top = Math.max(b2y - v2y, parseFloat(outline2.style.top)) + 'px';
    } else{
        collided = true;
        var v1x = v1f*Math.cos(af*Math.PI/180)/6;
        var v2x = v2f*Math.cos(bf*Math.PI/180)/6;

        var v1y = v1f*Math.sin(af*Math.PI/180)/6;
        var v2y = v2f*Math.sin(bf*Math.PI/180)/6;
        ball1.style.left = b1x + v1x + 'px';
        ball1.style.top = b1y - v1y + 'px';
        ball2.style.left = b2x + v2x + 'px';
        ball2.style.top = b2y - v2y + 'px';
    }
}

function stopAnimation(){
    clearInterval(interval);
    setTimeout(function(){ //wait until we are sure we are finished playing the animation. 
        document.getElementById("toggler").innerHTML = "Start Simulation";
        var w = window.innerWidth;
        var h = window.innerHeight;
        var lines = document.getElementsByClassName("dotted");
        for(var i =0; i<lines.length; i++){ 
            document.getElementById(lines[i].id).classList.remove('hide');
        }
        ball1.style.left = w*0.50 - v1*10*Math.cos(a*Math.PI/180) + 'px';
        ball2.style.left = w*0.50 - v2*10*Math.cos(b*Math.PI/180) + 'px';
        ball1.style.top = h*0.45 - 26 - v1*10*Math.sin(a*Math.PI/180) + 'px';
        ball2.style.top = h*0.45 + 26 + v2*10*Math.sin(b*Math.PI/180) + 'px';
        playing = false;
        collided = false;
    }, 100);
}

fixres();
calculateResult(m1, m2, v1, v2, a, b, e);
adjustVisuals();

window.onresize = function(event){
    stopAnimation();
    fixres();
    adjustVisuals();
};

var draggedElem = null;

$(document).ready(function(){
    $('.ball').on({
        mousedown: function(){
            if(!playing){
                draggedElem = $(this);
                $('html').addClass('cursormove');
            }
        },
        mouseup: function(){
            if(!playing){
                draggedElem = null;
                calculateResult(m1, m2, v1, v2, a, b, e);
                adjustVisuals();
                $('html').removeClass('cursormove');
            }
        }
    });

    $(document).on({
        mouseup: function(){
            if(!playing){
                draggedElem = null;
                calculateResult(m1, m2, v1, v2, a, b, e);
                adjustVisuals();
                $('html').removeClass('cursormove');
            }
        }
    });
    $(document).mousemove(function (ev){
        var h = window.innerHeight;
        var w = window.innerWidth;
        var flag = true;
        if(draggedElem && !playing){ /*&& ((parseFloat(draggedElem.css('top')) <= (h*0.45-26) && ev.pageY <= (h*0.45-26)) ||
            (parseFloat(draggedElem.css('top')) >= (h*0.45+26) && ev.pageY >= (h*0.45+26))) &&
            (ev.pageX <= w/2)){*/
                var moveX = ev.pageX;
                if(ev.pageX > w/2){
                    moveX = w/2;
                } 
                var moveY = ev.pageY;
                if(((parseFloat(draggedElem.css('top')) <= (h*0.45-26) && ev.pageY > (h*0.45-26)))){
                    moveY = h*0.45-26;
                }
                if((parseFloat(draggedElem.css('top')) >= (h*0.45+26) && ev.pageY < (h*0.45+26))){
                    moveY = h*0.45 + 26;
                }
                draggedElem.css({'top': moveY, 'left': moveX});
                if(draggedElem[0].id == "ball1"){
                    var v1x = (w/2 - moveX)/10;
                    var v1y = (h*0.45 -26 -moveY)/10;
                    v1 = Math.sqrt(v1x*v1x + v1y*v1y);
                    document.getElementById("v1in").value = v1;
                    if(v1 != 0){
                        a = Math.asin(v1y/v1)*180/Math.PI;
                    } else{
                        a = 0;
                    }
                    document.getElementById("ain").value = a;
                } else if(draggedElem[0].id == "ball2"){
                    var v2x = (w/2 - moveX)/10;
                    var v2y = (h*0.45 +26 -moveY)/10;
                    v2 = Math.sqrt(v2x*v2x + v2y*v2y);
                    document.getElementById("v2in").value = v2;
                    if(v2 != 0){
                        b = Math.asin(Math.abs(v2y)/v2)*180/Math.PI
                    } else{
                        b = 0;
                    }
                    document.getElementById("bin").value = b;
                } else{
                    flag = false;
                }
                if(flag){
                    calculateResult(m1, m2, v1, v2, a, b, e);
                    adjustVisuals();
                }
        } else{
            draggedElem = null;
            //calculateResult(m1, m2, v1, v2, a, b, e);
            //adjustVisuals();
            $('html').removeClass('cursormove');
        }
    });
});

document.oninput = function (event) {
    if(playing){
        stopAnimation();
    }
    v1 = parseFloat(document.getElementById("v1in").value);
    v2 = parseFloat(document.getElementById("v2in").value);
    m1 = parseFloat(document.getElementById("m1in").value);
    m2 = parseFloat(document.getElementById("m2in").value);
    e = parseFloat(document.getElementById("ein").value);
    a = parseFloat(document.getElementById("ain").value);
    b = parseFloat(document.getElementById("bin").value);

    draggedElem = null;
    calculateResult(m1, m2, v1, v2, a, b, e);
    adjustVisuals();
};