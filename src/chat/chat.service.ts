import { Injectable } from '@nestjs/common'
import { ConnectDto, StartChatDto } from './dto'
import { ConnectService } from 'src/connect/connect.service'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Chat } from './schemas/chat.schema'
import { Message } from './schemas/message.schema'
import { PopulatedChat } from './types/chat-populated.type'

@Injectable()
export class ChatService {
	constructor(
		private readonly connectService: ConnectService,
		@InjectModel('Chat') private readonly chatModel: Model<Chat>,
		@InjectModel('Message') private readonly messageModel: Model<Message>
	) {}

	async connect(connectDto: ConnectDto, socketId: string) {
		await this.connectService.addConnection(connectDto.userId, socketId)
	}

	async startChat(startChatDto: StartChatDto) {
		const { fromUserId, toUserId } = startChatDto
		const newChat = await this.chatModel.create({
			users: [fromUserId, toUserId],
		})

		await this.userModel.findByIdAndUpdate(toUserId, {
			$push: { chats: newChat._id },
		})

		await this.userModel.findByIdAndUpdate(fromUserId, {
			$push: { chats: newChat._id },
		})

		const chat = await this.getOneChat(newChat._id)
		const users = []
		for (let l = 0; l < chat.users.length; l++) {
			users.push(this.pickUserPublicData(chat.users[l]))
		}
		return {
			_id: chat._id,
			createdAt: chat.createdAt,
			updatedAt: chat.updatedAt,
			messages: chat.messages,
			users,
		}
	}

	async getOneChat(chatId: Types.ObjectId) {
		const chat: PopulatedChat = (await this.chatModel
			.findById(chatId)
			.populate('users')
			.populate('messages')
			.exec()) as unknown as PopulatedChat
		return chat
	}
}
