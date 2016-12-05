var wheelPosition = 0
var counter = 0
var invisible = true

window.onload = function () {
    //Event 1: wheel
    document.getElementById("wheelme").onwheel = wheel
    //Event 2: onclick (show element)
    document.getElementById("clickme-onclick").onclick = clickmeClick
    //Event 2.5: onclick (hide element)
    document.getElementById("alert-hide").onclick = function() {
        $("#alert-bar").addClass('visuallyhidden')
        $("#alert-bar").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
            $("#alert-bar").addClass('hidden')
        })
    }
    //Event 3: keypress
    document.getElementById("textfield").addEventListener("keyup", keyPressHandler)
    //Event 4: resize
    window.onresize = resize
    //Event 5: mouseover/mouseout
    document.getElementById("mouseover-box").addEventListener("mouseover", function() {
        document.getElementById("mouseover-box").style.backgroundColor = "darkblue"
    })
    document.getElementById("mouseover-box").addEventListener("mouseout", function() {
        document.getElementById("mouseover-box").style.backgroundColor = "darkred"
    })
}

//Resize box on window resize
function resize() { 
    document.getElementById("window-resize").style.width = window.innerHeight / 4 + "px"
    document.getElementById("window-resize").style.height = window.innerWidth / 4 + "px"
}

//Resize text on mouse wheel movement
function wheel(e) {
    wheelPosition += e.deltaY
    var newFontSize = 14 + wheelPosition/500.0;
    document.getElementById("wheelme").style.fontSize = newFontSize + "px"
}

//Show hidden button on click
function clickmeClick() {
    if (invisible)
    {
        invisible = false
        $("#hidden-button").toggleClass('hidden')
        setTimeout(function() {
            $("#hidden-button").toggleClass('visuallyhidden')
        }, 1);
        document.getElementById("clickme-hidden").addEventListener("click", hiddenButtonCounterIncrement)
    }
}

//Increment counter when hidden button clicked (change innerHTML)
function hiddenButtonCounterIncrement() {
    counter += 1
    document.getElementById('hidden-button-counter').innerHTML = "<p>You clicked the hidden button " + counter + " times.</p>"
}

//Change innerText on keypress
function keyPressHandler() {
    document.getElementById('change-text').innerText = document.getElementById('textfield').value
}