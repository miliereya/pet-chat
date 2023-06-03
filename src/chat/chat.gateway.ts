import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets'
import { ChatService } from './chat.service'
import { ChatActions } from './types'
import { ConnectDto, StartChatDto } from './dto'
import { Socket } from 'socket.io'
import { ConnectService } from 'src/connect/connect.service'

@WebSocketGateway({
	cors: {
		credentials: true,
		origin: process.env.CLIENT_URL,
	},
})
export class ChatGateway {
	constructor(
		private readonly chatService: ChatService,
		private readonly connectService: ConnectService
	) {}

	@SubscribeMessage(ChatActions.connect)
	async connect(
		@MessageBody() connectDto: ConnectDto,
		@ConnectedSocket() client: Socket
	) {
		this.chatService.connect(connectDto, client.id)
	}

	@SubscribeMessage(ChatActions.start)
	async startChat(
		@MessageBody() startChatDto: StartChatDto,
		@ConnectedSocket() client: Socket
	) {
		return this.chatService.startChat(startChatDto, client)
	}

	// @SubscribeMessage(ChatActions.delete)
	// async deleteChat(
	// 	@MessageBody() deleteChatDto: DeleteChatDto,
	// 	@ConnectedSocket() client: Socket
	// ) {
	// 	await this.chatService.deleteChat(deleteChatDto, client)
	// }
}
