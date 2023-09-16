import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('wishes')
@UseGuards(JwtGuard)
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async create(@Body() createWishDto: CreateWishDto, @AuthUser() user: User) {
    return this.wishesService.create(createWishDto, user);
  }

  @UseGuards()
  @Get('last')
  async findLast() {
    return this.wishesService.findLast();
  }
  @UseGuards()
  @Get('top')
  async findTop() {
    return this.wishesService.findTop();
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.wishesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    return this.wishesService.update(id, updateWishDto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.delete(id, user.id);
  }

  @Post(':id/copy')
  async copy(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.copy(id, user);
  }
}
