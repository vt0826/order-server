import { Item } from '../item/item.model'
import { Account } from '../account/account.model'

import { Campaign } from '../campaign/campaign.model'
import { AuthenticationError } from 'apollo-server'
import { ApolloError } from 'apollo-server'
import { userToken } from '../../utils/auth'

import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      return value.getTime() // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null
    }
  })
}

//return campaign from giving campaign id
const campaign = async (_, args, ctx) => {
  const queryCampaign = await Campaign.findById(args.campaignId)
    .populate('members host listItems ')
    .exec()
  if (!queryCampaign) {
    throw new ApolloError('Campaign Doesnt Exist', 404)
  }
  return queryCampaign
}

//return all the campaigns in the system
const campaigns = async (_, args, ctx) => {
  const campaignsIndex = await Campaign.find({})
    .populate('members host listItems')
    .exec()
  if (!campaignsIndex) {
    throw new ApolloError('Cannot Find Campaigns In The System ', 404)
  }
  return campaignsIndex
}

//return all the campaigns hosted by current account user
const hostCampaigns = async (_, args, ctx) => {
  const campaigns = await Campaign.find({ host: ctx.user._id })
    .populate('members host listItems ')
    .exec()
  if (!campaigns) {
    throw new ApolloError('Accoount Has No Campaigns In The System ', 404)
  }
  return campaigns
}

//return all the campaigns that current account user has joined
const joinedCampaigns = async (_, args, ctx) => {
  const campaigns = await Campaign.find()
    .where('members')
    .in(ctx.user._id)
    .populate('members host listItems ')
    .exec()

  if (!campaigns) {
    throw new ApolloError('Accoount Has No Items In The System ', 404)
  }
  return campaigns
}

//add new campaign
const newCampaign = async (_, args, ctx) => {
  const newCampaign = await Campaign.create({
    ...args.input,
    host: ctx.user._id
  })
  if (!newCampaign) {
    throw new ApolloError('Having Problem Creating New Campaign', 404)
  } else {
    return { status: true, message: 'Campaign Created', id: newCampaign._id }
  }
}

//update campaign
const updateCampaign = async (_, args, ctx) => {
  const update = args.input

  const campaign = await Campaign.updateOne({ _id: args.campaignId }, update)
  if (!campaign.nModified) {
    throw new ApolloError('Failed to Update Campaign ', 404)
  }
  return { status: true, message: 'Campaign Updated' }
}

//remove campaign
const removeCampaign = async (_, args, ctx) => {
  const campaign = await Campaign.deleteOne({ _id: args.campaignId }).exec()
  if (!campaign.deletedCount) {
    throw new ApolloError('Failed to delete Campaign ', 404)
  }
  return { status: true, message: 'Campaign Deleted' }
}

//add member to the campaign
const addMember = async (_, args, ctx) => {
  const account = await Account.findOne({
    email: args.input.members.email
  }).exec()

  const member = await Campaign.updateOne(
    { _id: args.campaignId },
    { $addToSet: { members: account._id } }
  )
  if (!member.nModified) {
    throw new ApolloError('Failed to Add Member ', 404)
  }
  return { status: true, message: 'New Memebr Added' }
}

//remove member to the campaign
const removeMember = async (_, args, ctx) => {
  const account = await Account.findOne({
    email: args.input.members.email
  }).exec()
  const member = await Campaign.updateOne(
    { _id: args.campaignId },
    { $pull: { members: account._id } }
  )

  if (!member.nModified) {
    throw new ApolloError('Failed to Remove Member ', 404)
  }
  return { status: true, message: 'Member Removed' }
}

//add items to the given campaign
const addListItem = async (_, args, ctx) => {
  const item = await Item.findById(args.input.listItems.itemId).exec()
  const listItem = await Campaign.updateOne(
    { _id: args.campaignId },
    { $addToSet: { listItems: item._id } }
  )
  if (!listItem.nModified) {
    throw new ApolloError('Failed to Add Item ', 404)
  }
  return { status: true, message: 'Item Added' }
}

//remove item from given campaign
const removeListItem = async (_, args, ctx) => {
  const listItem = await Campaign.updateOne(
    { _id: args.campaignId },
    { $pull: { listItems: args.input.listItems.itemId } }
  )

  if (!listItem.nModified) {
    throw new ApolloError('Failed to Remove Item ', 404)
  }
  return { status: true, message: 'Item Removed' }
}

export default {
  Query: {
    campaigns,
    campaign,
    hostCampaigns,
    joinedCampaigns
  },
  Mutation: {
    newCampaign,
    updateCampaign,
    removeCampaign,
    addMember,
    removeMember,
    addListItem,
    removeListItem
  },
  Campaign: {
    // __resolveType(campaign) {},
    // host(campaign) {
    //  return Account.findById(campaign.host).exec()
    // }
  }
}
