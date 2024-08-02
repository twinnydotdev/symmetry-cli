/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "b4a"

declare module "hyperswarm" {
  import { EventEmitter } from "events";

  export interface Swarm {
    flushed(): Promise<void>;
  }

  export interface JoinOptions {
    client?: boolean;
    server?: boolean;
  }

  export interface SwarmOptions {
    keyPair?: any;
    seed?: Buffer;
    maxPeers?: number;
    firewall?: (remotePublicKey: string) => boolean;
    dht?: any;
    maxConnections: number;
  }

  export default class Hyperswarm extends EventEmitter {
    constructor(opts?: SwarmOptions);
    join(topic: string | Buffer, opts?: JoinOptions): Swarm;
    on: (key: string, cb: (data: any) => void) => void;
    once: (key: string, cb: (data: any) => void) => void;
    flush: () => void;
    leave(topic: Buffer): void;
    destroy(): Promise<void>;
    peers: Map<string, any>;
    connecting: boolean;
  }
}

declare module "hypercore-crypto" {
  const hyperCoreCrypto: {
    keyPair: (seed?: Buffer) => { publicKey: Buffer; secretKey: Buffer };
    discoveryKey: (publicKey: Buffer) => Buffer;
    randomBytes: (n?: number) => Buffer;
    verify: (
      challenge: Buffer,
      signature: Buffer,
      publicKey: Buffer
    ) => boolean;
  };

  export = hyperCoreCrypto;
}
