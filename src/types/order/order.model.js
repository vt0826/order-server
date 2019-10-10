import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number
      //default: 10000,
      //required: true,
      // unique: true
    },
    complete: {
      type: Boolean,
      default: false
    },
    orderItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'item'
        },
        variants: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'item'
        },
        option: {
          type: String
        },
        quantity: {
          type: Number
        },
        amount: {
          type: Number
        }
      }
    ],
    subTotal: {
      type: Number,
      required: true
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'campaign',
      required: true
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'account',
      required: true
    },
    payment: {
      type: String
    },
    note: {
      type: String
    }
  },
  { timestamps: true }
)

export const Order = mongoose.model('order', orderSchema)
