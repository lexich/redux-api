import React from "react";

export default class Application extends React.Component {
  render() {
    return (
      <div key="ta-app" className="Application">
        { this.props.children }
      </div>
    );
  }
}
