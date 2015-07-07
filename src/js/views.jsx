import React from 'react';
import Immutable from 'immutable';
import FluxComponent from 'flummox/component';

class Cursor extends React.Component {
  render() {
    return (
      <span className="cursor"></span>
    );
  }
}

class PromptPrefix extends React.Component {
  render() {
    return (
      <span className="dollar">$ </span>
    );
  }
}

class EditablePrompt extends React.Component {
  render() {
    return (
      <span className="type">{this.props.buffer}</span>
    );
  }
}

class Prompt extends React.Component {
  render() {
    return (
      <div className="prompt">
        <PromptPrefix /><FluxComponent connectToStores={{
          termbuffer: store => ({ buffer: store.getBuffer() })
        }}><EditablePrompt /></FluxComponent><Cursor />
      </div>
    );
  }
}

class Wiper extends React.Component {
  constructor(props) {
    super(props);
    this.callback = () => this.props.onWipeDone(this.props.idx);
  }

  componentDidMount() {
    var node = React.findDOMNode(this);
    if (!node) {
      return;
    }

    ["animationend", "webkitAnimationEnd", "oanimationend", "MSAnimationEnd"].forEach((n) =>
      node.addEventListener(n, this.callback)
    );

    var page = document.getElementById('page');
    page.scrollTop = page.scrollHeight;
  }

  componentWillUnmount() {
    var node = React.findDOMNode(this);
    if (!node) {
      return;
    }

    ["animationend", "webkitAnimationEnd", "oanimationend", "MSAnimationEnd"].forEach((n) =>
      node.removeEventListener(n, this.callback)
    );
  }

  render() {
    var animateClass = "ghost-type-" + this.props.speed + "-" + this.props.count;
    var renderClass = (this.props.runWipe) ? animateClass : "";
    var isWipedClass = (this.props.isWiped) ? "ghost-type-done" : "";
    return (
      <span className={["wiper", renderClass, isWipedClass].join(" ")}><Cursor/></span> 
    );
  }
}

class Line extends React.Component {
  render() {
    var str = this.props.children.toString();
    return (
      <div className="line">
        <span className="childWidth">{str}<Wiper speed={this.props.speed}
                                                  count={str.length}
                                                  idx={this.props.idx}
                                                  runWipe={this.props.runWipe}
                                                  isWiped={this.props.isWiped}
                                                  onWipeDone={this.props.onWipeDone} /></span>
      </div>
    );
  }
}

// props: text
class LineList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { animateIdx: -1 };
    setTimeout(() => this.setState({ animateIdx: 0 }), 500);
  }

  handleAnimationDone(idx) {
    if (idx < this.props.lineData.size) {
      this.setState({ animateIdx: idx+1 });
    }
  }

  render() {
    var lines = this.props.lineData.map((line, idx) => {
      var speed = (idx == 0) ? 1 : (idx == 1) ? 2 : 3;
      return (
        <Line idx={idx}
              key={idx}
              speed={speed} 
              runWipe={this.state.animateIdx == idx}
              isWiped={this.state.animateIdx > idx}
              onWipeDone={this.handleAnimationDone.bind(this)} >
          {line}
        </Line>
      );
    }).filter((l) => l.props.isWiped || l.props.runWipe);

    return (
      <div className="lineList">
        {lines}
      </div>
    );
  }
}

export class Terminal extends React.Component {
  constructor(props, context) {
    super(props);
    this.lineStore = context.flux.getStore('lines');
    this.onListStoreChange = () => this.setState({ lines: this.lineStore.getLines() });
    this.state = {
      lines: this.lineStore.getLines()
    };
  }

  componentDidMount() {
    this.lineStore.addListener('change', this.onListStoreChange);
  }

  componentWillUnmount() {
    this.lineStore.removeListener('change', this.onListStoreChange);
  }

  render() {
    return (
      <div className="terminal">
        <LineList lineData={this.state.lines} />
        <Prompt />
      </div>
    );
  }
}
Terminal.contextTypes = {
  flux: React.PropTypes.object.isRequired
}

