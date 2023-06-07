import { Injectable } from '@nestjs/common'
import { ConnectDto, DeleteChatDto, StartChatDto } from './dto'
import { ConnectService } from 'src/connect/connect.service'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Chat } from './schemas/chat.schema'
import { Message } from './schemas/message.schema'
import { PopulatedChat } from './types/chat/chat-populated.type'
import { pickUserPublicDataArray } from 'src/user/dto'
import { User } from 'src/user/schemas/user.schema'
import { Socket } from 'socket.io'
import { ChatActions } from './types'

@Injectable()
export class ChatService {
	constructor(
		private readonly connectService: ConnectService,
		@InjectModel('Chat') private readonly chatModel: Model<Chat>,
		@InjectModel('Message') private readonly messageModel: Model<Message>,
		@InjectModel('User') private readonly userModel: Model<User>
	) {}

	async connect(connectDto: ConnectDto, socketId: string) {
		await this.connectService.addConnection(connectDto.userId, socketId)
	}

	async startChat(startChatDto: StartChatDto, client: Socket) {
		const { fromUserId, toUserId } = startChatDto
		const users = [fromUserId, toUserId]
		const newChat = await this.chatModel.create({
			users,
		})

		await this.userModel.updateMany(
			{
				_id: {
					$in: users,
				},
			},
			{
				$push: { chats: newChat._id },
			}
		)
		await this.broadcast(users, client, ChatActions.receive_new, newChat)
		return await this.getOneChat(newChat._id)
	}

	async getOneChat(chatId: Types.ObjectId) {
		const chat = (
			await this.chatModel
				.findById(chatId)
				.populate('users')
				.populate('messages')
				.exec()
		).toObject() as PopulatedChat
		const users = pickUserPublicDataArray(chat.users)
		return { ...chat, users }
	}

	async deleteChat(deleteChatDto: DeleteChatDto, client: Socket) {
		const chat = await this.chatModel.findById(deleteChatDto.chatId)
		if (!chat) {
			return
		}
		await this.userModel.updateMany(
			{
				_id: {
					$in: chat.users,
				},
			},
			{
				$pull: { chats: chat._id },
			}
		)
		await this.broadcast(chat.users, client, ChatActions.receive_delete, {
			chatId: chat._id,
		})
		await chat.deleteOne()
	}

	private async broadcast(
		userIds: Types.ObjectId[],
		client: Socket,
		action: string,
		data: any
	) {
		let allConnections = []
		for (let i = 0; i < userIds.length; i++) {
			const userConnection = await this.connectService.findUserConnection(
				userIds[i]
			)
			allConnections.push(...userConnection.socketIds)
		}
		allConnections = allConnections.filter((c) => c !== client.id)

		for (let i = 0; i < allConnections.length; i++) {
			client.to(allConnections[i]).emit(action, data, (err, res) => {
				console.log(err, res)
			})
		}
	}
}
