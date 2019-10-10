import mongoose from 'mongoose'

const variantsSchema = new mongoose.Schema({
  option: { type: String, default: 'default' }
})

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    price: {
      type: Number
    },
    pictures: [
      {
        url: {
          type: String,
          default: 'none'
        }
      }
    ],
    description: {
      type: String
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'account'
    },
    variants: [variantsSchema]
  },
  { timestamps: true }
)

itemSchema.pre('save', function(next) {
  if (!this.variants || this.variants.length == 0) {
    this.variants = []
    this.variants.push({
      option: 'default'
    })
  }
  next()
})

export const Item = mongoose.model('item', itemSchema)
