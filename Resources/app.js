// this sets the background color of the master UIView (when there are no windows/tab groups on it)
var titaniumBarcode = require('com.mwaysolutions.barcode');

var win = Titanium.UI.createWindow({
    title:'Librize',
    backgroundColor:'#fff'
});

var web = Ti.UI.createWebView({
    top: 120,
    height: '100%',
    width: '100%'
});

web.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1';

web.url = 'http://librize.com/';

win.add(web);

var barcodeLabel = Titanium.UI.createLabel({
    color: '#000',
    backgroundColor: '#fff',
    top: 0,
    text: 'N/A',
    textAlign: 'center',
    font: { fontSize:48 },
    width: '100%',
    height: '60px'
});
  
win.add(barcodeLabel);

function scan() {
    titaniumBarcode.scan({
        success: function (data) {
          if(data && data.barcode) {
            barcodeLabel.text = data.barcode;
            web.evalJS("document.getElementById('place_item_code').value='" + data.barcode + "';");
            web.evalJS("document.getElementById('new_place_item').submit()");
            
            // http://www.brainstorm-inc.jp/faq.html
            var sound = Ti.Media.createSound({
                url:'Alarm0070.x    mp3'
            });
            sound.start();
          } else {
            alert(JSON.stringify(data));
          }
        },

        error: function (err) {
          alert('Error while scanning: ' + err);
        },

        cancel: function () {
          alert('Scan cancelled');
        }
      });
}

var scanButton = Titanium.UI.createButton({
    title: 'Scan barcode',
    top: 60,
    left: 0,
    width: '100%',
    height: '60px'
});

scanButton.addEventListener('click', function (e) {
    scan();
});

win.add(scanButton);

win.open();

