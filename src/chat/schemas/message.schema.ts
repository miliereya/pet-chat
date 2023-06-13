import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ timestamps: true })
export class Message {
	@Prop()
	chatId: Types.ObjectId

	@Prop({ ref: 'User' })
	user: Types.ObjectId

	@Prop()
	text: string

	@Prop()
	likedBy: Types.ObjectId[]

	@Prop()
	attachedFiles: string[]

	@Prop({ required: false })
	editedByUser?: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)
