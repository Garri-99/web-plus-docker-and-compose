import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, owner: User) {
    const items = await this.wishesService.findMany(createWishlistDto.itemsId);

    if (!items.length) {
      throw new NotFoundException();
    }

    const newWishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      items,
      owner,
    });

    return this.wishlistRepository.save(newWishlist);
  }

  async findAll() {
    return this.wishlistRepository.find({
      relations: { owner: true, items: true },
    });
  }

  async findOne(id: number) {
    return this.wishlistRepository.findOne({
      where: { id },
      relations: { items: true, owner: true },
    });
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wish = await this.findOne(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException();
    }

    return this.wishlistRepository.update(id, updateWishlistDto);
  }

  async removeOne(id: number, userId: number) {
    const wish = await this.findOne(id);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException();
    }

    return this.wishlistRepository.delete(id);
  }
}
