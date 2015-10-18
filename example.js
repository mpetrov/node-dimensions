var dimensions = require('./dimensions');

var panels = {};
panels[dimensions.Panel.LEFT] = {};
panels[dimensions.Panel.RIGHT] = {};
panels[dimensions.Panel.CENTER] = {};

var minifigColors = {};
minifigColors[dimensions.Minifig.BATMAN] = 0xCC00CC;
minifigColors[dimensions.Minifig.WILDSTYLE] = 0x10109E;
minifigColors[dimensions.Minifig.GANDALF] = 0x996644;

var device = new dimensions.Device();
device.connect();
device.on('connected', function() {
  console.log('connected');
});
device.on('minifig-scan', function(e) {
  if (e.action == dimensions.Action.ADD) {
    panels[e.panel][e.minifig] = true;
    device.updatePanel(
        e.panel,
        minifigColors[e.minifig],
        0.9);
  } else if (e.action == dimensions.Action.REMOVE) {
    delete panels[e.panel][e.minifig];
    var minifigs = Object.keys(panels[e.panel]);
    if (minifigs.length) {
      device.updatePanel(e.panel, minifigColors[minifigs[0]], 0.9);
    } else {
      device.updatePanel(e.panel, 0, 0.9);
    }
  }
});
