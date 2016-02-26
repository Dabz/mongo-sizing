export class MongoIndex {
  public json: Object;
  public keys: string[];
  public averageKeySize: int;
  public dataSize: int;
  public storageSize: int;

  private getValue(doc: Object, key: string) {
    parts = key.split('.')
    for (i in parts) {
      part = parts[i]
      doc = doc[part]
    }

    return doc
  }

  public compute(col: MongoCollection, service: MongoService) {
    sampleindex = {}
    for (i in this.keys) {
      key = this.keys[i]
      sampleindex[key] = this.getValue(col.json, key)
    }
    this.averageKeySize = bson().BSON.calculateObjectSize(sampleindex) - 5 // removing docs header

    if (service.engine === "wiredTiger") {
      this.dataSize = (this.averageKeySize + 8) * col.numberOfDocument *  0.1 // internal node
      this.dataSize += (this.averageKeySize + 8)  * col.numberOfDocument // leaf node
      this.storageSize = service.getCompressedSize(this.dataSize)
      this.memoryRequirement = (this.averageKeySize) * col.numberOfDocument * 1.1 // huffman compression
    } else {
      this.dataSize = (this.averageKeySize + 8 + 4) * 0.1 * col.numberOfDocument // internal node
      this.dataSize += (this.averageKeySize + 8 + 4) * col.numberOfDocument // leaf node
      this.storageSize = this.dataSize
      this.memoryRequirement = this.dataSize
    }
  }
}

export class MongoCollection {
  public name: string;
  public db: string = "test";
  public json: Object;
  public averageDocumentSize: int = 0;
  public numberOfDocument: int = 1;
  public numberOfDocumentInMemory: int = 1;
  public queryPerSeconds: int = 100;
  public writePerSeconds: int = 10;
  public dataSize: int;
  public storageSize: int;
  public indexes: MongoIndex[];

  constructor() {
    this.indexes = []
  }

  public compute(service: MongoService) {
    this.averageDocumentSize = bson().BSON.calculateObjectSize(this.json)
    col = this
    this.indexes.forEach(function(index) {
      index.compute(col, service)
    });

    this.dataSize = (this.numberOfDocument * this.averageDocumentSize)
    this.indexSize = this.indexes.map(function(index) { return index.dataSize}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue;
    });
    if (service.engine === "wiredTiger") {
      this.storageSize = service.getCompressedSize(this.dataSize)
    } else {
      this.storageSize = service.getPaddedSize(this.averageDocumentSize) * this.numberOfDocument
    }

    this.memoryRequirement = this.indexes.map(function(index) { return index.memoryRequirement}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    });
    this.memoryRequirement += this.numberOfDocumentInMemory * this.averageDocumentSize
  }

  public validate() {
    for (attr in this.json) {
      if (! isNaN(this.json[attr])) {
        this.json[attr] = bson().Long.fromNumber(this.json[attr])
      }
    }
  }
}

export class MongoService {
  public shards: int;
  public engine: string;
  public compression: string;
  public oplog: int;
  public collections: Observable<Array<MongoCollection>>;

  constructor() {
    this.engine = "wiredTiger"
    this.compression = "snappy"
    this.collections = []
    this.shards = 1
    this.oplog = 50
    this.compute()
  }

  public addCollection(col: MongoCollection) {
    col.validate()
    this.collections.push(col)
    this.compute()
  }

 public compute() {
   service = this
    this.collections.forEach(function(col) {
      col.compute(service)
    });
    this.storageSize = this.collections.map(function(col) { return col.storageSize}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    }, 0)
    this.dataSize = this.collections.map(function(col) { return col.dataSize}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    }, 0)
    this.indexSize = this.collections.map(function(col) { return col.indexSize}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    }, 0)
    this.memoryRequirement = this.collections.map(function(col) { return col.memoryRequirement}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    }, 0)
    this.numberOfIndexes = this.collections.map(function(col) { return col.indexes.length}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    }, 0)
    this.numberOfDocument = this.collections.map(function(col) { return col.numberOfDocument}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    }, 0)
  }

  public formatSize(size: int) {
    if (size < 1024) {
      return (Number(size).toFixed(0)) + " bytes"
    }
    if (size < (1024 * 1024)) {
      return Number(((size / 1024))).toFixed(2) + " kbytes"
    }
    if (size < (1024 * 1024 * 1024)) {
      return Number(((size / (1024 * 1024)))).toFixed(2) + " mbytes"
    }
    if (size < (1024 * 1024 * 1024 * 1024)) {
      return Number(((size / (1024 * 1024 * 1024)))).toFixed(2) + " gbytes"
    }
    return Number(((size / (1024 * 1024 * 1024) * 1024))).toFixed(2) + " tbytes"
  }

  public getPaddedSize(size: int) {
    if (size < (2 * 1024 * 1024)) { //
      return Math.pow(2 ,(Math.log2(size) | 0) + 1) | 0
    } else {
      return (((size / (2 * 1024 * 1024)) | 0) + 1) * (2 * 1024 * 1024) | 0
    }
  }

  public getCompressedSize(size: int) {
    if (this.compression == "snappy") { return Number(Number(size / 3).toFixed(0)) }
    else if (this.compression == "zlib") { return Number(Number(size / 4).toFixed(0)) }
    else { return Number(Number(size * 1.1).toFixed(0)) }
  }

  public getShards() {
    res = [];
    for (i = 0; i < this.shards; i++) {
      res.push({id: i})
    }
    return res;
  }
}

