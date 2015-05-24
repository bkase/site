import Immutable from 'immutable';
import { Actions, Store, Flummox } from 'flummox';

class TerminalActions extends Actions {
  newStdoutLines(strs) {
    return strs
  }
}

class LineStore extends Store {
  constructor(flux) {
    super();

    const terminalActions = flux.getActions('terminal');
    this.register(terminalActions.newStdoutLines, this.handleNewStdoutLines);

    this.state = { lines: Immutable.List.of() };
  }

  handleNewStdoutLines(lines) {
    const newState = { lines: this.state.lines.concat(lines) }
    this.setState(newState);
  }

  // returns List<String> (line text)
  getLines() {
    return this.state.lines;
  }
}

export class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('terminal', TerminalActions);
    this.createStore('lines', LineStore, this);
  }
}

