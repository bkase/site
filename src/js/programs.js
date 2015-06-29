import Immutable from 'immutable';
import { makeStdout, makeStderr, makeStdin } from './sys';
import maps from 'map-stream';

function sh(argv, sys) {
  var newSys = () => { return {
      flux: sys.flux, /* you need flux to fork */
      stdout: makeStdout(sys.flux),
      stderr: makeStderr(sys.flux),
      stdin: makeStdin(sys.flux),
      env: sys.env,
      fs: sys.fs
  } };

  const handleFail = (code) => sys.stdout.write(`Exited with code ${code}`);

  return new Promise((r) => {
    console.log("Initing shell");
    sys.stdin.pipe(maps((data, cb) => cb(null, "$ " + data))).pipe(sys.stdout);
    sys.stdin.on("data", (buf) => {
      const asStr = buf.toString();
      const args = asStr.split(' ');
      console.log("sh is shelling ", args);
      switch (args[0]) {
        case "cat":
          cat(args, newSys()).then(handleFail);
          break;
        case "ls":
          ls(args, newSys()).then(handleFail);
          break;
        default:
          sys.stderr.write(`Cannot find program ${args[0]}`);
      }
    })
      .on('error', () => r(2))
      .on('end', () => r(0));
  });
}

// argv = [String]
// env = [String: String]
//
// programs
// (argv, sys) -> exitCodePromise
// type: ([String], Sys) -> Promise<Int>
function cat(argv, sys) {
  if (argv.length < 2) {
    sys.stderr.write(`Usage: ${argv[0]} file`);
    return Promise.resolve(1);
  }
  return new Promise((r) => {
    console.log("observe ", sys.stdin);
    sys.fs.readFileStream(sys.fs.pathFromString(argv[1]))
      .pipe(sys.stdout)
      .on('error', () => r(2))
      .on('end', () => r(0));
  });
}

function ls(argv, sys) {
  return new Promise((r) => {
    sys.fs.lsdir(sys.fs.pathFromString(argv[1] || ""))
      .forEach(l => sys.stdout.write(l))
    r(0);
  });
}

export { sh, cat }

