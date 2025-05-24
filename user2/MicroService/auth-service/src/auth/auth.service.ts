import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(userData: any) {
    const hashed = await bcrypt.hash(userData.password, 10);
    const user = new this.userModel({ ...userData, password: hashed });
    await user.save();
    return { message: 'User registered' };
  }

  async login({ username, password }: any) {
    const user = await this.userModel.findOne({ username });
    if (!user) return { message: 'User not found' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { message: 'Wrong password' };

    const token = this.jwtService.sign({ username });
    return { access_token: token };
  }
}
