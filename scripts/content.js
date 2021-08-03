chrome.runtime.onConnect.addListener(function (port) { });

var request = {};
window.onclick= function(event){
    var element = document.getElementsByTagName("iframe"), index;

    for (index = element.length - 1; index >= 0; index--) {
    element[index].parentNode.removeChild(element[index]);
}
}
window.oncontextmenu = function (event) {
    var selectedText = '';

    selectedText = window.getSelection().toString();
    request = {
        data: selectedText,
        page: window.location.href,
    };
    if (selectedText!=''){
    chrome.runtime.sendMessage(request)
    var searchFrame = document.createElement('iframe'); // is a node
    searchFrame.src="https://www.google.com/search?q="+selectedText+"&igu=1";
    searchFrame.style.left= String(Number(event.pageX)+125) + 'px';
    searchFrame.style.top= event.pageY + 'px';
    searchFrame.style.position='absolute';
    searchFrame.style.zIndex='100';
    searchFrame.height='450';
    searchFrame.width='500';

    //searchFrame.appendTo(document.body);
    document.body.append(searchFrame);
    }
}