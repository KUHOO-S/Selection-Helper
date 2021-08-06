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
        event.preventDefault();

        //chrome.runtime.sendMessage(request);

        //build iframe
        buildSearchFrame(event, selectedText);

        //build optionBar
        buildOptionBar(event, selectedText);

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

function buildSearchFrame(event, selectedText) {
    var searchFrame = document.createElement('iframe');
    searchFrame.className = "searchFrame";

    searchFrame.src = "https://www.google.com/search?q=" + selectedText + "&igu=1";
    searchFrame.style.left = String(Number(event.pageX) + 125) + 'px';
    searchFrame.style.top = event.pageY + 'px';
    document.body.append(searchFrame);

}

function buildOptionBar(event, selectedText) {
    var options=[0,0,0,0,0]
    var images=['https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png','https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png','https://www.freeiconspng.com/thumbs/youtube-logo-png/youtube-logo-png-picture-13.png','https://pngimg.com/uploads/wikipedia/wikipedia_PNG35.png', 'https://www.freepnglogos.com/uploads/twitter-logo-png/twitter-logo-vector-png-clipart-1.png']
    
    var optionBar = document.createElement('div');
    optionBar.className = "optionBar"

    optionBar.style.left = String(Number(event.pageX) + 125) + 'px';
    optionBar.style.top = String(Number(event.pageY) - 75) + 'px';


    chrome.storage.local.get(['checkBoxValue0'], function (result) {
        console.log('Value currently is ' + result.checkBoxValue0);
        if (result.checkBoxValue0) {
            options[0]=1;
            var googleButton = document.createElement('img');
            googleButton.className = 'optionBarImage';
            googleButton.src = images[0];
            optionBar.appendChild(googleButton);
            var anchor=document.createElement('a');
            anchor.target = "blank";
            anchor.href='https://google.com/search?q='+ selectedText + "&igu=1" ;
            anchor.appendChild(googleButton);
            optionBar.appendChild(anchor);
            
        }
    });
    chrome.storage.local.get(['checkBoxValue1'], function (result) {
        console.log('Value currently is ' + result.checkBoxValue1);
        if (result.checkBoxValue1) {
            options[1]=1;
            var googleButton = document.createElement('img');
            googleButton.className = 'optionBarImage';
            googleButton.src = images[1];
            var anchor=document.createElement('a');
            anchor.target = "blank";
            anchor.href='https://stackoverflow.com/search?q='+ selectedText ;
            anchor.appendChild(googleButton);
            optionBar.appendChild(anchor);
        }
    });

    chrome.storage.local.get(['checkBoxValue2'], function (result) {
        console.log('Value currently is ' + result.checkBoxValue2);
        if (result.checkBoxValue2) {
            options[2]=1;
            var googleButton = document.createElement('img');
            googleButton.className = 'optionBarImage';
            googleButton.src = images[2];
            optionBar.appendChild(googleButton);
            var anchor=document.createElement('a');
            anchor.target = "blank";
            anchor.href='https://www.youtube.com/results?search_query='+ selectedText ;
            anchor.appendChild(googleButton);
            optionBar.appendChild(anchor);

        }
    });
    chrome.storage.local.get(['checkBoxValue3'], function (result) {
        console.log('Value currently is ' + result.checkBoxValue3);
        if (result.checkBoxValue3) {
            options[3]=1;
            var googleButton = document.createElement('img');
            googleButton.className = 'optionBarImage';
            googleButton.src = images[3];
            optionBar.appendChild(googleButton);
            var anchor=document.createElement('a');
            anchor.target = "blank";
            anchor.href='https://en.wikipedia.org/wiki/' + selectedText ;
            anchor.appendChild(googleButton);
            optionBar.appendChild(anchor);

        }
    });

    chrome.storage.local.get(['checkBoxValue4'], function (result) {
        console.log('Value currently is ' + result.checkBoxValue4);
        if (result.checkBoxValue4) {
            options[4]=1;
            var googleButton = document.createElement('img');
            googleButton.className = 'optionBarImage';
            googleButton.src = images[4];
            var anchor=document.createElement('a');
            anchor.target = "blank";
            anchor.href='https://twitter.com/search?q='+ selectedText ;
            anchor.appendChild(googleButton);
            optionBar.appendChild(anchor);
        }
    });

            //optionBar.innerHTML = '<img class="optionBarImage" src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png"> <img class="optionBarImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png"><img class="optionBarImage" src="https://www.freeiconspng.com/thumbs/youtube-logo-png/youtube-logo-png-picture-13.png"> <img class="optionBarImage" src="https://pngimg.com/uploads/wikipedia/wikipedia_PNG35.png">';
            document.body.append(optionBar);

        }
        