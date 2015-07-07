import { sh } from './programs.js'
import { makeStdout, makeStderr, makeStdin } from './sys';

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

  sh("", {
    flux: flux,
    stdin: makeStdin(flux),
    stdout: makeStdout(flux),
    stderr: makeStderr(flux),
    env: flux.getStore('env'),
    fs: flux.getStore('fs'),
    term: flux.getActions('terminal')
  })
}

export { connectTermToDOM }
