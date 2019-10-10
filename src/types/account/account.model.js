import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      ref: 'item'
    },
    displayName: {
      type: String
    },
    thirdPartyPaymentAccount: {
      venmo: {
        type: String
      },
      quickPay: {
        type: String
      },
      payPal: {
        type: String
      }
    }
  },
  // { toJSON: { virtuals: true }, toObject: { virtuals: true } }
  { timestamps: true }
)

export const Account = mongoose.model('account', accountSchema)
