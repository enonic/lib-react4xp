import type {ByteSource, Resource as ResourceInterface} from '@enonic-types/lib-io';

export class Resource
	implements ResourceInterface {
	private readonly _bytes: string; // ByteSource
	private readonly _exists: boolean;
	private readonly _key: string;
	private readonly _size: number; // ResourceKey
	private readonly _timestamp: number;

	constructor({
	  bytes,
	  exists,
	  key,
	  size,
	  timestamp,
	}: {
	  bytes: string
	  exists: boolean
	  key: string
	  size: number
	  timestamp: number
	}) {
	  this._bytes = bytes;
	  this._exists = exists;
	  this._key = key;
	  this._size = size;
	  this._timestamp = timestamp;
	}

	public exists(): boolean {
	  return this._exists;
	}

	/* coverage ignore start */
	public getBytes(): string {
	  return this._bytes;
	}

	public getSize(): number {
	  return this._size;
	}
	/* coverage ignore end */

	public getStream(): ByteSource {
	  // throw new Error(`getStream called key:${JSON.stringify(this._key, null, 4)}`);
	  return this._bytes as unknown as ByteSource;
	}

	/* coverage ignore start */
	public getTimestamp(): number {
	  return this._timestamp;
	}
	/* coverage ignore end */

	public readString(): string {
	  return this._bytes;
	}
  }
