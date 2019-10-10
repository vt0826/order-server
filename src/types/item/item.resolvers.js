import { Item } from '../item/item.model'
import { Campaign } from '../campaign/campaign.model'
import { Account } from '../account/account.model'
import { AuthenticationError } from 'apollo-server'
import { ApolloError } from 'apollo-server'
import { userToken } from '../../utils/auth'

//return item object from giving object id
const item = async (_, args, ctx) => {
  const item = await Item.findById(args.itemId)
    .populate('host')
    .exec()
  if (!item) {
    throw new ApolloError('Item doesnt exist', 404)
  }
  return item
}

// return all the items in the system
const items = async (_, args, ctx) => {
  const items = await Item.find({})
    .populate('host')
    .exec()
  if (!items) {
    throw new ApolloError('Cannot Find Items In The System ', 404)
  }
  return items
}

//return all the items from current account user
const accountItems = async (_, args, ctx) => {
  const items = await Item.find({ host: ctx.user._id }).exec()
  if (!items) {
    throw new ApolloError('Accoount Has No Items In The System ', 404)
  }
  return items
}

//create new item
const newItem = async (_, args, ctx) => {
  const newItem = await Item.create({
    ...args.input,
    host: ctx.user._id
  })

  if (!newItem) {
    throw new ApolloError('Having Problem Creating New Item', 404)
  } else {
    return { status: true, message: 'Item Created', id: newItem._id }
  }
}

//create new item and add to campain's listItems
const newItemAddToListItems = async (_, args, ctx) => {
  const newItem = await Item.create({
    ...args.input,
    host: ctx.user._id
  })

  if (!newItem) {
    throw new ApolloError('Having Problem Creating New Item', 404)
  } else {
    const campaign = await Campaign.updateOne(
      { _id: args.campaignId },
      { $push: { listItems: newItem._id } }
    )
    if (!campaign.nModified) {
      throw new ApolloError(
        'New Item Has Been Created But Having Problem Add to ItemLists',
        404
      )
    } else {
      return {
        status: true,
        message: 'Item Created and Added to ItemLists ',
        id: newItem._id
      }
    }
  }
}

//update item
const updateItem = async (_, args, ctx) => {
  const update = args.input

  const item = await Item.updateOne({ _id: args.itemId }, update)
  if (!item.nModified) {
    throw new ApolloError('Failed to Update Item ', 404)
  }
  return { status: true, message: 'Item Updated' }
}

//remove item
const removeItem = async (_, args, ctx) => {
  const item = await Item.deleteOne({ _id: args.itemId }).exec()
  if (!item.deletedCount) {
    throw new ApolloError('Failed to delete item ', 404)
  }
  return { status: true, message: 'Item Deleted' }
}

//add picture url to the item
const addPictureUrl = async (_, args, ctx) => {
  const picture = await Item.update(
    { _id: args.itemId },
    { $push: { pictures: args.input.pictures } }
  )
  if (!picture.nModified) {
    throw new ApolloError('Failed to Add picture ', 404)
  }
  return { status: true, message: 'Picture Added' }
}

//update item's picture url
const updatePictureUrl = async (_, args, ctx) => {
  const picture = await Item.update(
    { _id: args.itemId, 'pictures._id': args.pictureId },
    { $set: { 'pictures.$.url': args.input.pictures.url } }
  )

  if (!picture.nModified) {
    throw new ApolloError('Failed to update picture ', 404)
  }
  return { status: true, message: 'Picture Updated' }
}

//remove picture url from item
const removePictureUrl = async (_, args, ctx) => {
  const picture = await Item.update(
    { _id: args.itemId },
    { $pull: { pictures: { _id: args.pictureId } } }
  )

  if (!picture.nModified) {
    throw new ApolloError('Failed to Remove Picture ', 404)
  }
  return { status: true, message: 'Picture Removed' }
}

//add variants to item
const addVariant = async (_, args, ctx) => {
  const variant = await Item.update(
    { _id: args.itemId },
    { $push: { variants: args.input.variants } }
  )
  if (!variant.nModified) {
    throw new ApolloError('Failed to Add Variant ', 404)
  }
  return { status: true, message: 'New Variant Added' }
}

//update variants for item
const updateVariant = async (_, args, ctx) => {
  const variant = await Item.update(
    { _id: args.itemId, 'variants._id': args.variantId },
    {
      $set: {
        'variants.$.option': args.input.variants.option,
        'variants.$.quantity': args.input.variants.quantity
      }
    }
  )

  if (!variant.nModified) {
    throw new ApolloError('Failed to Update Vaiant ', 404)
  }
  return { status: true, message: 'Variant Updated' }
}

//remove variants from item
const removeVariant = async (_, args, ctx) => {
  const variant = await Item.update(
    { _id: args.itemId },
    { $pull: { variants: { _id: args.variantId } } }
  )

  if (!variant.nModified) {
    throw new ApolloError('Failed to Remove Variant ', 404)
  }
  return { status: true, message: 'Variant Removed' }
}

export default {
  Query: {
    items,
    item,
    accountItems
  },
  Mutation: {
    newItem,
    updateItem,
    removeItem,
    addPictureUrl,
    updatePictureUrl,
    removePictureUrl,
    addVariant,
    updateVariant,
    removeVariant,
    newItemAddToListItems
  },
  //add resovler type for graph ql to return associated host from account model
  Item: {
    //   __resolveType(item) {},
    //  host(item) {
    //   return Account.findById(item.host).exec()
    // }
  }
}
