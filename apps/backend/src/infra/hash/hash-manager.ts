import { randomUUID } from 'node:crypto';

import { IRandomGeneratorHash } from '.';

export class HashManager implements IRandomGeneratorHash {
  generateRandomHash(): string {
    return randomUUID();
  }
}
