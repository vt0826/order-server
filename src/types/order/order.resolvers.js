import { Account } from '../account/account.model'
import { Item } from '../item/item.model'
import { Order } from '../order/order.model'
import { Campaign } from '../campaign/campaign.model'
import { AuthenticationError } from 'apollo-server'
import { ApolloError } from 'apollo-server'
import mongoose from 'mongoose'

const order = async (_, args, ctx) => {
  const invoice = await Order.findById(args.orderId)
    .populate('campaign account orderItems.item')
    .exec()
  if (!invoice) {
    throw new ApolloError('Order Number doesnt exist', 404)
  }
  return invoice
}

const orders = async (_, args, ctx) => {
  const invoices = await Order.find({})
    .populate('campaign account orderItems ')
    .exec()
  if (!invoices) {
    throw new ApolloError('Cannot Find Any Invoices In The System ', 404)
  }
  return invoices
}

const campaignOrders = async (_, args, ctx) => {
  const invoices = await Order.find({ campaign: args.campaignId })
    .populate('campaign account orderItems ')
    .exec()
  if (!invoices) {
    throw new ApolloError('Cannot Find Any Invoices In The System ', 404)
  }
  return invoices
}

const campaignOrderSummary = async (_, args, ctx) => {
  /* 
  Order.aggregate(
    [
      { $match: { campaign: mongoose.Types.ObjectId(args.campaignId) } },
      { $group: { _id: null, sum: { $sum: '$subTotal' } } }
    ],
    function(err, result) {
      orderSummary.totalAmount = result[0].sum
    }
  )
*/
  const queryCampaign = await Campaign.findById(args.campaignId)
    .populate('members host listItems ')
    .exec()

  const orderItems = await Order.aggregate(
    [
      { $match: { campaign: mongoose.Types.ObjectId(args.campaignId) } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: {
            item: '$orderItems.item',
            variants: '$orderItems.variants'
            //option: '$orderItems.option'
          },
          option: { $first: '$orderItems.option' },
          quantity: { $sum: '$orderItems.quantity' },
          amount: { $sum: '$orderItems.amount' }
        }
      },
      {
        $project: {
          _id: 0,
          item: '$_id.item',
          variant: '$_id.variants',
          option: 1,
          quantity: 1,
          amount: 1
        }
      },
      {
        $sort: {
          item: 1
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'item'
        }
      },
      /*
      {
        $lookup: {
          from: 'items',
          localField: 'variant',
          foreignField: 'variants._id',
          as: 'variants'
        }
      },
      */
      { $unwind: '$item' }
    ],

    function(err, result) {
      if (!err) {
        return result
      } else {
        throw new ApolloError('Cannot sort the orders summary', 404)
      }
    }
  )

  const orderSummary = {
    totalAmount: queryCampaign.totalAmount,
    orderItems: orderItems
  }
  return orderSummary
}

const accountOrders = async (_, args, ctx) => {
  const invoices = await Order.find({ account: ctx.user._id })
    .populate('campaign account orderItems ')
    .exec()
  if (!invoices) {
    throw new ApolloError('Cannot Find Any Invoices In The System ', 404)
  }
  return invoices
}

const newOrder = async (_, args, ctx) => {
  const order = await Order.create({ ...args.input, account: ctx.user._id })
  if (order) {
    const campaign = await Campaign.updateOne(
      { _id: args.input.campaign },
      { $inc: { totalAmount: args.input.subTotal } }
    ).exec()
  }
  //const campaignOrders = await Item.variants.id(args.input.orderItems.variants)
  // console.log(campaignOrders)

  if (!Order) {
    throw new ApolloError('Having Problem Creating New Order', 404)
  }
  return { status: true, message: 'Order Created', id: order.id }
}

//update order
const updateOrder = async (_, args, ctx) => {
  const update = args.input

  const order = await Order.updateOne({ _id: args.orderId }, update)
  if (!order.nModified) {
    throw new ApolloError('Failed to Update Order ', 404)
  }
  return { status: true, message: 'Order Updated' }
}

const removeOrder = async (_, args, ctx) => {
  const order = await Order.deleteOne({ id: args.orderId }).exec()
  if (!deleteUser.deletedCount) {
    throw new ApolloError('Failed to Delete Order ', 404)
  }
  return { status: true, message: 'Order Deleted' }
}

export default {
  Query: {
    orders,
    order,
    campaignOrders,
    accountOrders,
    campaignOrderSummary
  },
  Mutation: {
    newOrder,
    updateOrder,
    removeOrder
  },
  OrderItem: {
    __resolveType(item) {},
    variants(invoice) {
      async function variant(invoice) {
        const item = await Item.findById(invoice.item)
        const variant = await item.variants.id(invoice.variants)
        return variant
      }
      return variant(invoice)
    }
  }
}
