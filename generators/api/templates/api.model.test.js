import { <%= pascal %> } from '.'
<%_ if (storeUser) { _%>
import { User } from '../user'
<%_ } _%>

let <%= storeUser ? 'user, ' : '' %><%= camel %>

beforeEach(async () => {
  <%_ if (storeUser) { _%>
  user = await User.create({ email: 'a@a.com', password: '123456' })
  <%_ } _%>
  <%_ if (modelFields.length) { _%>
  <%= camel %> = await <%= pascal %>.create({ <%-
    storeUser ? userField === 'user' ? 'user, ' : userField + ': user, ' : ''
  %><%- modelFields.map(function (field) {
    return field + ": 'test'";
  }).join(', ') %> })
  <%_ } else { _%>
  <%= camel %> = await <%= pascal %>.create({<%-
    storeUser ? userField === 'user' ? ' user ' : ' ' + userField + ': user ' : ''
  %>})
  <%_ } _%>
})

describe('view', () => {
  it('returns simple view', () => {
    const view = <%= camel %>.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(<%= camel %>.id)
    <%_ if (storeUser) { _%>
    expect(typeof view.<%= userField %>).toBe('object')
    expect(view.<%= userField %>.id).toBe(user.id)
    <%_ } _%>
    <%_ modelFields.forEach(function (field) { _%>
    expect(view.<%= field %>).toBe(<%= camel %>.<%= field %>)
    <%_ }) _%>
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = <%= camel %>.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(<%= camel %>.id)
    <%_ if (storeUser) { _%>
    expect(typeof view.<%= userField %>).toBe('object')
    expect(view.<%= userField %>.id).toBe(user.id)
    <%_ } _%>
    <%_ modelFields.forEach(function (field) { _%>
    expect(view.<%= field %>).toBe(<%= camel %>.<%= field %>)
    <%_ }) _%>
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
