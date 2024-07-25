import { BcryptAdapter } from '../../config'
import { UserModel } from '../../data/mongodb'
import {
  AuthDatasource,
  CustomError,
  RegisterUserDto,
  UserEntity
} from '../../domain'
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto'
import { UserMapper } from '../mappers/user.mapper'

type HashFunction = (password: string) => string
type CompareFunction = (password: string, hashed: string) => boolean

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: CompareFunction = BcryptAdapter.compare
  ) {}
  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { email, password } = loginUserDto
    try {
      // 1. Verificar si el correo existe
      const exists = await UserModel.findOne({ email })
      if (!exists) throw CustomError.badRequest('Email or password are invalid')
      // 2. Validar la contraseña
      if (!this.comparePassword(password, exists.password)) {
        throw CustomError.badRequest('Email or password are invalid')
      }
      return UserMapper.userEntityFromObject(exists)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw CustomError.intervalServer()
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const { name, email, password } = registerUserDto
    try {
      // 1. Verificar si el correo existe
      const exists = await UserModel.findOne({ email: email })
      if (exists) throw CustomError.badRequest('User already exists')

      const user = await UserModel.create({
        name,
        email,
        password: this.hashPassword(password)
      })
      // 2. Hash de contraseña
      await user.save()

      // 3. Mapear la respuesta a nuestra entidad
      return UserMapper.userEntityFromObject(user)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw CustomError.intervalServer()
    }
  }
}
