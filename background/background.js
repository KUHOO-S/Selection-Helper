/**
* Manage access to the clipboard
* (we have to go through the background page to access it, see: http://stackoverflow.com/questions/6925073/copy-paste-not-working-in-chrome-extension)
*/
Clipboard = {
	/**
	* Writes the string passed as a parameter to the clipboard ("Copy" function)
	*
	* We do not have access to the clipboard via the Google Chrome API,
	* so the trick is to put the text to copy in a <textarea>,
	* to select all the contents of this <textarea>, and to copy.
	*
	* @param String str String to copy to clipboard
	* @param Bool extended_mime Indicates whether to copy the MIME type text / html in addition to the plain text
	*/
	write: function (str, extended_mime) {
		if (str == '' || str == undefined) {
			str = '<empty>';
		}

		// Copy by default, via the clipboardBuffer
		clipboardBuffer.val(str);
		clipboardBuffer.select();

		// Copy via API (clipboardData)
		var oncopyBackup = document.oncopy;
		document.oncopy = function (e) {
			// If we are not using the html MIME type, we immediately exit to leave control to the default method: clipboardBuffer
			if (typeof extended_mime == "undefined" || extended_mime != true) {
				return;
			}
			e.preventDefault();
			e.clipboardData.setData("text/html", str);
			e.clipboardData.setData("text/plain", str);
		};
		document.execCommand('copy');
		document.oncopy = oncopyBackup;
	},

	/**
	* Returns the content of the clipboard (String)
	*/
	read: function () {
		clipboardBuffer.val('');
		clipboardBuffer.select();
		document.execCommand('paste')
		return clipboardBuffer.val();
	}
};

