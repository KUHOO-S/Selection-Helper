chrome.runtime.onConnect.addListener(function (port) { });

var request = {};
window.oncontextmenu = function (event) {
    var selectedText = '';

    selectedText = window.getSelection().toString();
    request = {
        data: selectedText,
        page: window.location.href,
    };
    chrome.runtime.sendMessage(request)
}