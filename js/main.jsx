
var Cursor = React.createClass({
  render: function() {
    return (
      <span className="cursor">█</span>
    );
  }
});

var PromptPrefix = React.createClass({
  render: function() {
    return (
      <span className="dollar">$</span>
    );
  }
});

var Prompt = React.createClass({
  render: function() {
    return (
      <div className="prompt">
        <PromptPrefix /> <Cursor />
      </div>
    );
  }
});

var Wiper = React.createClass({
  attachAnimationListener: function(component) {
// TODO: Do we have to clean up leaked events?
    var callback = function(){ this.props.onWipeDone(this.props.idx); }.bind(this);
    ["animationend", "webkitAnimationEnd", "oanimationend", "MSAnimationEnd"].forEach(function(n) {
      React.findDOMNode(component).addEventListener(n, callback);
    });
  },
  
  render: function() {
    var animateClass = "ghost-type-" + this.props.speed + "-" + this.props.count;
    var renderClass = (this.props.runWipe) ? animateClass : "";
    var isWipedClass = (this.props.isWiped) ? "ghost-type-done" : "";
    return (
      <span className={["wiper", renderClass, isWipedClass].join(" ")}
            ref={ this.attachAnimationListener }>█</span> 
    );
  }
});

var Line = React.createClass({
  render: function() {
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
});

// props: text
var LineList = React.createClass({
  getInitialState: function() {
    setTimeout(function() { this.setState({ animateIdx: 0 }); }.bind(this), 500);
    return { animateIdx: -1 };
  },

  handleAnimationDone: function(idx) {
    console.log("animation done: " + idx + ", " + this.props.lineData.length);
    if (idx < this.props.lineData.length) {
      this.setState({ animateIdx: idx+1 });
    }
  },

  render: function() {
    var lines = this.props.lineData.map(function(datum, idx) {
      var speed = (idx == 0) ? 1 : (idx == 1) ? 2 : 3;
      return (
        <Line idx={idx}
              speed={speed} 
              runWipe={this.state.animateIdx == idx}
              isWiped={this.state.animateIdx > idx}
              onWipeDone={this.handleAnimationDone} >
          {datum.text}
        </Line>
      );
    }.bind(this));

    return (
      <div className="lineList">
        {lines}
      </div>
    );
  }
});

var Terminal = React.createClass({
  render: function() {
    return (
      <div className="terminal">
        $ cat test.txt
        <LineList lineData={this.props.lineData} />
        <Prompt />
      </div>
    );
  }
});

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

