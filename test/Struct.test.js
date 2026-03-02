'use strict';

const assert = require('assert');
const { DataTypes, Struct } = require('..');

const TestStruct = Struct('TestStruct', {
  field1: DataTypes.string,
  field2: DataTypes.uint16,
  field3: DataTypes.enum8({
    opt1: 1,
    opt2: 2,
    opt3: 3,
  }),
  field4: DataTypes.Array8(DataTypes.uint16),
  field5: DataTypes.map8('bit1', 'bit2', 'bit3'),
  field6: DataTypes.map16('bit1', 'bit2', 'bit3', 'bit4', 'bit5', 'bit6', 'bit7', 'bit8', 'bit9'),
});

const testData = {
  field1: 'test',
  field2: 500,
  field3: 'opt3',
  field4: [1, 2, 3, 4],
  field5: ['bit2'],
  field6: ['bit2', 'bit9'],
};

const data = new TestStruct(testData);
const dataBuf = data.toBuffer();

describe('Struct', function() {
  it('should parse test data to buffer', function() {
    assert(dataBuf.equals(Buffer.from('0474657374f40103040100020003000400020201', 'hex')));
  });
  it('should encode missing fields with default values by default', function() {
    const S = Struct('DefaultMissing', {
      a: DataTypes.uint8,
      b: DataTypes.uint8,
    });
    const instance = new S({ a: 42 });
    const buf = instance.toBuffer();

    // Both fields encoded: a=42, b=0 (default)
    assert.equal(buf.length, 2);
    assert.equal(buf[0], 42);
    assert.equal(buf[1], 0);
  });
  it('should skip missing fields when encodeMissingFieldsBehavior is skip', function() {
    const S = Struct('SkipMissing', {
      a: DataTypes.uint8,
      b: DataTypes.uint8,
      c: DataTypes.uint8,
    }, { encodeMissingFieldsBehavior: 'skip' });
    const instance = new S({ a: 10, c: 30 });

    // In 'skip' mode, missing fields should remain unset
    assert.strictEqual(instance.b, undefined);

    const buf = instance.toBuffer();
    assert.equal(buf.length, 2);
    assert.equal(buf[0], 10);
    assert.equal(buf[1], 30);
  });
  it('should produce identical output with skip option when all fields provided', function() {
    const defsA = { a: DataTypes.uint8, b: DataTypes.uint8 };
    const defsB = { a: DataTypes.uint8, b: DataTypes.uint8 };
    const Default = Struct('AllFieldsDefault', defsA);
    const Skip = Struct('AllFieldsSkip', defsB, { encodeMissingFieldsBehavior: 'skip' });
    const d = new Default({ a: 1, b: 2 });
    const s = new Skip({ a: 1, b: 2 });
    assert(d.toBuffer().equals(s.toBuffer()));
  });
  it('should parse test data from buffer', function() {
    const refData = TestStruct.fromBuffer(dataBuf);

    assert.equal(refData.field1, testData.field1);
    assert.equal(refData.field2, testData.field2);
    assert.equal(refData.field3, testData.field3);
    assert.deepEqual(refData.field4, testData.field4);
    assert(refData.field5.bit2);
    assert.deepEqual(refData.field5.toArray(), ['bit2']);
    assert(refData.field6.bit2);
    assert(refData.field6.bit9);
    assert.deepEqual(refData.field6.toArray(), ['bit2', 'bit9']);
  });
});
