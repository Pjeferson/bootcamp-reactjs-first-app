import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import { Loading, Owner, IssueList, FilterList } from './styles';

import Container from '../../components/Container';

export default class Repository extends Component {
  constructor() {
    super();
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      filters: [{ state: 'all' }, { state: 'open' }, { state: 'closed' }],
      filterIndex: 0,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const { filters, filterIndex } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters[filterIndex].state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { filters, filterIndex, repository } = this.state;

    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
      },
    });

    this.setState({ issues: issues.data });
  };

  handleFilterClick = index => {
    this.setState({ filterIndex: index });

    this.loadIssues();
  };

  render() {
    const { repository, issues, loading, filters, filterIndex } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar ao repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <FilterList active={filterIndex}>
          {filters.map((filter, index) => (
            <button
              type="button"
              key={filter.state}
              onClick={() => this.handleFilterClick(index)}
            >
              {filter.state}
            </button>
          ))}
        </FilterList>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
