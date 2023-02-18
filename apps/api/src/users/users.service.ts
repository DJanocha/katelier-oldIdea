import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findOne({ email }: { email: string }): Promise<UserEntity> {
    return await this.prisma.user.findFirst({ where: { email } });
  }
  async create(createUserInput: CreateUserDto) {
    const { passwordConfirm, ...result } = createUserInput;
    return await this.prisma.user.create({
      data: { ...result, role: 'CLIENT' },
    });
  }
}
