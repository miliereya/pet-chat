import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { UserConnection } from './schemas/user-connection.schema'

@Injectable()
export class ConnectService {
	constructor(
		@InjectModel('UserConnection')
		private readonly userConnectionModel: Model<UserConnection>
	) {}

	async createEntity(userId: Types.ObjectId) {
		await this.userConnectionModel.create({ userId })
	}

	async findUserConnection(userId: Types.ObjectId) {
		return await this.userConnectionModel.findOne({ userId })
	}

	async addConnection(userId: Types.ObjectId, socketId: string) {
		await this.userConnectionModel.updateOne(
			{ userId },
			{ $push: { socketIds: socketId } }
		)
	}

	async removeConnection(userId: Types.ObjectId, socketId: string) {
		await this.userConnectionModel.updateOne(
			{ userId },
			{ $pull: { socketIds: socketId } }
		)
	}
}
