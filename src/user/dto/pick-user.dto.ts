import { Types } from 'mongoose'
import { User } from '../schemas/user.schema'

export const pickUserPublicData = (
	user: Omit<
		User & {
			_id: Types.ObjectId
		},
		never
	>
) => {
	return {
		_id: user._id,
		email: user.email,
		username: user.username,
		avatar: user.avatar,
	}
}
