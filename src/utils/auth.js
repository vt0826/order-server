import { Account } from '../types/account/account.model'
import cuid from 'cuid'
import { ApolloError } from 'apollo-server'

/*
export const newApiKey = () => {
  return cuid()
}


export const authenticate = async req => {
  const apiKey = req.headers.authorization

  if (!apiKey) {
    return
  }

  const user = await User.findOne({ apiKey })
    .select('-password')
    .lean()
    .exec()

  return user
}
*/
export const authenticate = async req => {
  const user = await Account.findOne({ email: req.headers.email }).exec()

  // if (!user) {
  //   throw new ApolloError('No user in the system', 404)
  // }

  return user
}

//check if there's session token
export const userToken = token => {
  if (!token) {
    throw new ApolloError('Please Log In first', 403)
  }
}