/**
* Object that manages actions (click on functionality links in popup.html)
*/
Action = {
	/**
	* Copy the URLs of the window passed as a parameter to the clipboard
	* @param opt.window  : window from which URLs are copied
	* @param opt.gaEvent : data necessary for the generation of the event ga (action, label, actionMeta)
	*/
	copy: function (opt) {
		// By default, we get all the tabs of the opt.window window
		var tabQuery = { windowId: opt.window.id };
		console.log("in copy func")
		// If "Copy tabs from all windows" is checked, deletion of the filter on current window
		try {
			if (localStorage["walk_all_windows"] == "true") {
				tabQuery.windowId = null;
			}
		} catch (ex) { }

		chrome.tabs.query(tabQuery, function (tabs) {
			// Configuration recovery
			var format = localStorage['format'] ? localStorage['format'] : 'text';
			var highlighted_tab_only = localStorage['highlighted_tab_only'] == 'true' ? true : false;
			var extended_mime = typeof localStorage['mime'] != 'undefined' && localStorage['mime'] == 'html' ? true : false;
			var outputText = '';

			// Filtering tabs
			var tabs_filtered = [];
			for (var i = 0; i < tabs.length; i++) {
				if (highlighted_tab_only && !tabs[i].highlighted) continue;
				tabs_filtered.push(tabs[i]);
			}
			tabs = tabs_filtered;

			// Generation of copied data
			if (format == 'html') {
				outputText = CopyTo.html(tabs);
			} else if (format == 'custom') {
				outputText = CopyTo.custom(tabs);
			} else if (format == 'json') {
				outputText = CopyTo.json(tabs);
				extended_mime = false;
			} else {
				outputText = CopyTo.text(tabs);
				extended_mime = false;
			}

			// Copy the list of URLs to the clipboard
			Clipboard.write(outputText, extended_mime);

			// Tells the popup the number of copied URLs, for display in the popup
			chrome.runtime.sendMessage({ type: "copy", copied_url: tabs.length });

			// Tracking event
			_gaq.push(['_setCustomVar', 3, 'ActionMeta', opt.gaEvent.actionMeta]);
			_gaq.push(['_trackEvent', 'Action', opt.gaEvent.action, opt.gaEvent.label, tabs.length]);
		});
	},

	email: function (opt) {
		if(opt.error)
		{
			chrome.runtime.sendMessage({ type: "email", errorMsg: "Please enter email" });
			return;
		}
		else{
		
		// By default, we get all the tabs of the opt.window window
		var outputText = Clipboard.read();
		console.log(typeof (outputText))
		var url = "https://api.sendgrid.com/v3/mail/send";

		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);

		xhr.setRequestHeader("Authorization", "Bearer");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				console.log(xhr.status);
				console.log(xhr.responseText);
				if (xhr.status>=400)
				chrome.runtime.sendMessage({ type: "email", errorMsg: xhr.responseText });
			}
		};
		data = {
			"personalizations": [{ "to": [{ "email": opt.emailId }] }],
			"from": { "email": "searchtap.team@gmail.com" },
			"subject": "Copied Urls from SearchTap",
			"content": [{ "type": "text/plain", "value": outputText }]
		}

		xhr.send(JSON.stringify(data));

		// Tells the popup the number of copied URLs, for display in the popup
		chrome.runtime.sendMessage({ type: "email",emailId :opt.emailId });

	}
},



	/**
	* Open all URLs from the clipboard in new tabs
	* @param opt.gaEvent : data necessary for the generation of the event ga (action, label, actionMeta)
	*/
	paste: function (opt) {
		var clipboardString = Clipboard.read();

		// Extraction of URLs, either line by line or intelligent paste
		if (localStorage["intelligent_paste"] == "true") {
			var urlList = clipboardString.match(/(https?|ftp|ssh|mailto):\/\/[a-z0-9\/:%_+.,#?!@&=-]+/gi);
		} else {
			var urlList = clipboardString.split("\n");
		}

		// If urlList is empty, we display an error message and we exit
		if (urlList == null) {
			chrome.runtime.sendMessage({ type: "paste", errorMsg: "No URL found in the clipboard" });
			return;
		}

		// URL extraction for lines in HTML format (<a ...> # url </a>)
		$.each(urlList, function (key, val) {
			var matches = val.match(new RegExp('<a[^>]+href="([^"]+)"', 'i'));
			try {
				urlList[key] = matches[1];
			} catch (e) { }

			urlList[key] = jQuery.trim(urlList[key]);
		});

		// Removal of non-compliant URLs
		urlList = urlList.filter(function (url) {
			if (url == "" || url == undefined) {
				return false;
			}
			return true;
		});

		// Open all URLs in tabs
		$.each(urlList, function (key, val) {
			chrome.tabs.create({ url: val });
		});

		// Tells the popup to close
		chrome.runtime.sendMessage({ type: "paste" });

		// Tracking event
		_gaq.push(['_setCustomVar', 3, 'ActionMeta', opt.gaEvent.actionMeta]);
		_gaq.push(['_trackEvent', 'Action', opt.gaEvent.action, opt.gaEvent.label, urlList.length]);
	}
};

/**
* Functions for copying URLs into a string
*/
CopyTo = {
	// Copy tab URLs in html format
	html: function (tabs) {
		var anchor = localStorage['anchor'] ? localStorage['anchor'] : 'url';
		var row_anchor = '';
		var s = '';
		for (var i = 0; i < tabs.length; i++) {
			row_anchor = tabs[i].url;
			if (anchor == 'title') {
				try {
					Encoder.EncodeType = "entity";
					row_anchor = Encoder.htmlEncode(tabs[i].title);
				} catch (ex) {
					row_anchor = tabs[i].title;
				}
			}
			s += '<a href="' + tabs[i].url + '">' + row_anchor + '</a><br/>';
			s = s + "\n";
		}
		return s;
	},

	// Copy tab URLs in custom format
	custom: function (tabs) {
		var template = (localStorage['format_custom_advanced'] && localStorage['format_custom_advanced'] != '') ? localStorage['format_custom_advanced'] : null;
		if (template == null) {
			return 'ERROR : Row template is empty ! (see options page)';
		}
		var s = '';
		for (var i = 0; i < tabs.length; i++) {
			var current_row = template;
			var current_url = tabs[i].url;
			var current_title = tabs[i].title;

			// Encoding (html entities) of the title
			// try{
			// Encoder.EncodeType = "entity";
			// current_title = Encoder.htmlEncode(current_title);
			// } catch(ex){}

			// Injecting variables into the template
			current_row = current_row.replace(/\$url/gi, current_url);
			current_row = current_row.replace(/\$title/gi, current_title);

			s += current_row;
		}
		return s;
	},

	// Copy tab URLs in text format
	text: function (tabs) {
		var s = '';
		for (var i = 0; i < tabs.length; i++) {
			s += tabs[i].url;
			s = s + "\n";
		}
		return s;
	},

	// Copy tab URLs in JSON format
	json: function (tabs) {
		var data = [];
		for (var i = 0; i < tabs.length; i++) {
			data.push({ url: tabs[i].url, title: tabs[i].title });
		}
		return JSON.stringify(data);
	}
};

/**
* Keyboard shortcuts
*/
chrome.commands.onCommand.addListener(function (command) {
	switch (command) {
		case "copy":
			var gaEvent = {
				action: 'Copy',
				label: 'Command',
				actionMeta: AnalyticsHelper.getActionMeta("copy")
			};
			chrome.windows.getCurrent(function (win) {
				Action.copy({ window: win, gaEvent: gaEvent });
			});
			break;
		case "paste":
			var gaEvent = {
				action: 'Paste',
				label: 'Command',
				actionMeta: AnalyticsHelper.getActionMeta("paste")
			};
			Action.paste({ gaEvent: gaEvent });
			break;
	}
});

/**
* Update notification
*/
UpdateManager = {
	/** Informaion filled by the runtime.onInstalled callback */
	runtimeOnInstalledStatus: null,

	/** (bool) Indicates whether the update notification is active */
	updateNotify: function () {
		return localStorage['update_notify'] === "true" && UpdateManager.recentUpdate();
	},

	/** (bool) Indicates if an update of the extension has taken place recently*/
	recentUpdate: function () {
		try {
			var timeDiff = new Date().getTime() - new Date(parseInt(localStorage['update_last_time'])).getTime();
			if (timeDiff < 1000 * 3600 * 24) {
				return true;
			}
		} catch (ex) { }
		return false;
	},

	/** Set the badge if an update has taken place recently */
	setBadge: function () {
		if (!UpdateManager.updateNotify()) {
			chrome.browserAction.setBadgeText({ text: '' });
			return;
		}
		chrome.browserAction.setBadgeText({ text: 'NEW' });
	}
};
UpdateManager.setBadge();
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason != 'update') {
		UpdateManager.runtimeOnInstalledStatus = "Not an update (" + details.reason + ")"
		return;
	}

	if (details.previousVersion == chrome.runtime.getManifest().version) {
		UpdateManager.runtimeOnInstalledStatus = "Same version (" + details.previousVersion + ")";
		return;
	}

	// Memorization of the date of the last update
	localStorage['update_last_time'] = new Date().getTime();
	localStorage['update_previous_version'] = details.previousVersion;
	UpdateManager.runtimeOnInstalledStatus = "Updated";

	// Badge update
	UpdateManager.setBadge();

	// Tracking event
	_gaq.push(['_trackEvent', 'Lifecycle', 'Update', details.previousVersion]);

	// Notification display
	chrome.notifications.onClicked.addListener(function (notificationId) {
		if (notificationId == "cpau_update_notification") {
			_gaq.push(['_trackEvent', 'Internal link', 'Notification', 'https://vincepare.github.io/CopyAllUrl_Chrome/']);
			chrome.tabs.create({ url: 'https://vincepare.github.io/CopyAllUrl_Chrome/' });
		}
	});
	if (UpdateManager.updateNotify()) {
		chrome.notifications.create("cpau_update_notification", {
			type: "basic",
			title: "Copy All Urls updated",
			message: "New version installed : " + chrome.runtime.getManifest().version + ". Click to see new features.",
			iconUrl: "img/umbrella_128.png"
		}, function (notificationId) { });
	}
});

