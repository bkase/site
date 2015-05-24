
class Cursor extends React.Component {
  render() {
    return (
      <span className="cursor">█</span>
    );
  }
}

class PromptPrefix extends React.Component {
  render() {
    return (
      <span className="dollar">$</span>
    );
  }
}

class Prompt extends React.Component {
  render() {
    return (
      <div className="prompt">
        <PromptPrefix /> <Cursor />
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
      <span className={["wiper", renderClass, isWipedClass].join(" ")}>█</span> 
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
    console.log("animation done: " + idx + ", " + this.props.lineData.length);
    if (idx < this.props.lineData.length) {
      this.setState({ animateIdx: idx+1 });
    }
  }

  render() {
    var lines = this.props.lineData.map((datum, idx) => {
      var speed = (idx == 0) ? 1 : (idx == 1) ? 2 : 3;
      return (
        <Line idx={idx}
              speed={speed} 
              runWipe={this.state.animateIdx == idx}
              isWiped={this.state.animateIdx > idx}
              onWipeDone={this.handleAnimationDone.bind(this)} >
          {datum.text}
        </Line>
      );
    });

    return (
      <div className="lineList">
        {lines}
      </div>
    );
  }
}

class Terminal extends React.Component {
  render() {
    return (
      <div className="terminal">
        $ cat test.txt
        <LineList lineData={this.props.lineData} />
        <Prompt />
      </div>
    );
  }
}

var lineData = [
  { text: "......Hello there" },
  { text: ".....................Brandon played with react today" },
  { text: ".....................React is cool" },
  { text: "Look at it animate..................This is all CSS" },
  { text: "Isn't that cool" },
  { text: "..................................................." },
  { text: "..................................................." },
  { text: "Yes" }
];

React.render(
  <Terminal lineData={lineData} />,
  document.getElementById('page')
);

