import React, { PropTypes } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";

class Repo extends React.Component {
  render() {
    const { repo } = this.props;
    const data = repo.data || {};
    const owner = data.owner || {};
    return !repo.loading ? (
      <div className="Repo media">
        <div className="media-left">
          <Link to={`/${owner.login}`}>
            <img className="Repo__media media-object" src={owner.avatar_url } />
          </Link>
        </div>
        <div className="media-body">
          <h4>{ data.name }</h4>
          <Link to={`/${owner.login}`}>@{ owner.login }</Link>&nbsp;
          Stars { data.stargazers_count } Forks {data.forks }
        </div>
      </div>) : ( <div className="Repo">Loading</div> );
  }
}

Repo.propTypes = {
  repo: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function select(state) {
  return {repo: state.repo };
}

export default connect(select)(Repo);
