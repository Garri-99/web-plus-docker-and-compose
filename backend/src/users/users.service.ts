import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashService } from 'src/hash/hash.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    @InjectRepository(Wish) private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const password = await this.hashService.generateHash(
      createUserDto.password,
    );

    const newUser = this.userRepository.create({
      ...createUserDto,
      password,
    });

    return this.userRepository.save(newUser);
  }

  async findByUsername(username: string) {
    return await this.userRepository.findOneBy({ username });
  }

  async findById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findMany(query: string): Promise<User[]> {
    return this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.generateHash(
        updateUserDto.password,
      );
    }

    await this.userRepository.update({ id }, updateUserDto);

    return this.userRepository.findOneBy({ id });
  }

  async findUserWishes(id: number) {
    return this.wishRepository.find({
      where: { owner: { id } },
      relations: {
        offers: true,
        owner: true,
      },
    });
  }
}
