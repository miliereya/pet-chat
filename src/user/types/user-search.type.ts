import { Types } from 'mongoose'

export type TypeUserSearch = 'username' | 'email'

export type TypeUserSearchMongooseParams = {
	_id: { $ne: Types.ObjectId }
	email?: RegExp
	username?: RegExp
}
