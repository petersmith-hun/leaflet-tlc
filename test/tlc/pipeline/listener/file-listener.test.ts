import Sinon from "sinon";
import * as fsp from "node:fs/promises";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as path from "node:path";
import FileListener from "@app/pipeline/listener/file-listener";

describe("Unit tests for FileListener", () => {
  let testFilePath: string;
  let testFile: fsp.FileHandle;
  let fileListener: FileListener;

  beforeEach(async () => {
    testFilePath = path.join(
      os.tmpdir(),
      crypto.randomBytes(16).toString('hex')
    );

    testFile = await fsp.open(testFilePath, 'w');

    fileListener = new FileListener(testFilePath);
  });

  it("should report added lines", async () => {
    // given
    const observable = fileListener.listen();
    const data = Buffer.from('foo\n', 'utf8');
    const subscriber = Sinon.mock();
    const subscription = observable.subscribe(subscriber);

    // when
    await testFile.write(data);

    // then
    expect(subscriber.calledOnceWith(data));
    expect(subscription.closed).toBe(false);
  });

  afterEach(async () => {
    await testFile.close();
    await fsp.rm(testFilePath);
  });
})

