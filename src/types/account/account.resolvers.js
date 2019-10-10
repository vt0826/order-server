import { Account } from '../account/account.model'
import { AuthenticationError } from 'apollo-server'
import { ApolloError } from 'apollo-server'
import bcrypt from 'bcrypt'

//return current user's accounts info
const account = async (_, args, ctx) => {
  const user = await Account.findOne({ email: args.email }).exec()
   if (!ctx.token) {
    throw new ApolloError('Please Log In first', 403)
    if (!user) {
      throw new ApolloError('Account doesnt exist', 404)
    }
  }
  return user
}

// return all accounts info in the database
const accounts = async (_, args, ctx) => {
  const users = await Account.find({}).exec()
  if (!users) {
    throw new ApolloError('Cannot Find Accoounts In The System ', 404)
  }
  return users
}

//create new account
const newAccount = async (_, args, ctx) => {
  const user = await Account.findOne({ email: args.input.email }).exec()
  if (user) {
    throw new ApolloError('The User Already Exist', 404)
  }
  const newUser = await Account.create({ ...args.input })
  if (!newUser) {
    throw new ApolloError('Having Problem Creating Account', 404)
  } else {
    return { status: true, message: 'Account Created' }
  }
}

//update account
const updateAccount = async (_, args, ctx) => {
  const update = args.input

  const user = await Account.updateOne({ email: args.email }, update)
  if (!user.nModified) {
    throw new ApolloError('Failed to Update Account', 404)
  }
  return { status: true, message: 'Account Updated' }
}

//remove account
const removeAccount = async (_, args, ctx) => {
  const deleteUser = await Account.deleteOne({ email: args.email }).exec()
  if (!deleteUser.deletedCount) {
    throw new ApolloError('Failed to delete account ', 404)
  }
  return { status: true, message: 'Account Deleted' }
}

export default {
  Query: {
    accounts,
    account
  },
  Mutation: {
    newAccount,
    updateAccount,
    removeAccount
  }
}
