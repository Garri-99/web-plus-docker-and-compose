import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository, In, DataSource } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/users/entities/user.entity';
import queryRunner from 'src/common/helpers/queryRunner';

@UseGuards(JwtGuard)
@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createWishDto: CreateWishDto, user: User) {
    await this.checkUniq(createWishDto, user);

    const newWish = this.wishRepository.create({
      ...createWishDto,
      owner: user,
    });

    return this.wishRepository.save(newWish);
  }

  async checkUniq(createWishDto: CreateWishDto, user: User) {
    const { name, price, link } = createWishDto;

    const wish = await this.wishRepository.findOne({
      where: { name, price, link, owner: { id: user.id } },
    });

    if (wish) {
      throw new ForbiddenException();
    }

    return;
  }

  async findLast() {
    return this.wishRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async findTop() {
    return this.wishRepository.find({
      order: {
        copied: 'DESC',
      },
      take: 10,
    });
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: { user: true },
      },
    });

    if (!wish) {
      throw new NotFoundException();
    }

    return wish;
  }

  async findMany(wishesIds: number[]) {
    return this.wishRepository.find({ where: { id: In(wishesIds) } });
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.findOne(id);

    if (userId !== wish.owner.id) {
      throw new ForbiddenException();
    }

    if (wish.raised && updateWishDto.price > 0) {
      throw new ForbiddenException();
    }

    return this.wishRepository.update({ id }, updateWishDto);
  }

  async updateRaised(id: number, raised: number) {
    return this.wishRepository.update({ id }, { raised });
  }

  async delete(id: number, userId: number) {
    const wish = await this.findOne(id);

    if (userId !== wish.owner.id) {
      throw new ForbiddenException();
    }

    return this.wishRepository.delete(id);
  }

  async copy(id: number, user: User) {
    const wish = await this.wishRepository.findOneBy({ id });

    if (!wish) {
      throw new NotFoundException();
    }

    await this.checkUniq(wish, user);

    const { name, link, image, price, description } = wish;

    const copiedWish = this.wishRepository.create({
      name,
      link,
      image,
      price,
      description,
      owner: user,
    });

    await queryRunner(this.dataSource, [
      this.wishRepository.update({ id: wish.id }, { copied: ++wish.copied }),
      this.wishRepository.save(copiedWish),
    ]);

    return copiedWish;
  }
}
