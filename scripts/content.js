chrome.runtime.onConnect.addListener(function (port) { });

var request = {};
window.oncontextmenu = function (event) {
    var selectedText = '';

    selectedText = window.getSelection().toString();
    request = {
        data: selectedText,
        page: window.location.href,
    };
    if (selectedText!=''){
    chrome.runtime.sendMessage(request)
    var searchFrame = document.createElement('div'); // is a node
    searchFrame.innerHTML = '<iframe src="https://www.google.com/search?q='+selectedText+'&igu=1"></iframe>';
    document.body.appendChild(searchFrame);
    
}
}