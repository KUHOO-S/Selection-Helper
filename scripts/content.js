chrome.runtime.onConnect.addListener(function (port) { });

var request = {};
window.onclick = function (event) {
    clearFrames();
}
window.oncontextmenu = function (event) {
    clearFrames();
    var selectedText = '';

    selectedText = window.getSelection().toString();
    request = {
        data: selectedText,
        page: window.location.href,
        action: 'handleMessage'
    };
    if (selectedText != '') {
        chrome.runtime.sendMessage(request);

        /*var url = "https://www.google.com/search?q=";

        x = chrome.runtime.sendMessage({
            "action": 'setzeFrame', "selectedText": selectedText, "url": url, "event": event,
        });

        document.body.append(x)

        console.log("frame recieved");
        console.log(x);
        //setzeFrame(selectedText,url,event)

        */
       
        //build iframe
        buildSearchFrame(event);
        //build optionBar
        buildOptionBar(event);

    }
}
function clearFrames() {
    var element = document.getElementsByClassName("searchFrame"), index;

    for (index = element.length - 1; index >= 0; index--) {
        element[index].parentNode.removeChild(element[index]);

    }
    var element = document.getElementsByClassName("optionBar");

    for (index = element.length - 1; index >= 0; index--) {
        element[index].parentNode.removeChild(element[index]);
    }
}

function buildSearchFrame(event) {
    var searchFrame = document.createElement('iframe'); // is a node
    searchFrame.className = "searchFrame"

    searchFrame.src = "https://www.google.com/search?q=" + selectedText + "&igu=1";
    searchFrame.style.left = String(Number(event.pageX) + 125) + 'px';
    searchFrame.style.top = event.pageY + 'px';

    document.body.append(searchFrame);

}

function buildOptionBar(event) {
    var optionBar = document.createElement('div'); // is a node
    optionBar.className = "optionBar"

    optionBar.style.left = String(Number(event.pageX) + 125) + 'px';
    optionBar.style.top = String(Number(event.pageY) - 75) + 'px';

    optionBar.innerHTML = '<img class="optionBarImage" src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png"> <img class="optionBarImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png"><img class="optionBarImage" src="https://www.freeiconspng.com/thumbs/youtube-logo-png/youtube-logo-png-picture-13.png"> <img class="optionBarImage" src="https://pngimg.com/uploads/wikipedia/wikipedia_PNG35.png">';
    document.body.append(optionBar);

}