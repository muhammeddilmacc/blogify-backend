// inversify.config.ts
import { Container } from 'inversify';
import { UserService } from './services/UserService.js';
import { UserRepository } from './repositories/UserRepository.js';
import { UserController } from './controllers/UserController.js';
import { AuthController } from './controllers/AuthController.js';
import { AuthService } from './services/AuthService.js';
import { PostController } from './controllers/PostController.js';
import { PostService } from './services/PostService.js';
import { PostRepository } from './repositories/PostRepository.js';
import { FirebaseAuthService } from './services/FirebaseAuthService.js';
import { TYPES } from './utils/types.js';
import { db } from './utils/config.js';
import * as dotenv from 'dotenv';
import { AboutController } from './controllers/AboutController.js';
import { AboutService } from './services/AboutService.js';
import { FileService } from './services/FileService.js';
import { CloudinaryService } from './services/CloudinaryService.js';
import { ContactRepository } from './repositories/ContactRepository.js';
import { ContactService } from './services/ContactService.js';
import { ContactController } from './controllers/ContactController.js';
dotenv.config();
const container = new Container();
// Firebase
container.bind(TYPES.Firestore).toConstantValue(db);
container.bind(TYPES.PostCollectionName).toConstantValue('posts');
container.bind(UserRepository).toSelf();
container.bind(UserService).toSelf();
container.bind(UserController).toSelf();
container.bind(AuthService).toSelf();
container.bind(AuthController).toSelf();
container.bind(TYPES.PostRepository).to(PostRepository);
container.bind(PostService).toSelf();
container.bind(PostController).toSelf();
container.bind(FirebaseAuthService).toSelf();
container.bind(AboutService).toSelf();
container.bind(AboutController).toSelf();
container.bind(FileService).toSelf();
// Contact bindings
container.bind(TYPES.IContactRepository).to(ContactRepository);
container.bind(TYPES.ContactService).to(ContactService);
container.bind(ContactController).toSelf();
// Cloudinary binding
container.bind(TYPES.CloudinaryService).to(CloudinaryService).inSingletonScope();
export { container };
