import { UserWithId } from 'src/user/types/user-data.type'
import { Chat } from '../schemas/chat.schema'
import { MessageWithId } from './message.type'

export interface PopulatedChat extends Omit<Chat, 'users' | 'messages'> {
	users: UserWithId[]
	messages: MessageWithId[]
}
