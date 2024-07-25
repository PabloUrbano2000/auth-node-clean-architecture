import { Router } from 'express'
import { AuthDatasourceImpl, AuthRepositoryImpl } from '../../infraestructure'
import { AuthMiddleware } from '../middewares/auth.middleware'
import { AuthController } from './controller'

export class AuthRoutes {
  static get routes(): Router {
    const router = Router()
    const datasource = new AuthDatasourceImpl()
    const authRepository = new AuthRepositoryImpl(datasource)
    const controller = new AuthController(authRepository)

    // Definir todas las rutas principales
    router.post('/login', controller.loginUser)
    router.post('/register', controller.registerUser)
    router.get('/', [AuthMiddleware.validateJWT], controller.getUsers)
    return router
  }
}
