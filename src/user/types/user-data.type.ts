import { Types } from 'mongoose'
import { User } from '../schemas/user.schema'

export interface UserDataPublicData {
	_id: Types.ObjectId
	email: string
	username: string
	avatar: string
}

export type UserWithId = Omit<
	User & {
		_id: Types.ObjectId
	},
	never
>
