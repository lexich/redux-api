import React from "react";

export default class Application extends React.Component {
  render() {
    return (
      <div key="ta-app" className="Application">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h1 className="panel-title">Isomorphic Redux-api example with react-router</h1>
          </div>
          <div className="panel-body">
            { this.props.children }
          </div>
        </div>
      </div>);
  }
}
