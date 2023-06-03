import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ConnectModule } from 'src/connect/connect.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatSchema } from './schemas/chat.schema'
import { MessageSchema } from './schemas/message.schema'

@Module({
	imports: [
		ConnectModule,
		MongooseModule.forFeature([
			{ name: 'Chat', schema: ChatSchema },
			{ name: 'Message', schema: MessageSchema },
		]),
	],
	providers: [ChatGateway, ChatService],
	exports: [ChatService],
})
export class ChatModule {}
