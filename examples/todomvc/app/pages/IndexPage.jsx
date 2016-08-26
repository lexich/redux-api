import React, { PropTypes } from "React";

import { connect } from "react-redux";

class IndexPage extends React.Component {
  render() {
    const { message } = this.props;
    return (
      <div className="IndexPage">
        { message }
      </div>
    );
  }
}

IndexPage.propTypes = {
  message: PropTypes.string.isRequired
};

function select(state) {
  return { message: state.info.data.message };
}

export default connect(select)(IndexPage);
