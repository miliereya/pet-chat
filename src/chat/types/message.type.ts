import { Types } from 'mongoose'
import { Message } from '../schemas/message.schema'

export type MessageWithId = Omit<
	Message & {
		_id: Types.ObjectId
	},
	never
>
