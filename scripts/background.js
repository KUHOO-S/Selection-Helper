function handleMessage(request){

    alert('"'+request.data+'"\n\n'+request.page);
}
chrome.runtime.onMessage.addListener(handleMessage);
