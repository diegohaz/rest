<%_ if (generateModel && methods.length) { _%>
import { success, notFound<% if (storeUser && (userMethods.indexOf('PUT') !== -1 || userMethods.indexOf('DELETE') !== -1)) { %>, authorOrAdmin<% } %> } from '../../services/response/'
import { <%= pascal %> } from '.'
<%_ } _%>
<%_ if (methods.indexOf('POST') !== -1) { _%>

export const create = ({ <%= storeUser ? 'user, ' : '' %><%- modelFields.length ?  'bodymen: { body }' : 'body' %> }, res, next) =>
  <%_ if (generateModel) { _%>
  <%_ if (storeUser) { _%>
  <%= pascal %>.create({ ...body, <%= userField === 'user' ? 'user' : userField + ': user' %> })
  <%_ } else { _%>
  <%= pascal %>.create(body)
  <%_ } _%>
    .then((<%= camel %>) => <%= camel %>.view(true))
    .then(success(res, 201))
    .catch(next)
  <%_ } else { _%>
  res.status(201).json(body)
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('GET LIST') !== -1) { _%>

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  <%_ if (generateModel) { if (getList) { _%>
  <%= pascal %>.count(query)
    .then(count => <%= pascal %>.find(query, select, cursor)
      <%_ if (storeUser) { _%>
      .populate('<%= userField %>')
      <%_ } _%>
      .then((<%= camels %>) => ({
        count,
        rows: <%= camels %>.map((<%= camel %>) => <%= camel %>.view())
      }))
    )
    .then(success(res))
    .catch(next)
  <%_ } else { _%>
  <%= pascal %>.find(query, select, cursor)
    <%_ if (storeUser) { _%>
    .populate('<%= userField %>')
    <%_ } _%>
    .then((<%= camels %>) => <%= camels %>.map((<%= camel %>) => <%= camel %>.view()))
    .then(success(res))
    .catch(next)
  <%_ } } else { _%>
  res.status(200).json([])
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('GET ONE') !== -1) { _%>

export const show = ({ params }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.findById(params.id)
    <%_ if (storeUser) { _%>
    .populate('<%= userField %>')
    <%_ } _%>
    .then(notFound(res))
    .then((<%= camel %>) => <%= camel %> ? <%= camel %>.view() : null)
    .then(success(res))
    .catch(next)
  <%_ } else { _%>
  res.status(200).json({})
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('PUT') !== -1) { _%>

export const update = ({ <%=
  storeUser && userMethods.indexOf('PUT') !== -1 ? 'user, ' : ''
%><%- modelFields.length ?  'bodymen: { body }' : 'body' %>, params }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.findById(params.id)
    <%_ if (storeUser) { _%>
    .populate('<%= userField %>')
    <%_ } _%>
    .then(notFound(res))
    <%_ if (storeUser && userMethods.indexOf('PUT') !== -1) { _%>
    .then(authorOrAdmin(res, user, '<%= userField %>'))
    <%_ } _%>
    .then((<%= camel %>) => <%= camel %> ? Object.assign(<%= camel %>, body).save() : null)
    .then((<%= camel %>) => <%= camel %> ? <%= camel %>.view(true) : null)
    .then(success(res))
    .catch(next)
  <%_ } else { _%>
  res.status(200).json(body)
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('DELETE') !== -1) { _%>

export const destroy = ({ <%=
  storeUser && userMethods.indexOf('DELETE') !== -1 ? 'user, ' : ''
%>params }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.findById(params.id)
    .then(notFound(res))
    <%_ if (storeUser && userMethods.indexOf('DELETE') !== -1) { _%>
    .then(authorOrAdmin(res, user, '<%= userField %>'))
    <%_ } _%>
    .then((<%= camel %>) => <%= camel %> ? <%= camel %>.remove() : null)
    .then(success(res, 204))
    .catch(next)
  <%_ } else { _%>
  res.status(204).end()
  <%_ } _%>
<%_ } _%>
