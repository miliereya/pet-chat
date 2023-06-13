import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User } from './schemas/user.schema'
import { ChatService } from '../chat/chat.service'
import { FindUsersDto, UpdateAvatarDto, pickUserPublicData } from './dto'
import { TypeUserSearchMongooseParams } from './types'
import { PickChatData } from '../chat/dto'
import { PopulatedChatWithPublicUsers } from 'src/chat/types'
import { TimeStampsWithId } from 'src/types'

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

	async getUserDataWithChats(
		user: Omit<
			User & {
				_id: Types.ObjectId
			},
			never
		>
	) {
		const chats: (PopulatedChatWithPublicUsers & TimeStampsWithId)[] = []
		for (let i = 0; i < user.chats.length; i++) {
			const chat = await this.chatService.getOneChat(user.chats[i])
			chats.push(PickChatData(chat))
		}
		return {
			user: pickUserPublicData(user),
			chats,
		}
	}
}
