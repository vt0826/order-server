import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    detail: {
      type: String
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
      }
    ],
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'account',
      required: true
    },
    listItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item'
      }
    ],
    pickupTime: {
      type: Date
    },
    pickupAddress: {
      type: String
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    fulfillReq: {
      type: Number
    },
    expiration: {
      type: Date
    }
  },
  { timestamps: true }
)

campaignSchema.virtual('fulfillment').get(function() {
  return Math.Round((this.fulfillReq / this.totalAmount) * 100)
})

export const Campaign = mongoose.model('campaign', campaignSchema)
