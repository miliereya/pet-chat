import { IsString } from 'class-validator'
import { Types } from 'mongoose'

export class CreateMessageDto {
	@IsString()
	chatId: Types.ObjectId

	@IsString()
	user: Types.ObjectId

	@IsString()
	text: string
}
