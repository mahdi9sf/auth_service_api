import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

@Injectable()
export class PasswordService {
  async hash(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  compareToken(token: string, tokenHash: string) {
    const hash = this.hashToken(token);

    return hash == tokenHash;
  }

}
