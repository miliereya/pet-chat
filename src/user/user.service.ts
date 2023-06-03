import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User } from './schemas/user.schema'
import { ChatService } from 'src/chat/chat.service'
import { FindUsersDto, UpdateAvatarDto, pickUserPublicData } from './dto'
import { TypeUserSearchMongooseParams } from './types'
import { UserDataPublicData, UserWithId } from './types/user-data.type'

@Injectable()
export class UserService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		private readonly chatService: ChatService
	) {}

	async findUsers(dto: FindUsersDto) {
		const query: TypeUserSearchMongooseParams = {
			_id: { $ne: dto.userId },
			[dto.searchField]: new RegExp(dto.value, 'i'),
		}
		return await this.userModel
			.find(query)
			.select('_id email avatar username')
	}

	async updateAvatar(userId: Types.ObjectId, dto: UpdateAvatarDto) {
		const user = await this.userModel.findByIdAndUpdate(
			userId,
			{ avatar: dto.avatar },
			{ new: true }
		)
		if (!user) throw new NotFoundException('No user by following id')
		return {
			avatar: user.avatar,
		}
	}

	async findByIdPublic(_id: Types.ObjectId) {
		const user = await this.userModel.findById(_id)
		if (!user) throw new NotFoundException('No user by following id')

		return pickUserPublicData(user)
	}

	// private async findById(_id: Types.ObjectId) {
	// 	const user = await this.userModel.findById(_id)
	// 	if (!user) throw new NotFoundException('No user by following id')

	// 	return user
	// }

	async getUserDataWithChats(
		user: Omit<
			User & {
				_id: Types.ObjectId
			},
			never
		>
	) {
		const chats = []
		for (let i = 0; i < user.chats.length; i++) {
			const chat = await this.chatService.getOneChat(user.chats[i])
			const users: UserDataPublicData[] = []
			for (let l = 0; l < chat.users.length; l++) {
				users.push(pickUserPublicData(chat.users[l]))
			}
			chats.push({
				_id: chat._id,
				createdAt: chat.createdAt,
				updatedAt: chat.updatedAt,
				messages: chat.messages,
				users,
			})
		}
		return {
			user: pickUserPublicData(user),
			chats,
		}
	}
}
