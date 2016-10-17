import nock from 'nock'
import * as github from '.'

it('parses github user', async () => {
  const ghUser = {
    login: 'Test Name',
    id: 123,
    avatar_url: 'avatar_url.jpg',
    gravatar_id: '',
    url: 'https://api.github.com/users/Test',
    html_url: 'https://github.com/Test',
    followers_url: 'https://api.github.com/users/Test/followers',
    following_url: 'https://api.github.com/users/Test/following{/other_user}',
    gists_url: 'https://api.github.com/users/Test/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/Test/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/Test/subscriptions',
    organizations_url: 'https://api.github.com/users/Test/orgs',
    repos_url: 'https://api.github.com/users/Test/repos',
    events_url: 'https://api.github.com/users/Test/events{/privacy}',
    received_events_url: 'https://api.github.com/users/Test/received_events',
    type: 'User',
    site_admin: false,
    name: null,
    company: null,
    blog: null,
    location: '0',
    email: null,
    hireable: null,
    bio: '0',
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0,
    created_at: '2013-01-01T11:11:11Z',
    updated_at: '2013-02-01T11:11:11Z',
    private_gists: 2,
    total_private_repos: 0,
    owned_private_repos: 0,
    disk_usage: 3333,
    collaborators: 0,
    plan: {
      name: 'personal',
      space: 9999999,
      collaborators: 0,
      private_repos: 9999
    }
  }
  const ghUserEmails = [{
    email: 'email@example.com',
    primary: true,
    verified: true
  }, {
    email: 'email2@example.com',
    primary: false,
    verified: true
  }, {
    email: 'email3@example.com',
    primary: false,
    verified: true
  }]

  nock('https://api.github.com').get('/user').query(true).reply(200, ghUser)
  nock('https://api.github.com').get('/user/emails').query(true).reply(200, ghUserEmails)

  const data = await github.getUser('123')
  expect(data.service).toBe('github')
  expect(data.id).toBe(ghUser.id)
  expect(data.name).toBe(ghUser.login)
  expect(data.email).toBe(ghUserEmails[0].email)
  expect(data.picture).toBe(ghUser.avatar_url)
})
