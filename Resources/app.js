// this sets the background color of the master UIView (when there are no windows/tab groups on it)
var titaniumBarcode = require('com.mwaysolutions.barcode');
var UDP = require('ti.udp');

var Setting = {
    store: function (key, data) {
        var fileName = 'setting.txt';
        var file = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, fileName);
        var contents = file.read();
        if (contents == '') {
            contents = '{}';
        }
        var settings = JSON.parse(contents);
        settings[key] = data;
        file.write(JSON.stringify(settings));
        return data;
    },
    load: function (key) {
        var fileName = 'setting.txt';
        var file = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, fileName);
        var contents = file.read();
        if (contents == '') {
            contents = '{}';
        }
        var settings = JSON.parse(contents);
        return settings[key];
    }
};

function settingWindow() {
    var setting_win = Ti.UI.createWindow({
        title:'Librize',
        backgroundColor:'#fff'
    });
    
    var broadcast_tf = Ti.UI.createTextField({
        top: 10,
        left: 10,
        hintText: 'broadcast address',
        value: Setting.load('broadcast_ip')
    });
    setting_win.add(broadcast_tf);
    
    var port_tf = Ti.UI.createTextField({
        top: 100,
        left: 10,
        hintText: 'port',
        value: Setting.load('port')
    });
    setting_win.add(port_tf);
    
    var save_button = Ti.UI.createButton({
        top: 200,
        left: 10,
        width: 200,
        title: 'save'
    });
    
    save_button.addEventListener('click', function (e) {
        if (!broadcast_tf.value || !port_tf.value) {
            alert('please input broad cast ip address and port number.');
            return;
        }
        Setting.store('broadcast_ip', broadcast_tf.value);
        Setting.store('port', port_tf.value);
        setting_win.close();
    });
    
    setting_win.add(save_button);
    
    setting_win.open();
}

function scan(continues) {
    titaniumBarcode.scan({
        success: function (data) {
          if(data && data.barcode) {
            barcodeLabel.text = data.barcode;
            
            var socket = UDP.createSocket();
            socket.start({ port: parseInt(Setting.load('port')) });
            socket.sendString({ host: Setting.load('broadcast_ip'), data: data.barcode });
            socket.stop();
            
            // http://www.brainstorm-inc.jp/faq.html
            var sound = Ti.Media.createSound({
                url:'Alarm0070.mp3'
            });
            sound.addEventListener('complete', function () {
                if (continues) {
                    scan(true);
                }
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

var win = Titanium.UI.createWindow({  
    title:'Librize',
    backgroundColor:'#fff'
});

var barcodeLabel = Titanium.UI.createLabel({
    color: '#000',
    top: 60,
    text: 'N/A',
    textAlign: 'center',
    font: { fontSize:48 },
    width: 'auto'
});
  
win.add(barcodeLabel);

var scanOnceButton = Titanium.UI.createButton({
    title: 'Scan barcode once',
    top: 200
});

scanOnceButton.addEventListener('click', function (e) {
    scan(false);
});

win.add(scanOnceButton);

var scanContinuesButton = Titanium.UI.createButton({
    title: 'Scan barcode continues',
    top: 300
});

scanContinuesButton.addEventListener('click', function (e) {
    scan(true);
});

win.add(scanContinuesButton);

var settingButton = Titanium.UI.createButton({
    title: 'Setting',
    top: 400
});

settingButton.addEventListener('click', function (e) {
    settingWindow();
});

win.add(settingButton);

win.open();

if (!Setting.load('broadcast_ip') || !Setting.load('port')) {
    settingWindow();
}
