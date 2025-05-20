// inversify.config.ts
import { Container } from 'inversify';
import { UserService } from './services/UserService';
import { UserRepository } from './repositories/UserRepository';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { AuthService } from './services/AuthService';
import { PostController } from './controllers/PostController';
import { PostService } from './services/PostService';
import { PostRepository } from './repositories/PostRepository';
import { FirebaseAuthService } from './services/FirebaseAuthService';
import { TYPES } from './utils/types';
import { db } from './utils/config';
import * as dotenv from 'dotenv';
import { AboutController } from './controllers/AboutController';
import { AboutService } from './services/AboutService';
import { FileService } from './services/FileService';
import { CloudinaryService } from './services/CloudinaryService';

import { IContactRepository } from './abstracts/interfaces/repositories/IContactRepository';
import { ContactRepository } from './repositories/ContactRepository';
import { ContactService } from './services/ContactService';
import { ContactController } from './controllers/ContactController';
import { IPostRepository } from './abstracts/interfaces/repositories/IPostRepository';


dotenv.config();

const container = new Container();

// Firebase
container.bind(TYPES.Firestore).toConstantValue(db);
container.bind(TYPES.PostCollectionName).toConstantValue('posts');

container.bind<UserRepository>(UserRepository).toSelf();
container.bind<UserService>(UserService).toSelf();
container.bind<UserController>(UserController).toSelf();

container.bind<AuthService>(AuthService).toSelf();
container.bind<AuthController>(AuthController).toSelf();

container.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);
container.bind<PostService>(PostService).toSelf();
container.bind<PostController>(PostController).toSelf();

container.bind<FirebaseAuthService>(FirebaseAuthService).toSelf();

container.bind<AboutService>(AboutService).toSelf();
container.bind<AboutController>(AboutController).toSelf();

container.bind<FileService>(FileService).toSelf();

// Contact bindings
container.bind<IContactRepository>(TYPES.IContactRepository).to(ContactRepository);
container.bind<ContactService>(TYPES.ContactService).to(ContactService);
container.bind<ContactController>(ContactController).toSelf();

// Cloudinary binding
container.bind<CloudinaryService>(TYPES.CloudinaryService).to(CloudinaryService).inSingletonScope();

export { container };
