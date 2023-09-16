import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  constructor(private readonly configService: ConfigService) {}

  async generateHash(password: string) {
    return await bcrypt.hash(
      password,
      this.configService.get<number>('hash.salt'),
    );
  }

  async verifyHash(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
