import mongoose, { Schema } from 'mongoose'
import { uid } from 'rand-token'

const passwordResetSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => uid(32)
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
})

passwordResetSchema.methods = {
  view (full) {
    return {
      user: this.user.view(full),
      token: this.token
    }
  }
}

const model = mongoose.model('PasswordReset', passwordResetSchema)

export const schema = model.schema
export default model
