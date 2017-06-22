import mongoose, { Schema } from 'mongoose'

<%_ if (modelFields.length || storeUser) { _%>
const <%= camel %>Schema = new Schema({
  <%_ if (storeUser) { _%>
  <%= userField %>: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  }<%= modelFields.length ? ',' : '' %>
  <%_ } _%>
  <%_ modelFields.forEach(function (field, i) { _%>
  <%= field %>: {
    type: String
  }<%= i !== modelFields.length - 1 ? ',' : ''%>
  <%_ }) _%>
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})
<%_ } else { _%>
const <%= camel %>Schema = new Schema({}, { timestamps: true })
<%_ } _%>

<%= camel %>Schema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      <%_ if (storeUser) { _%>
      <%= userField %>: this.<%= userField %>.view(full),
      <%_ } _%>
      <%_ if (modelFields.length) { _%>
      <%_ modelFields.forEach(function (field) { _%>
      <%= field %>: this.<%= field %>,
      <%_ }) _%>
      <%_ } _%>
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('<%= pascal %>', <%= camel %>Schema)

export const schema = model.schema
export default model
