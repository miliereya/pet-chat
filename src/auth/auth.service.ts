import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from 'src/user/schemas/user.schema'
import { LoginDto, RegistrationDto } from './dto'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './types'
import { hash, genSalt, compare } from 'bcryptjs'
import { UserService } from '../user/user.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private readonly configService: ConfigService,
		@InjectModel('User') private readonly userModel: Model<User>
	) {}

	async registration(dto: RegistrationDto) {
		const isUserExist = await this.userModel.findOne({ email: dto.email })
		if (isUserExist)
			throw new BadRequestException('This email is already taken')

		const salt = await genSalt(3)

		const userCredentials = {
			...dto,
			password: await hash(dto.password, salt),
		}

		const user = await this.userModel.create(userCredentials)
		const tokens = await this.generateTokens({ _id: user._id })
		const userData = await this.userService.pickUserData(user)

		return { tokens, ...userData }
	}

	async login(dto: LoginDto) {
		const user = await this.userModel.findOne({ email: dto.email })
		if (!user) throw new BadRequestException('No user by following email')
		const isValidPassword = await compare(dto.password, user.password)

		if (!isValidPassword) throw new BadRequestException('Wrong credentials')

		const tokens = await this.generateTokens({ _id: user._id })
		const userData = await this.userService.pickUserData(user)

		return { tokens, ...userData }
	}

	async refresh(refreshToken: string) {
		if (!refreshToken)
			throw new BadRequestException('No refresh token was provided')
		try {
			const refreshTokenData = await this.jwtService.verifyAsync(
				refreshToken,
				{
					secret: this.configService.get<string>('jwt.refreshSecret'),
				}
			)

			const payload: JwtPayload = {
				_id: refreshTokenData._id,
			}

			const accessToken = await this.jwtService.signAsync(payload, {
				expiresIn: '20m',
				secret: this.configService.get<string>('jwt.accessSecret'),
			})
			const user = await this.userModel.findById(payload._id)
			if (!user)
				throw new UnauthorizedException('No user by following email')
			const userData = await this.userService.pickUserData(user)
			return {
				tokens: { accessToken },
				...userData,
			}
		} catch (e) {
			throw new UnauthorizedException('Wrong refresh token')
		}
	}

	private async generateTokens(payload: JwtPayload) {
		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: '20m',
			secret: this.configService.get<string>('jwt.accessSecret'),
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: '15d',
			secret: this.configService.get<string>('jwt.refreshSecret'),
		})
		return { accessToken, refreshToken }
	}

	async dropDb() {
		const salt = await genSalt(3)

		const shlepa1 = {
			email: 'Shlepa1@mail.ru',
			password: await hash('1234567*', salt),
			username: 'Shlepa1',
			avatar: '/uploads/avatar/1685383936766-2nWnYtkZ9yk.jpg',
		}
		const shlepa2 = {
			email: 'Shlepa2@mail.ru',
			password: await hash('1234567*', salt),
			username: 'Shlepa2',
			avatar: '/uploads/avatar/1685383919067-d3de72094d9702ec41a20305ec1091ab.png',
		}
		await this.userModel.collection.drop()
		await this.userModel.create(shlepa1)
		await this.userModel.create(shlepa2)
	}
}
