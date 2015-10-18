# node-dimensions
Lego Dimensions Toy Pad library for NodeJS.


## Installation

```
  npm install node-dimensions --save
```

## Usage

### Load the module

```
  var dimensions = require('node-dimensions');
```

### Connect to a device

Construct a new device and connect to it:

```
  device = new dimensions.Device();
  device.connect();
```

Optionally, listen for the device to connect:

```
  device.on('connected', function() {
  });
```

### Listen for minifig scans

Listening for minifigs scans can be done by registering an handler:
```
  device.on('minifig-scan', function(event) {
  });
```

Notes:

- The identity of a minifig can be checked via the `minifig` property. For
  example: `event.minifig == dimensions.Minifig.BATMAN`.
- Events are received when a minifig is added or removed from a panel. The
  `action` event property specifies either `dimensions.Minifig.ADD` or
  `dimensions.Minifig.REMOVE`
- The `panel` property specifies on which panel the scan occurred. This can be
  one of `dimensions.Panel.LEFT`, `dimensions.Panel.RIGHT`, or
  `dimensions.Panel.CENTER`.


### Update panel LEDs

Panel LEDs can be updated using the following:

```
  device.updatePanel(panel, color, speed);
```

Arguments:

- `panel` - The panel to be updated, can be one of `dimensions.Panel.LEFT`,
  `dimensions.Panel.RIGHT`, `dimensions.Panel.CENTER`, `dimensions.Panel.ALL`.
- `color` - The RGB color of the panel. For example: red would be `0xFF0000`
   while `0x000000` would turn off the LEDs.
- `speed` - An optional parameter specifying the speed with which to update the
   panel LEDs. `0.0` is the slowest update speed available, while `1.0` is the
   fastest.
