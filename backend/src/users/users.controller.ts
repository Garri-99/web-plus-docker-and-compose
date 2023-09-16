import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from './entities/user.entity';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('find')
  find(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }

  @Get('me')
  getOwnProfile(@AuthUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Get(':username')
  getUserProfile(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Patch('me')
  updateOwnProfile(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Get('me/wishes')
  async getOwnUserWishes(@AuthUser() user: User) {
    return this.usersService.findUserWishes(user.id);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);

    return this.usersService.findUserWishes(user.id);
  }
}
