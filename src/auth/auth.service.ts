import { Injectable, UnauthorizedException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces/user.interface';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ name: string; id: unknown }> {
    const { name, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      name,
      password: hashedPassword,
    });
    return { name: user.name, id: user._id };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ name: string; token: string; id: unknown }> {
    const { name, password } = loginDto;
    const user = await this.userModel.findOne({ name });

    const isSamePass = await bcrypt.compare(password, user?.password);

    if (!user || !isSamePass) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { name, sub: user._id };
    const token = this.jwtService.sign(payload);
    return { name: user.name, token, id: user._id };
  }

  async getUsers() {
    return await this.userModel.find().exec();
  }
}
