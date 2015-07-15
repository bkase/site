import Immutable from 'immutable';
import { Actions, Store, Flummox } from 'flummox';
import { Writable, Readable } from 'stream';

class TerminalActions extends Actions {
  newStdoutLines(strs) {
    //console.log(`STDOUT: ${strs}`)
    return strs;
  }

  newStderrLines(strs) {
    //console.log(`STDERR: ${strs}`)
    return strs;
  }

  newStdinLine(line) {
    //console.log(`STDIN: ${line}`)
    return line;
  }

  clear() {
    //console.log(`Clearing terminal`);
    return null;
  }
}

class KeyActions extends Actions {
  newAppendCharAction(c) {
    return c;
  }

  newBackspaceAction() {
    return null;
  }

  newReturnAction() {
    return null;
  }
}

class LineStore extends Store {
  constructor(flux) {
    super();

    const terminalActions = flux.getActions('terminal');
    this.register(terminalActions.newStdoutLines, this.handleNewStdoutLines);
    this.register(terminalActions.newStderrLines, this.handleNewStderrLines);
    this.register(terminalActions.clear, this.handleClear);

    this.state = { lines: Immutable.List.of(), out: Immutable.List.of(), err: Immutable.List.of() };
  }

  handleNewStdoutLines(lines) {
    const newState = { lines: this.state.lines.concat(lines), out: this.state.lines.concat(lines), err: this.state.err };
    this.setState(newState);
  }

  handleNewStderrLines(lines) {
    const newState = { lines: this.state.lines.concat(lines), out: this.state.lines, err: this.state.err.concat(lines) };
    this.setState(newState);
  }

  handleClear() {
    const newState = { lines: Immutable.List.of(), out: Immutable.List.of(), err: Immutable.List.of() };
    this.setState(newState);
  }

  // returns List<String> (line text)
  getLines() {
    return this.state.lines;
  }
}

class TermBufferStore extends Store {
  constructor(flux) {
    super();

    const keyActions = flux.getActions('keys');
    this.terminalActions = flux.getActions('terminal');

    this.state = { b: "" };
    this.register(keyActions.newAppendCharAction, this.handleNewAppendCharAction);
    this.register(keyActions.newBackspaceAction, this.handleNewBackspaceAction);
    this.register(keyActions.newReturnAction, this.handleNewReturnAction);
  }

  handleNewAppendCharAction(c) {
    this.setState({ b: this.state.b + c });
  }

  handleNewBackspaceAction() {
    this.setState({ b: this.state.b.substring(0, this.state.b.length-1) });
  }

  handleNewReturnAction() {
    const b = this.state.b;
    setTimeout(() => this.terminalActions.newStdinLine(b), 0);
    this.setState({ b: "" });
  }

  getBuffer() {
    return this.state.b;
  }
}

class InputStore extends Store {
  constructor(flux) {
    super();

    this.register(flux.getActions('terminal').newStdinLine, this.handleNewStdinLine)
    this.state = { onLineStack: Immutable.Stack.of() };
  }

  handleNewStdinLine(line) {
    //console.log("Attempted to handle new stdin", this.state);
    if (this.state.onLineStack.peek()) {
      this.state.onLineStack.peek()(line)
    }
  }

  attatchStdin(onLine) {
    const newState = { onLineStack: this.state.onLineStack.push(onLine) };
    this.setState(newState);
  }

  detatchStdin(onLine) {
    const newState = { onLineStack: this.state.onLineStack.pop() };
    this.setState(newState);
  }
}

class EnvStore extends Store {
  constructor(flux) {
    super();

    this.state = { m: Immutable.Map() };
  }

  setEnv(key, val) {
    const newState = { m: this.state.m.set(key, val) };
    this.setState(newState);
  }

  getEnv(key) {
    return this.state.m.get(key);
  }

  snapshot() {
    return this.state.m;
  }
}

// TODO: back this by localstorage
// TODO: don't require buffering the whole file
class FsStore extends Store {
  constructor(flux) {
    super();

    this.state = { fs: {} };
  }

