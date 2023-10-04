import assert from "node:assert";
import * as fsp from "node:fs/promises";
import { EventEmitter } from "node:events";
import { Observable, Subscriber } from "rxjs";
import Listener from ".";

export default class FileListener implements Listener<Uint8Array> {
  private readonly readBuffer = Buffer.alloc(1024);
  private readonly filename: string;
  private fileHandle!: fsp.FileHandle;
  private offset: number = 0;

  constructor(filename: string) {
    this.filename = filename;
  }

  listen(): Observable<Uint8Array> {
    return new Observable(subscriber => {
      this.setupFile()
        .then(() => this.watchFile(subscriber))
        .finally(() => subscriber.complete());
    })
  }

  private async setupFile () {
    this.fileHandle = await fsp.open(this.filename, 'r');
    const stats = await this.fileHandle.stat();
    this.offset = stats.size;
  }

  private async watchFile (subscriber: Subscriber<Uint8Array>) {
    for await (const {} of fsp.watch(this.filename)) {
      await this.readChanges(subscriber);
    }
  }

  private async readChanges (subscriber: Subscriber<Uint8Array>) {
    while (true) {
      const stats = await this.fileHandle.stat();
      const bytesToRead = Math.min(this.readBuffer.byteLength, stats.size);
      assert(
        bytesToRead >= 0,
        `Invalid amount of bytes to read! offset=${this.offset} size=${stats.size}`
      );

      const { bytesRead } = await this.fileHandle.read({
        buffer: this.readBuffer,
        length: bytesToRead,
        position: this.offset
      });

      if (bytesRead === 0) {
        break;
      }

      this.offset += bytesRead;
      subscriber.next(this.readBuffer.subarray(0, bytesRead));
    }
  }
}
