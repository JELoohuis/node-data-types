declare module "@athombv/data-types" {
  class DataType<Value> {
    id: number;
    shortName: string;
    length: number;
    toBuffer: (buffer: Buffer, value: Value, index?: number) => number;
    fromBuffer: (buffer: Buffer, index?: number) => Value;
    args: Array<unknown>;
    defaultValue: Value;

    get isAnalog(): boolean;
    inspect(): string;
  }

  const DataTypes: {
    noData: DataType<null>,

    data8 : DataType<number>,
    data16: DataType<number>,
    data24: DataType<number>,
    data32: DataType<number>,
    data40: DataType<number>,
    data48: DataType<number>,
    data56: DataType<number>,

    bool: DataType<boolean>,

    map8 : <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map16: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map24: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map32: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map40: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map48: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map56: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    map64: <Flags extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,

    uint8 : DataType<number>,
    uint16: DataType<number>,
    uint24: DataType<number>,
    uint32: DataType<number>,
    uint40: DataType<number>,
    uint48: DataType<number>,
    // uint56: DataType<number>,
    // uint64: DataType<number>,

    int8 : DataType<number>,
    int16: DataType<number>,
    int24: DataType<number>,
    int32: DataType<number>,
    int40: DataType<number>,
    int48: DataType<number>,
    // int56: DataType<number>,
    // int64: DataType<number>,

    enum8 : <Flags extends string>(flags: Record<Flags, number>) => DataType<Flags>,
    enum16: <Flags extends string>(flags: Record<Flags, number>) => DataType<Flags>,
    enum32: <Flags extends string>(flags: Record<Flags, number>) => DataType<Flags>,

    // semi: DataType<number>,
    single: DataType<number>,
    double: DataType<number>,

    octstr: DataType<string>,
    string: DataType<string>,
    // octstr16: DataType<string>,
    // string16: DataType<string>,

    // array
    // struct
    // set
    // bag

    // ToD
    // date
    // UTC

    // clusterId
    // attribId

    // bacOID
    EUI48 : DataType<string>,
    EUI64 : DataType<string>,
    key128: DataType<string>,

    //* Internal Types *//
    map4 : <Flags  extends string | null>(flags: Array<Flags>) => DataType<BitMap<Flags>>,
    uint4: DataType<number>,
    enum4: <Flags extends string>(flags: Record<Flags, number>) => DataType<Flags>,

    buffer  : DataType<Buffer>,
    buffer8 : DataType<Buffer>,
    buffer16: DataType<Buffer>,

    Array0: <Type>(type: Type) => DataType<Array<Type>>,
    Array8: <Type>(type: Type) => DataType<Array<Type>>,
    FixedString: (length: number) => DataType<string>,
  };

  class BitMap<Flags extends string | null> {
    _buffer: Buffer;
    _fields: Array<Flags>;
    setBit(index: number, value: boolean): void;
    getBit(index: number): boolean;
    clearBit(index: number): void;
    setBits(bits: number | Array<Flags>): void;
    getBits(): Array<Flags>;
    get length(): number;
    static fromBuffer<Flags extends string | null>(buffer: Buffer, index: number, length: number, flags: Array<Flags>): BitMap<Flags>;
    static toBuffer<Flags extends string | null>(buffer: Buffer, index: number, length: number, flags: Array<Flags>, value: number): number;
    static toBuffer<Flags extends string | null>(buffer: Buffer, index: number, length: number, flags: Array<Flags> | undefined, value: BitMap<Flags>): number;
    toArray(): Array<Flags>;
    toBuffer(buffer: Buffer, index: number): Buffer;
    copy(): BitMap<Flags>;
    toJSON(): object;
    inspect(): string;
  }

  interface StaticStruct<Defs extends Record<string, DataType<any>>> {
    get fields(): Defs;
    get name(): string;
    get length(): number;
    fromJSON(props: any): StructInstance<Defs>;
    fromArgs(...args: Array<unknown>): StructInstance<Defs>;
    fromBuffer(buffer: Buffer, index?: number, returnLength?: false): StructInstance<Defs>;
    fromBuffer(buffer: Buffer, index?: number, returnLength?: true): {
      result: StructInstance<Defs>,
      length: number,
    }
    toBuffer(buffer: Buffer, value: StructInstance<Defs>, index?: number): number;
  }

  type StructInstance<Defs extends Record<string, import('@athombv/data-types').DataType<any>>> = StructProperties<Defs> & {
    toJSON: () => StructProperties<Defs>;
    toBuffer: (buffer: Buffer, index?: number) => Buffer;
  }

  function Struct<Defs extends Record<string, DataType<any>>> (name: string, defs: Defs, opts?: {encodeMissingFieldsBehavior?: 'default' | 'skip'}): StaticStruct<Defs>;
}

type StructProperties<Defs extends Record<string, import('@athombv/data-types').DataType<any>>> = {
  [Property in keyof Defs]: Defs[Property] extends import('@athombv/data-types').DataType<infer Type> ? Type : never
}


/*
How to use @athombv/data-types in TypeScript:

// Create a type that represents the Struct data
const ZdoEndDeviceAnnounceIndication = {
  srcAddr: DataTypes.uint16,
  IEEEAddr: DataTypes.EUI64,
};

// Create a Struct instance with generic type ZdoEndDeviceAnnounceIndication
const ZdoEndDeviceAnnounceIndicationStruct = Struct("ZdoEndDeviceAnnounceIndication", ZdoEndDeviceAnnounceIndication);

// Create ZdoEndDeviceAnnounceIndication object
const ZdoEndDeviceAnnounceObject = ZdoEndDeviceAnnounceIndicationStruct.fromBuffer(
  Buffer.from([0, 1, 2, 3])
);

ZdoEndDeviceAnnounceObject.srcAddr.trim(); // This errors, srcAddr is not a string

// Create Buffer instance from ZdoEndDeviceAnnounceObject
const ZdoEndDeviceAnnounceBuffer = Buffer.alloc(8);
ZdoEndDeviceAnnounceIndicationStruct.toBuffer(ZdoEndDeviceAnnounceBuffer, { srcAddr: 1, IEEAddr: 'abc' }); // This errors due to typo in IEEEAddr name

Known limitations:
- Structs in Structs are considered a no-go by these definitions.
- Struct.fromArgs cannot be typed.
*/
