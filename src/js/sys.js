import { Writable, Readable } from "stream";

function makeStderr(flux) {
  var ws = Writable();
  ws._write = (chunk, enc, next) => {
    // not using actions because we want can't wait an event tick
    flux.getStore("lines").handleNewStderrLines([chunk]);
    next();
  };
  return ws;
}

function makeStdout(flux) {
  var ws = Writable();
  ws._write = (chunk, enc, next) => {
    // not using actions because we want can't wait an event tick
    flux.getStore("lines").handleNewStdoutLines([chunk]);
    next();
  };
  return ws;
}

function makeStdin(flux) {
  var inputStore = flux.getStore("input");
  var rs = Readable();
  var onLine = (line) => { rs.push(line); };

  rs._read = () => {
    //console.log("Attempted to read");
    inputStore.attatchStdin(onLine);
  }
  rs.on('close', () => {
    //console.log("Read closed");
    inputStore.detatchStdin(onLine);
  });
  return rs;
}

export { makeStdout, makeStderr, makeStdin }

