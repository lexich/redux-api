import React, { PropTypes } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";

class User extends React.Component {
  render() {
    const { userRepos } = this.props;
    const Repos = userRepos.data.map(
      (item)=> (<Link className="list-group-item"
        key={item.name} to={`/${item.user}/${item.name}`}>
          { item.name }
      </Link>));
    return (
      <div className="User list-group">
        { Repos }
      </div>
    );
  }
}

User.propTypes = {
  userRepos: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function select(state) {
  return {userRepos: state.userRepos };
}

export default connect(select)(User);
