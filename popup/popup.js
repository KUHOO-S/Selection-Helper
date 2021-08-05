let tabHeader = document.getElementsByClassName("tab-header")[0];
let tabIndicator = document.getElementsByClassName("tab-indicator")[0];
let tabBody = document.getElementsByClassName("tab-body")[0];
 
let tabsPane = tabHeader.getElementsByTagName("div");
 
for(let i=0;i<tabsPane.length;i++){
  tabsPane[i].addEventListener("click",function(){
    tabHeader.getElementsByClassName("active")[0].classList.remove("active");
    tabsPane[i].classList.add("active");
    tabBody.getElementsByClassName("active")[0].classList.remove("active");
    tabBody.getElementsByTagName("div")[i].classList.add("active");
    
    tabIndicator.style.left = `calc(calc(100% / 4) * ${i})`;
  });
}


/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

bkg = chrome.extension.getBackgroundPage(); // Retrieving a reference to the backgroundpage

// Display of the number of copied URLs, message sent by the background page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if (typeof request.type != 'string') return;
	switch(request.type){
		case "copy":
			var nombre = (request.copied_url > 1) ? 's' : '';
			jQuery('#message').removeClass('error').html("<b>"+request.copied_url+"</b> url"+nombre+" successfully copied !");
			setTimeout(function(){window.close();}, 3000); // Closing of the popup a few seconds after displaying the message
			break;
		case "paste":
			// If an error message is present, we display it, otherwise we close the popup
			if (request.errorMsg) {
				jQuery('#message').addClass('error').html(request.errorMsg);
				return;
			}
			window.close();
			break;
	}
});

// Loading google analytics
// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', bkg.AnalyticsHelper.gaAccount]);
// _gaq.push(['_trackPageview']);
// bkg.AnalyticsHelper.gaLoad(document);

/**
* Management of popup buttons
*/
jQuery(function($){
	$('#actionCopy').on('click', function(e, fromDefaultAction){
		var gaEvent = {
			action: 'Copy',
			label: (fromDefaultAction === true) ? 'BrowserAction' : 'Popup',
			actionMeta: bkg.AnalyticsHelper.getActionMeta("copy")
		};
		
		// We get the current window
		chrome.windows.getCurrent(function(win){
			bkg.Action.copy({window: win, gaEvent: gaEvent});
		});
	});
	$('#actionPaste').on('click', function(e, fromDefaultAction){
		var gaEvent = {
			action: 'Paste',
			label: (fromDefaultAction === true) ? 'BrowserAction' : 'Popup',
			actionMeta: bkg.AnalyticsHelper.getActionMeta("paste")
		};
		
		bkg.Action.paste({gaEvent: gaEvent});
	});
		// $('#actionOption').click(function(e){
		// 	_gaq.push(['_trackEvent', 'Internal link', 'Option', 'options.html']);
		// 	chrome.tabs.create({url: 'options.html'});
		// });
		// $('#contribute a').click(function(e){
		// 	_gaq.push(['_trackEvent', 'Internal link', 'Contribute', 'options.html#donate']);
		// 	chrome.tabs.create({url: 'options.html#donate'});
		// });
		
	// Default action
		// var default_action = localStorage['default_action'] ? localStorage['default_action'] : "menu";
		// if( default_action != "menu" ){
		// 	// Masquage des boutons
		// 	$('body>ul').hide();
		// 	$('#message').css({'padding':'3px 0 5px'});
			
		// 	// Triggering of the default action configured in the options
		// 	switch(default_action){
		// 		case "copy":
		// 			$('#actionCopy').trigger('click', [true]);
		// 			break;
		// 		case "paste":
		// 			$('#actionPaste').trigger('click', [true]);
		// 			break;
		// 	}
		// }
	
	// New version notification display in the option page
		// if (bkg.UpdateManager.updateNotify()) {
		// 	var content = "New version recently installed. Check the <a href=\"https://vincepare.github.io/CopyAllUrl_Chrome/\">changelog</a>.";
		// 	$('#recently-updated').html(content).show().find('a').click(function(e){
		// 		_gaq.push(['_trackEvent', 'External link', 'changelog recent update', $(this).attr('href')]);
		// 		chrome.tabs.create({url: $(this).attr('href')});
		// 	});
		// }
});