/**
* Web analytics utility functions
*/
AnalyticsHelper = {
	/** Function that retrieves the extension key, to retrieve information on it (like its version) */
	getChromeExtensionKey: function () {
		var url = chrome.extension.getURL('stop');
		var matches = chrome.extension.getURL('stop').match(new RegExp("[a-z0-9_-]+://([a-z0-9_-]+)/stop", "i"));
		return (matches[1] == undefined) ? false : matches[1];
	},

	/** Returns a character string (serialized json object) which contains information about the configuration of the plugin */
	getShortSettings: function (settings) {
		if (settings == undefined) {
			settings = localStorage;
		}

		var shortSettings = {
			fm: localStorage['format'] ? localStorage['format'] : 'text',
			an: localStorage['anchor'] ? localStorage['anchor'] : 'url',
			da: localStorage['default_action'] ? localStorage['default_action'] : "menu",
			mm: localStorage['mime'] ? localStorage['mime'] : 'plaintext',
			hl: localStorage['highlighted_tab_only'] == "true" ? 1 : 0,
			ip: localStorage['intelligent_paste'] == "true" ? 1 : 0,
			ww: localStorage['walk_all_windows'] == "true" ? 1 : 0
		};

		return AnalyticsHelper.serialize(shortSettings);
	},

	/** Returns a configuration snippet for tracking Action category events */
	getActionMeta: function (action) {
		switch (action) {
			case "copy":
				var shortSettings = {
					fm: localStorage['format'] ? localStorage['format'] : 'text',
					an: localStorage['anchor'] ? localStorage['anchor'] : 'url',
					mm: localStorage['mime'] ? localStorage['mime'] : 'plaintext',
					hl: localStorage['highlighted_tab_only'] == "true" ? 1 : 0,
					ww: localStorage['walk_all_windows'] == "true" ? 1 : 0
				};
				break;
			case "paste":
				var shortSettings = {
					ip: localStorage['intelligent_paste'] == "true" ? 1 : 0
				};
				break;
		}
		return AnalyticsHelper.serialize(shortSettings);
	},

	/** Serializes an object for transmission to ga. data must be an array (array or object) */
	serialize: function (data) {
		var chunks = [];
		for (var i in data) {
			chunks.push(i + ":" + data[i]);
		}
		var serialized = chunks.join(",");
		return serialized;
	},

	/** Load google analytics (ga.js) in the document passed as a parameter */
	gaLoad: function (doc) {
		var ga = doc.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = doc.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	},

	/** Google Analytics account ID */
	gaAccount: 'UA-30512078-5'
};

// Loading google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', AnalyticsHelper.gaAccount]);
_gaq.push(['_setCustomVar', 1, 'Version', chrome.runtime.getManifest().version, 2]);
_gaq.push(['_setCustomVar', 2, 'Settings', AnalyticsHelper.getShortSettings(), 2]);
_gaq.push(['_trackPageview']);
AnalyticsHelper.gaLoad(document);

jQuery(function ($) {
	// When loading the page, we create a textarea which will be used to read and write in the clipboard
	clipboardBuffer = $('<textarea id="clipboardBuffer"></textarea>');
	clipboardBuffer.appendTo('body');
});

function handleMessage(request) {
	//alert('"' + request.data + '"\n\n' + request.page);
	console.log(request.data);
}
//chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	switch (request.action) {

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