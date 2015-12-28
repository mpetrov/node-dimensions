var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    HID = require('node-hid');

var dimensions = {};

dimensions.Minifig = {
   'WILDSTYLE': 'WILDSTYLE',
   'BATMAN': 'BATMAN',
   'GANDALF': 'GANDALF',
   'BATMOBILE': 'BATMOBILE'
};

dimensions.Panel = {
   'ALL': 'ALL',
   'CENTER': 'CENTER',
   'LEFT': 'LEFT',
   'RIGHT': 'RIGHT'
};

dimensions.Action = {
   'ADD': 'ADD',
   'REMOVE': 'REMOVE',
};

var PRODUCT_ID_ = 0x0241;
var VENDOR_ID_ = 0x0e6f;

var PANEL_TO_CODE_ = {
    'ALL': 0,
    'CENTER': 1,
    'LEFT': 2,
    'RIGHT': 3,
};

var CODE_TO_ACTION_ = {
    0: dimensions.Action.ADD,
    1: dimensions.Action.REMOVE,
};

var CODE_TO_PANEL_ = {
    0: dimensions.Panel.ALL,
    1: dimensions.Panel.CENTER,
    2: dimensions.Panel.LEFT,
    3: dimensions.Panel.RIGHT,
};

var ID_TO_MINIFIG_ = {
   '4b 2b ea 0b 40 81': dimensions.Minifig.WILDSTYLE,
   '24 51 ba 0d 40 81': dimensions.Minifig.BATMAN,
   '60 62 6a 08 40 80': dimensions.Minifig.GANDALF,
   '66 d2 9a 70 40 80': dimensions.Minifig.BATMOBIL
};

function getHexSignature_(buffer) {
  var signature = '';
  for (var i = 0; i < buffer.length; i++) {
    signature +=
        ((buffer[i] >> 4) & 0xF).toString(16) +
        (buffer[i] & 0xF).toString(16) +
        ' ';
  }
  return signature.trim();
}

dimensions.Device = function() {
  EventEmitter.call(this);
  this.hidDevice_ = null;
  this.colourUpdateNumber_ = 0;
};
util.inherits(dimensions.Device, EventEmitter);

dimensions.Device.prototype.connect = function() {
  this.hidDevice_ = new HID.HID(VENDOR_ID_, PRODUCT_ID_);

  this.hidDevice_.on('data', function(data) {
      var cmd = data[1];
      if (cmd == 0x0b) { // minifg scanned
        var panel = CODE_TO_PANEL_[data[2]];
        var action = CODE_TO_ACTION_[data[5]];
        var signature = getHexSignature_(data.slice(7, 13));
        this.emit('minifig-scan', {
            'panel': panel,
            'action': action,
            'minifig': ID_TO_MINIFIG_[signature] || null,
            'id': signature
        });
      } else if (cmd == 0x01) { // LED change
      } else if (cmd == 0x19) { // connected
        this.emit('connected');
      } else {
        console.log('unknown dimensions command', data);
      }
  }.bind(this));

  this.hidDevice_.on('error', function(error) {
    this.emit('error', error);
  }.bind(this));

  this.hidDevice_.write([0x00,
      0x55, 0x0f, 0xb0, 0x01,
      0x28, 0x63, 0x29, 0x20,
      0x4c, 0x45, 0x47, 0x4f,
      0x20, 0x32, 0x30, 0x31,
      0x34, 0xf7, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00]);
};

dimensions.Device.prototype.checksum = function(data) {
  var checksum = 0;
  for (var i = 0; i < data.length; i++) {
    checksum += data[i];
  }
  data.push(checksum & 0xFF);
  return data;
}

dimensions.Device.prototype.pad = function(data) {
  while(data.length < 32) {
    data.push(0x00);
  }
  return data;
}

dimensions.Device.prototype.write = function(data) {
  this.hidDevice_.write([0x00].concat(this.pad(this.checksum(data))));
}

dimensions.Device.prototype.updatePanel = function(panel, color, opt_speed) {
  if (typeof opt_speed !== 'number') {
    opt_speed = 0.7;
  }
  var data = [
    this.colourUpdateNumber_ & 0xFF,
    PANEL_TO_CODE_[panel],
    ((1 - opt_speed) * 0xFF) & 0xFF,
    0x01, (color >> 16) & 0xFF,
    (color >> 8) & 0xFF,
    color & 0xFF
  ];

  this.colourUpdateNumber_++;
  this.write([0x55, 0x08, 0xc2].concat(data));
};

module.exports = dimensions;
