p5.prototype.registerPreloadMethod('loadBytes');

p5.prototype.loadBytes = function(file, callback) {
  var data = {};
  var oReq = new XMLHttpRequest();
  oReq.open("GET", file, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = (oEvent) => {
    var arrayBuffer = oReq.response;
    if (arrayBuffer) {
      data.bytes = new Uint8Array(arrayBuffer);
      if (callback) {
        callback(data);
      }
      this._decrementPreload();
    }
  }
  oReq.send(null);
  return data;
}