  _dedupe(str, chr) {
    let chrs = []
    const orig = str.split('')
    let last = '';
    for (var i = 0; i < orig.length; i++) {
      if (last == chr && last == orig[i]) {
        continue;
      }
      last = orig[i];
      chrs.push(orig[i]);
    }
    return chrs.join('')
  }

  _dotdotify(path) {
    return path.reduce((b, e) => {
      if (e == "..") {
        if (b.length > 0) {
          return b.slice(0, -1);
        } else {
          throw "IO error: path not resolvable";
        }
      } else {
        return b.concat([e]);
      }
    }, []);
  }

  pathFromString(pwd, pathstr) {
    const res = this._dedupe(pwd + "/" + pathstr, "/").split("/").filter(x => x != "." && x != "");
    const res_ = this._dotdotify(res)
    return res_
  }

  _last(path) {
    return path[path.length-1];
  }

// returns dir object
  _snapshotOfDeepest(path) {
    if (path.length == 0) {
      throw "IO error: path empty";
    }
    var deepest = path.slice(0, -1).reduce((build, x) => {
      if (x in build) {
        return build[x];
      } else {
        throw `IO error: path to folder ${path} not found`;
      }
    }, this.state.fs);

    return deepest;
  }

  // path is ["a", "b", "c"]
  mkdir(path) {
    var deepest = this._snapshotOfDeepest(path);
    deepest[this._last(path)] = {};

    this.setState(this.state);
  }

// no check if dir exists, just delete
  rmdir(path) {
    var deepest = this._snapshotOfDeepest(path);
    delete deepest[this._last(path)];
  }

// returns list of file names
  lsdir(path) {
    if (path.length == 0) {
      return Object.keys(this.state.fs);
    } else {
      if (this.isDir(path)) {
        // ends in a dir
        const deepest = this._snapshotOfDeepest(path);
        return Object.keys(deepest[this._last(path)]);
      } else {
        // ends in a file
        const deepest = this._snapshotOfDeepest(path);
        if (this._last(path) in deepest) {
          return [this._last(path)];
        } else {
          throw 'IO error: path does not exist'
        }
      }
    }
  }

  isDir(path) {
    var deepest = this._snapshotOfDeepest(path);
    return !(deepest[this._last(path)] instanceof Array) && this._last(path) in deepest;
  }

  // TODO: The read stream never closes!
  readFileStream(path) {
    var deepest = this._snapshotOfDeepest(path);
    var f = deepest[this._last(path)];
    //console.log(`Attempting to read from ${f}`, typeof f, deepest, this._last(path), path);

    var rs = Readable();

    const max = 5;
    let currIdx = 0;
    rs._read = () => {
      //console.log("Trying to read", currIdx, f.length, max);
      if (currIdx >= f.length) {
        rs.push(null);
        rs.emit('close');
      } else {
        const chunk = f.slice(currIdx, Math.min(max+currIdx, f.length))
        chunk.forEach(l => rs.push(l));
        currIdx += max
        rs.emit('keepgoing');
      }
    }
    return rs;
  }

  appendFileStream(path) {
    var deepest = this._snapshotOfDeepest(path);
    var f = [];
    if (deepest[this._last(path)]) {
      f = deepest[this._last(path)];
    }
    var ws = Writable();
    ws._write = (chunk, enc, next) => {
      f = f.concat(chunk.toString().split('\n'));
      deepest[this._last(path)] = f;
      this.setState(this.state);
      next();
    }
    return ws;
  }

  writeFileStream(path) {
    try {
      this.rmdir(path);
    } catch (e) { }
    this.setState(this.state)
    return this.appendFileStream(path);
  }
}

export class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('terminal', TerminalActions);
    this.createActions('keys', KeyActions);
    this.createStore('lines', LineStore, this);
    this.createStore('input', InputStore, this);
    this.createStore('env', EnvStore, this);
    this.createStore('fs', FsStore, this);
    this.createStore('termbuffer', TermBufferStore, this);
  }
}

