import Immutable from 'immutable';
import { makeStdout, makeStderr, makeStdin } from './sys';
import maps from 'map-stream';

const programs = {
  'sh': sh,
  'cat': cat,
  'ls': ls,
  'clear': clear,
  'pwd': pwd,
  'echo': echo,
  'cd': cd,
  'mkdir': mkdir,
  'rm': rm,
  'rmdir': rmdir
};

function _safeArgSplit(str) {
  let inDQuote = false;
  let inSQuote = false;
  return str.split('').reduce((b, e) => {
    if (e == '"') {
      inDQuote = !inDQuote;
    } else if (e == "'") {
      inSQuote = !inSQuote;
    }

    if (e == ' ' && !inDQuote && !inSQuote) {
      return b.concat([""]);
    } else if ((e == '"' && !inSQuote) || (e == "'" && !inDQuote)) {
      return b;
    } else {
      b[b.length-1] = b[b.length-1] + e;
      return b;
    }
  }, [""]);
}

function _shAdjust(innerSys, args) {
  if (args.length >= 3) {
    const readFilestream =
      innerSys.fs.writeFileStream(innerSys.fs.pathFromString(innerSys.env.getEnv("PWD"), args[args.length-1]));
    if (args[args.length-2] == ">") {
      innerSys.stdout = readFilestream;
      return [innerSys, args.slice(0, -2)];
    } else if (args[args.length-2] == "2>") {
      innerSys.stderr = readFilestream;
      return [innerSys, args.slice(0, -2)];
    } else {
      return [innerSys, args];
    }
  } else {
    return [innerSys, args];
  }
}

function sh(argv, sys) {
  var newSys = () => { return {
      flux: sys.flux, /* you need flux to fork */
      stdout: makeStdout(sys.flux),
      stderr: makeStderr(sys.flux),
      stdin: makeStdin(sys.flux),
      env: sys.env,
      fs: sys.fs,
      term: sys.term
  } };

  const handleFail = (code) => sys.stdout.write(`Exited with code ${code}`);
  const exec = (prog, args) => {
    const innerSys = newSys();
    const [modSys, modArgs] = _shAdjust(innerSys, args)
    prog(modArgs, modSys)
      .then(handleFail)
      .then(() => modSys.stdin.emit('close'))
      .then(() => modSys.stdout.end())
      .then(() => console.log("PROG ENDED"));
  };

  return new Promise((r) => {
    console.log("Initing shell");
    sys.stdin.pipe(maps((data, cb) => cb(null, "$ " + data))).pipe(sys.stdout);
    sys.stdin.on("data", (buf) => {
      const asStr = buf.toString();
      const args = _safeArgSplit(asStr);
      console.log("sh is shelling ", args);
      if (args[0] in programs) {
        exec(programs[args[0]], args);
      } else {
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
    try {
      sys.fs.readFileStream(sys.fs.pathFromString(sys.env.getEnv("PWD"), argv[1]))
        .pipe(sys.stdout)
        .on('error', (e) => { console.log(e); return r(2) })
        .on('end', () => r(0))
        .on('close', () => r(0));
    } catch (e) {
      sys.stderr.write(e.message);
      r(2);
    }
  });
}

function ls(argv, sys) {
    try {
      const dirs = sys.fs.lsdir(sys.fs.pathFromString(sys.env.getEnv("PWD"), argv[1] || ""))
        console.log("Got dirs", dirs);
      dirs.forEach(l => sys.stdout.write(l));
      return Promise.resolve(0);
    } catch (e) {
      sys.stderr.write(e.message);
      return Promise.resolve(2);
    }
}

function clear(argv, sys) {
  return new Promise((r) => {
    setTimeout(() => {
      sys.term.clear();
      r(0);
    }, 0);
  });
}

function pwd(argv, sys) {
  sys.stdout.write(sys.env.getEnv("PWD"))
  return Promise.resolve(0);
}

function echo(argv, sys) {
  if (argv.length < 2) {
    sys.stderr.write(`Usage: ${argv[0]} string-to-echo`);
    return Promise.resolve(1);
  }
  sys.stdout.write(argv[1]);
  return Promise.resolve(0);
}

function cd(argv, sys) {
  if (argv.length < 2) {
    sys.stderr.write(`Usage: ${argv[0]} /path/to/cd/to`);
    return Promise.resolve(1);
  }
  try {
    sys.fs.lsdir(sys.fs.pathFromString(sys.env.getEnv("PWD"), argv[1] || ""))
    sys.env.setEnv("PWD", sys.env.getEnv("PWD") + "/" + argv[1])
    return Promise.resolve(0);
  } catch (e) {
    sys.stderr.write("Path does not exist")
    return Promise.resolve(2);
  }
}

function mkdir(argv, sys) {
  if (argv.length < 2) {
    sys.stderr.write(`Usage: ${argv[0]} /path/to/dir/to/create`);
    return Promise.resolve(1);
  }
  const path = sys.fs.pathFromString(sys.env.getEnv("PWD"), argv[1])
  try {
    sys.fs.lsdir(path)
    sys.stderr.write("Path already exists, rmdir/rm first");
    return Promise.resolve(2);
  } catch (e) {
    sys.fs.mkdir(path)
    return Promise.resolve(0);
  }
}

function rm(argv, sys) {
  if (argv.length < 2) {
    sys.stderr.write(`Usage: ${argv[0]} /path/to/dir/to/remove`);
    return Promise.resolve(1);
  }
  const path = sys.fs.pathFromString(sys.env.getEnv("PWD"), argv[1])
  try {
    sys.fs.lsdir(path)
    if (sys.fs.isDir(path)) {
      sys.stderr.write("Use rmdir to remove directories");
      return Promise.resolve(2);
    } else {
      sys.fs.rmdir(path)
      return Promise.resolve(0);
    }
  } catch (e) {
    sys.stderr.write("Cannot find file to delete");
    return Promise.resolve(2);
  }
}

function rmdir(argv, sys) {
  if (argv.length < 2) {
    sys.stderr.write(`Usage: ${argv[0]} /path/to/dir/to/remove`);
    return Promise.resolve(1);
  }
  const path = sys.fs.pathFromString(sys.env.getEnv("PWD"), argv[1])
  try {
    sys.fs.lsdir(path)
    if (sys.fs.isDir(path)) {
      sys.fs.rmdir(path)
      return Promise.resolve(2);
    } else {
      sys.stderr.write("Use rm to remove files");
      return Promise.resolve(0);
    }
  } catch (e) {
    sys.stderr.write("Cannot find dir to delete");
    return Promise.resolve(2);
  }
}

export { sh }

