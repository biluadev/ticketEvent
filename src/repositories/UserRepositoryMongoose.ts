import mongoose from 'mongoose'
import { User } from '../entities/User';
import { UserRepository } from './UserRepositories';

const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

const UserModel = mongoose.model('User', userSchema);

class UserRepositoryMongoose implements UserRepository {
    async add(user: User): Promise<User> {
        const userModel = new UserModel(user);

        await userModel.save();
        return user;
    }
}

export { UserRepositoryMongoose };