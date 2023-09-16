import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { DataSource, Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';
import queryRunner from 'src/common/helpers/queryRunner';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const { amount, hidden, itemId } = createOfferDto;

    const item = await this.wishesService.findOne(itemId);

    if (item.owner.id === user.id) {
      throw new ForbiddenException();
    }

    const raised = Number(item.raised) + Number(amount);

    if (raised > item.price) {
      throw new ForbiddenException();
    }

    const newOffer = this.offerRepository.create({
      amount,
      hidden,
      user,
      item,
    });

    await queryRunner(this.dataSource, [
      this.wishesService.updateRaised(itemId, raised),
      this.offerRepository.save(newOffer),
    ]);

    return newOffer;
  }

  async findAll() {
    return this.offerRepository.find({ relations: { user: true, item: true } });
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: { user: true, item: true },
    });

    if (!offer) {
      throw new NotFoundException();
    }

    return offer;
  }
}
