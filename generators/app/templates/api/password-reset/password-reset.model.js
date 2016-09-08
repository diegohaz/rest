import mongoose, { Schema } from 'mongoose'
import { uid } from 'rand-token'

const PasswordResetSchema = new Schema({
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

PasswordResetSchema.methods = {
  view (full) {
    return {
      user: this.user.view(full),
      token: this.token
    }
  }
}

export default mongoose.model('PasswordReset', PasswordResetSchema)
