import { IsString } from 'class-validator'
import { Types } from 'mongoose'

export class DeleteMessageDto {
	@IsString()
	messageId: Types.ObjectId
}
