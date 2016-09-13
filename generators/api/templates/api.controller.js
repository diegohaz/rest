<%_ if (generateModel && methods.length) { _%>
import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { <%= pascal %> } from '.'
<%_ } _%>
<%_ if (methods.indexOf('POST') !== -1) { _%>

export const create = (<% if (modelFields.length) { %>{ bodymen: { body } }<% } else { %>{ body }<% } %>, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.create(body)
    .then((<%= camel %>) => <%= camel %>.view(true))
    .then(success(res, 201))
    .catch(next)
  <%_ } else { _%>
  res.status(201).json(body)
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('GET LIST') !== -1) { _%>

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.find(query, select, cursor)
    .then((<%= camels %>) => <%= camels %>.map((<%= camel %>) => <%= camel %>.view()))
    .then(success(res))
    .catch(next)
  <%_ } else { _%>
  res.status(200).json([])
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('GET ONE') !== -1) { _%>

export const show = ({ params }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.findById(params.id)
    .then(notFound(res))
    .then((<%= camel %>) => <%= camel %> ? <%= camel %>.view() : null)
    .then(success(res))
    .catch(next)
  <%_ } else { _%>
  res.status(200).json({})
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('PUT') !== -1) { _%>

export const update = ({<% if (modelFields.length) { %> bodymen: { body }<% } else { %> body<% } %>, params }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.findById(params.id)
    .then(notFound(res))
    .then((<%= camel %>) => <%= camel %> ? _.merge(<%= camel %>, body).save() : null)
    .then((<%= camel %>) => <%= camel %> ? <%= camel %>.view(true) : null)
    .then(success(res))
    .catch(next)
  <%_ } else { _%>
  res.status(200).json(body)
  <%_ } _%>
<%_ } _%>
<%_ if (methods.indexOf('DELETE') !== -1) { _%>

export const destroy = ({ params }, res, next) =>
  <%_ if (generateModel) { _%>
  <%= pascal %>.findById(params.id)
    .then(notFound(res))
    .then((<%= camel %>) => <%= camel %> ? <%= camel %>.remove() : null)
    .then(success(res, 204))
    .catch(next)
  <%_ } else { _%>
  res.status(204).end()
  <%_ } _%>
<%_ } _%>
