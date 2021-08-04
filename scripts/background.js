
function handleMessage(request) {
    //alert('"' + request.data + '"\n\n' + request.page);
    console.log(request.data);
}
//chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){

    switch(request.action){

        //case "setzeFrame":
        //    sendResponse({"huh":setzeFrame(request.selectedText,request.url,request.event)});
        case "handleMessage":
            return handleMessage(request);
        default:
            return;

    }


});

/*function setzeFrame(selectedText,url,event){
    var searchFrame = document.createElement('iframe'); // is a node
            searchFrame.src = "https://www.google.com/search?q=" + selectedText + "&igu=1";
            searchFrame.style.left = String(Number(event.pageX) + 125) + 'px';
            searchFrame.style.top = event.pageY + 'px';
            searchFrame.style.position = 'absolute';
            searchFrame.style.zIndex = '100';
            searchFrame.height = '450';
            searchFrame.width = '500';
            document.body.append(searchFrame);
            console.log("i trie")
            console.log(searchFrame)
            return searchFrame;
    }
*/