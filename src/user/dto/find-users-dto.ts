import { IsString } from 'class-validator'
import { Types } from 'mongoose'
import { TypeUserSearch } from '../types'

export class FindUsersDto {
	@IsString()
	searchField: TypeUserSearch

	@IsString()
	value: string

	@IsString()
	userId: Types.ObjectId
}
