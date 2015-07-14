import { sh } from './programs.js'
import { makeStdout, makeStderr, makeStdin } from './sys';

function _stdinAnd(flux, cmds) {
  const stdin = makeStdin(flux);
  const oldRead = stdin._read;
  let once = false;
  stdin._read = () => {
    if (!once) {
      cmds.forEach(cmd => stdin.push(cmd));
      once = true;
    }
    oldRead()
  }
  return stdin;
}

function connectTermToDOM(flux) {
  const keyActions = flux.getActions('keys')
  document.addEventListener("keydown", e => {
    switch (e.keyCode) {
      case 8:
        e.preventDefault();
        keyActions.newBackspaceAction();
        break;
      case 13:
        e.preventDefault();
        keyActions.newReturnAction();
        break;
    }
  });
  document.addEventListener("keypress", e => {
    e.preventDefault();
    keyActions.newAppendCharAction(String.fromCharCode(e.keyCode));
  });
  document.addEventListener("keyup", e => {
    e.preventDefault();
  });

  let currIndex = -1;
  const cycleTapCmds = () => {
    const tapCommands = [
      "sh < /bin/contactme.sh",
      "mkdir newdir",
      "ls",
      "cd newdir",
      "echo 'I can make a file' > afile.txt",
      "cat afile.txt",
      "cp afile.txt bfile.txt",
      "ls",
      "cat bfile.txt",
      "echo 'echo \"look, a shell script\"' > test.sh",
      "ls",
      "sh < test.sh",
      "rm afile.txt",
      "rm bfile.txt",
      "rm test.sh",
      "ls",
      "cd ..",
      "rmdir newdir",
      "echo 'and now we are back where we started'",
      "clear",
      "ls",
      "cat about.txt",
    ];
    currIndex = (currIndex+1) % tapCommands.length;
    return tapCommands[currIndex];
  };

  // hack
  const stdin = makeStdin(flux);

  const mql = window.matchMedia("screen and (max-width: 1200px)")
  if (mql.matches) { // if media query matches
    document.addEventListener('click', () => {
      const cmd = cycleTapCmds();
      stdin.push(cmd);
    });
  }

  const _stdinAnd = (flux, cmds) => {
    const oldRead = stdin._read;
    let once = false;
    stdin._read = () => {
      if (!once) {
        cmds.forEach(cmd => stdin.push(cmd));
        once = true;
      }
      oldRead();
    }
    return stdin;
  };

  sh(["sh"], {
    flux: flux,
    stdin: _stdinAnd(flux, ["ls", "cat about.txt"]),
    stdout: makeStdout(flux),
    stderr: makeStderr(flux),
    env: flux.getStore('env'),
    fs: flux.getStore('fs'),
    term: flux.getActions('terminal')
  })
}

export { connectTermToDOM }
