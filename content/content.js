chrome.runtime.onConnect.addListener(function (port) { });
chrome.storage.local.get(['checkBoxValue0'], function (result) {
    console.log('Value currently is ' + result.checkBoxValue0);
    if (result.checkBoxValue0 === undefined) {
        chrome.storage.local.set({ checkBoxValue0: true }, function () {
            console.log(true);

        });
    }

});
chrome.storage.local.get(['checkBoxValue1'], function (result) {
    console.log('Value currently is ' + result.checkBoxValue1);
    if (result.checkBoxValue1 === undefined) {
        chrome.storage.local.set({ checkBoxValue1: true }, function () {
            console.log(true);

        });
    }

});
chrome.storage.local.get(['checkBoxValue2'], function (result) {
    console.log('Value currently is ' + result.checkBoxValue2);
    if (result.checkBoxValue2 === undefined) {
        chrome.storage.local.set({ checkBoxValue2: true }, function () {
            console.log(true);

        });
    }

});
chrome.storage.local.get(['checkBoxValue3'], function (result) {
    console.log('Value currently is ' + result.checkBoxValue3);
    if (result.checkBoxValue3 === undefined) {
        chrome.storage.local.set({ checkBoxValue3: true }, function () {
            console.log(true);

        });
    }

});

chrome.storage.local.get(['checkBoxValue4'], function (result) {
    console.log('Value currently is ' + result.checkBoxValue4);
    if (result.checkBoxValue4 === undefined) {
        chrome.storage.local.set({ checkBoxValue4: true }, function () {
            console.log(true);

        });
    }

});

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
        event.preventDefault();

        //chrome.runtime.sendMessage(request);
        var leftMargin=Number(event.pageX) + 125+$(window).width()/4;
        console.log(leftMargin);
        console.log($(window).width());
        if (leftMargin>$(window).width()){
            console.log("ku");
            leftMargin=$(window).width()-($(window).width()/4);
        }
        else{
            leftMargin=leftMargin-$(window).width()/4;
        }
        var topMargin=Number(event.pageY);
        
        //build iframe
        buildSearchFrame(event, selectedText,leftMargin,topMargin);

        //build optionBar
        buildOptionBar(event, selectedText,leftMargin,topMargin);

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

function buildSearchFrame(event, selectedText,leftMargin,topMargin) {
    var searchFrame = document.createElement('iframe');
    searchFrame.className = "searchFrame";

    searchFrame.src = "https://www.google.com/search?q=" + selectedText + "&igu=1";
    searchFrame.style.left = String(leftMargin) + 'px';
    searchFrame.style.top = String(topMargin) + 'px';
    searchFrame.style.width=$(window).width()/4+'px';
    searchFrame.style.height=$(window).height()/2+'px';
    document.body.append(searchFrame);

}

function buildOptionBar(event, selectedText,leftMargin,topMargin) {
    var options = ['checkBoxValue0','checkBoxValue1', 'checkBoxValue2', 'checkBoxValue3', 'checkBoxValue4'];
    var images = ['https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png', 'https://www.freeiconspng.com/thumbs/youtube-logo-png/youtube-logo-png-picture-13.png', 'https://pngimg.com/uploads/wikipedia/wikipedia_PNG35.png', 'https://www.freepnglogos.com/uploads/twitter-logo-png/twitter-logo-vector-png-clipart-1.png']
    var optionsHrefs=['https://google.com/search?q=','https://stackoverflow.com/search?q=','https://www.youtube.com/results?search_query=','https://en.wikipedia.org/wiki/','https://twitter.com/search?q=']
    var optionBar = document.createElement('div');
    optionBar.className = "optionBar"
    
    optionBar.style.left = String(leftMargin) + 'px';
    optionBar.style.top = String(Number(topMargin) - 75) + 'px';
    optionBar.style.width=$(window).width()/4+'px';
    optionBar.style.height=$(window).height()/16+'px';
    
    for(var i=0;i<options.length;i++){
        console.log(String(options[i]))
        getObjectFromLocalStorage(options[i],images[i],optionsHrefs[i],optionBar,selectedText)
    
        }
        document.body.append(optionBar);

};

const getObjectFromLocalStorage = async function(key,image,optionsHref,optionBar,selectedText) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(key, function(value) {
          resolve(value[key]);
          console.log(value[key])
          if(value[key]){
            var imgButton = document.createElement('img');
            imgButton.className = 'optionBarImage';
            imgButton.src = image;
            console.log(image)
            optionBar.appendChild(imgButton);
            var anchor = document.createElement('a');
            anchor.target = "blank";
            anchor.href = optionsHref + selectedText; 
            anchor.appendChild(imgButton);
            optionBar.appendChild(anchor);

          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };
  
const saveObjectInLocalStorage = async function(obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj, function() {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};