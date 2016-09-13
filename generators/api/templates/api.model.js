import mongoose, { Schema } from 'mongoose'

<%_ if (modelFields.length) { _%>
const <%= camel %>Schema = new Schema({
  <%_ modelFields.forEach(function (field, i) { _%>
  <%= field %>: {
    type: String
  }<%= i !== modelFields.length - 1 ? ',' : ''%>
  <%_ }) _%>
}, {
  timestamps: true
})
<%_ } else { _%>
const <%= camel %>Schema = new Schema({}, { timestamps: true })
<%_ } _%>

<%= camel %>Schema.methods = {
  view (full) {
    <%_ if (modelFields.length) { _%>
    const view = {
      // simple view
      id: this.id,
      <%= modelFields.map(function (field) {
        return field + ': this.' + field;
      }).join(',\n') %>
    }
    <%_ } else { _%>
    const view = {
      // simple view
      id: this.id
    }
    <%_ } _%>

    return full ? {
      ...view,
      // add properties for a full view
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    } : view
  }
}

export default mongoose.model('<%= pascal %>', <%= camel %>Schema)
