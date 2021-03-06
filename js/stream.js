// var connection = new WebSocket('ws://127.0.0.1:5000');

//   connection.onopen = function () {
//     // connection is opened and ready to use
//   };

//   connection.onerror = function (error) {
//     // an error occurred when sending/receiving data
//   };
//   var urlCreator = window.URL || window.webkitURL,
//     imageInner = document.querySelector("#image");
//   connection.onmessage = function (message) {
//     console.log(message.data);
    
//    var imageUrl = urlCreator.createObjectURL(message.data);
//    if(imageUrl!= imageInner.src){

//     imageInner.src = imageUrl;
//    }
//     // handle incoming message
//   };

  // function toDataURL(url, callback) {
  //   var xhr = new XMLHttpRequest();
  //   xhr.onload = function() {
  //     var reader = new FileReader();
  //     reader.onloadend = function() {
  //       callback(reader.result);
  //     }
  //     reader.readAsDataURL(xhr.response);
  //   };
  //   xhr.open('GET', url);
  //   xhr.responseType = 'blob';
  //   xhr.send();
  // }
  function byteLength(str) {
  // returns the byte length of an utf8 string
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}
streamer = {
    private : null,
    public : null,
    isStreaming : false,
    url : (localStorage.url ? localStorage.url : 'https://utils.1ce.org' ) +'/live-stream',
    baseUrl : (localStorage.url ? localStorage.url : 'https://utils.1ce.org' ),
    streamStep : function(){
        context.drawImage(player, 0, 0, canvas.width, canvas.height);

        streamer.streamStepFire(canvas.toDataURL('image/png'));
        // canvas.toBlob(function(blob){
        //         var url = URL.createObjectURL(blob);
        //         console.log('url', blob);

        // },'image/png');
        
    },
    streamStepFire : function(url){
      console.log(byteLength(url));
        streamer.lastStreamed = new Date().getTime();
        streamer.callPostAjax({
            action : 'update channel',
            private:streamer.private,
            public:streamer.public,
            data :btoa(url),
        }, streamer.afterStreamStep/*,"application/x-www-form-urlencoded",true*/);
    },
    afterStreamStep : function(data){
        if(data.status && streamer.isStreaming){
            let nextTime = 300 - (new Date().getTime() - streamer.lastStreamed);
            setTimeout(function(){
                streamer.streamStep();
            }, Math.max(nextTime , 0 ));
        }
    },
    callPostAjax : function(data,cb){
        //contentType = contentType ? contentType : 'application/json; charset=utf-8';
        $.ajax({
            url: streamer.url,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: cb
        });
    },
    stopStreaming : function(){
        captureButton.innerText = chrome.i18n.getMessage("start_stream");
        streamer.isStreaming = false;
        streaming.style.display = 'none';

        setTimeout(fireNotify, 2000);
    },
    startStreaming : function(){
        captureButton.innerText = chrome.i18n.getMessage("stop_stream");
        streamer.isStreaming = true;
        streaming.style.display = 'block';
        localStorage.setItem('used', 1);
        streamer.openChannel(function(){
            streamer.streamStep();
        })
    },
    openChannel : function(callback){
        streamer.callPostAjax({action:'start channel'}, function(data){
            if(data.status){
                let link = streamer.baseUrl + '/live-stream-live#' + data.public;
                //console.log('showLink',showLink,link);
                //var aTag = $('<a>').attr('href',link).appendTo(showLink)
                $(showLink).html('<p><div class="label">' + chrome.i18n.getMessage("your_link") + '</div><a href="' +link+ '" target="_blank">' +link + '</a></p>');
                //console.log(divStr);
                //showLink.innerHtml = divStr;  
                streamer.private = data.private;
                streamer.public = data.public;
                callback();
            }
        });
    }
}

  localstream = null;
  isStreaming = false;
  captureButton = document.getElementById('capture');
  showLink = document.getElementById('show-link');
  streaming = document.getElementById('streaming');
  player = null;
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  h2 = document.getElementById('h2');
  h2.innerText = chrome.i18n.getMessage("h2_title");
  captureButton.innerText = chrome.i18n.getMessage("start_stream");
  streaming.innerText = chrome.i18n.getMessage("streaming");

  GumHelper.startVideoStreaming(function callback(err, stream, videoElement, width, height) {
    if(err) {
      errorDiv = document.getElementById('error');
      errorDiv.classList.add('visible');
    } else {
       
        player = videoElement;
        videoElement.id = 'vid';
        document.getElementsByClassName('video-wrp-inner')[0].appendChild(videoElement);
        canvas.width = width;
        canvas.height = height;
        // (or you could just keep a reference and use it later)
    }
  }, { timeout: 20000 });

  captureButton.addEventListener('click', () => {
      if(streamer.isStreaming){
        streamer.stopStreaming();
      }
      else{
        streamer.startStreaming();
        
      }

  });
  
if(localStorage.getItem('used')){
  setTimeout(fireNotify, 5000);
}

function fireNotify(){
  checkIfRankNeededAndAndAddRank();
}


// callPostAjax({action:'start channel'}, function(data){
//     console.log(data)
//     var pr = data.private;
// setInterval(()=>{
// var size1 = 100+ Math.floor(Math.random() * 200),
// size3 = 100+Math.floor(Math.random() * 250)
//     toDataURL('https://picsum.photos/' + size1 + '/' + size3, function(dataUrl) {
//         callPostAjax({
//             action : 'update channel',
//             private:pr,
//             public:data.public,
//             data :dataUrl
//         })
//     });
// },2000)
// })
  