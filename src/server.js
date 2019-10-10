import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { authenticate } from './utils/auth'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'

import mongoose from 'mongoose'

import account from './types/account/account.resolvers'
import campaign from './types/campaign/campaign.resolvers'
import item from './types/item/item.resolvers'
import order from './types/order/order.resolvers'
import { Account } from './types/account/account.model'
import { Camapign } from './types/campaign/campaign.model'
import { Item } from './types/item/item.model'
import { Order } from './types/order/order.model'

// inserts all schema files into types
const types = ['account', 'campaign', 'item', 'order']

export const start = async () => {
  const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],

    // merge all the resolvers together
    resolvers: merge({}, account, campaign, item, order),

    // return context for resolvers
    async context({ req }) {
      const user = await authenticate(req)
      const token = req.headers.token

      return { token, user }
    }
  })

  await connect(config.dbUrl)
  server.listen({ port: process.env.PORT || 3000 }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
}
