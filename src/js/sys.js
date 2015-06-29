import { Writable, Readable } from "stream";

function makeStderr(flux) {
  var ws = Writable();
  ws._write = (chunk, enc, next) => {
    setTimeout(() => {
      flux.getActions("terminal").newStderrLines([chunk]);
      next();
    });
  };
  return ws;
}

function makeStdout(flux) {
  var ws = Writable();
  ws._write = (chunk, enc, next) => {
    setTimeout(() => {
      flux.getActions("terminal").newStdoutLines([chunk]);
      next();
    });
  };
  return ws;
}

function makeStdin(flux) {
  var inputStore = flux.getStore("input");
  var onLine = (line) => { rs.push(line); };

  var rs = Readable();
  rs._read = () => {
    console.log("Attempted to read");
    inputStore.attatchStdin(onLine);
  }
  rs.on('close', () => {
    console.log("Read closed");
    inputStore.detatchStdin(onLine);
  });
  return rs;
}

export { makeStdout, makeStderr, makeStdin }

