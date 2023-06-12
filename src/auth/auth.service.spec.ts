import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { Connection, Model, connect } from 'mongoose'
import { User, UserSchema } from '../user/schemas/user.schema'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { getModelToken } from '@nestjs/mongoose'
import { BadRequestException } from '@nestjs/common'
import { ChatService } from '../chat/chat.service'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { ConnectService } from '../connect/connect.service'
import { ConfigService } from '@nestjs/config'
import { Chat, ChatSchema } from '../chat/schemas/chat.schema'
import { Message, MessageSchema } from '../chat/schemas/message.schema'
import {
	UserConnection,
	UserConnectionSchema,
} from '../connect/schemas/user-connection.schema'

describe('auth.service.spec.ts', () => {
	let authService: AuthService
	let mongod: MongoMemoryServer
	let mongoConnection: Connection
	let userModel: Model<User>
	let chatModel: Model<Chat>
	let messageModel: Model<Message>
	let userConnectionModel: Model<UserConnection>

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const uri = mongod.getUri()
		mongoConnection = (await connect(uri)).connection
		userModel = mongoConnection.model('User', UserSchema)
		chatModel = mongoConnection.model('Chat', ChatSchema)
		messageModel = mongoConnection.model('Message', MessageSchema)
		userConnectionModel = mongoConnection.model(
			'UserConnection',
			UserConnectionSchema
		)
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ConfigService,
				AuthService,
				ChatService,
				JwtService,
				UserService,
				ConnectService,
				{
					provide: getModelToken('User'),
					useValue: userModel,
				},
				{
					provide: getModelToken('Chat'),
					useValue: chatModel,
				},
				{
					provide: getModelToken('Message'),
					useValue: messageModel,
				},
				{
					provide: getModelToken('UserConnection'),
					useValue: userConnectionModel,
				},
			],
		}).compile()

		authService = module.get<AuthService>(AuthService)
	})

	afterAll(async () => {
		await mongoConnection.dropDatabase()
		await mongoConnection.close()
		await mongod.stop()
	})

	afterEach(async () => {
		const collections = mongoConnection.collections
		for (const key in collections) {
			const collection = collections[key]
			await collection.deleteMany({})
		}
	})

	const email = 'test@mail.ru'
	const password = 'testpassword'
	const username = 'username'

	describe('registration()', () => {
		const registerDto = {
			email,
			password,
			username,
		}
		it('should add new user', async () => {
			const userData = await authService.registration(registerDto)
			expect(userData.user.email).toStrictEqual(email)
			expect(userData.user.username).toStrictEqual(username)
		})

		it('should throw 400 (This email is already taken)', async () => {
			await authService.registration(registerDto)
			await expect(authService.registration(registerDto)).rejects.toThrow(
				new BadRequestException('This email is already taken')
			)
		})
	})
})
