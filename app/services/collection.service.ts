import {MongoService, toBson, serializeAttribute, deserializeAttribute} from '/app/services//mongo.service';
import {MongoIndex} from '/app/services/index.service';

export class MongoCollection {
  public name: string;
  public db: string = "test";
  public json: Object;
  public averageDocumentSize: int = 0;
  public _numberOfDocument: int = 1;
  public _numberOfDocumentInMemory: int = 1;
  public queryPerSeconds: int = 100;
  public writePerSeconds: int = 10;
  public dataSize: int;
  public storageSize: int;
  public indexes: MongoIndex[];

  constructor() {
    this.indexes = []
  }

  /**
   ** @brief compute the size of a collection
   ** For wiredTiger, appropriate block compression is used
   */
  public compute(service: MongoService) {
    this.json.toBSON = toBson

    // computing averageDocumentSize
    if (service.engine === "wiredTiger") {
      this.averageDocumentSize = bson().BSON.calculateObjectSize(this.json)
    } else {
      this.averageDocumentSize = service.getPaddedSize(bson().BSON.calculateObjectSize(this.json))
    }
    var col = this
    this.indexes.forEach(function(index) {
      index.compute(col, service)
    });

    this.dataSize = (this.numberOfDocument * this.averageDocumentSize)
    this.indexSize = this.indexes.map(function(index) { return index.dataSize}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue;
    });
    this.memoryRequirement = this.indexes.map(function(index) { return index.memoryRequirement}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue
    });
    this.indexStorageSize = this.indexes.map(function(index) { return index.dataSize}).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue;
    });

    if (service.engine === "wiredTiger") {
      this.storageSize = service.getCompressedSize(this.dataSize)
    } else {
      this.storageSize = this.dataSize * 1.05 // small overhead for MMAPv1
    }

    this.totalStorageSize = this.storageSize + this.indexStorageSize
    this.memoryRequirement += this.numberOfDocumentInMemory * this.averageDocumentSize
  }

  public validate() {
  }


  public removeIndex(json) {
    if (JSON.stringify(json) == '{"_id":1}') {
      alert("Can not delete _id index")
      return;
    }
    let newIndexes = []
    for (let i in this.indexes) {
      if (this.indexes[i].json !== json) {
        newIndexes.push(this.indexes[i])
      }
    }
    this.indexes = newIndexes
  }


  public serialize() {
    let res = {}
    let toSave = ['indexes', 'json', 'name', 'db', '_numberOfDocument', '_numberOfDocumentInMemory']

    for (let attr in  this) {
      if (toSave.indexOf(attr) != -1) {
        res[attr] = serializeAttribute(this[attr])
      }
    }

    return res
  }


  public deserialize(object) {
    let toSave = ['json', 'name', 'db', '_numberOfDocument', '_numberOfDocumentInMemory']

    for (let attr in  object) {
      if (toSave.indexOf(attr) != -1) {
        this[attr] = deserializeAttribute(object[attr])
      }
    }

    for (let i in object.indexes) {
      let index = new MongoIndex()
      index.deserialize(object.indexes[i])
      this.indexes.push(index)
    }
  }

  get numberOfDocument() {
    return this._numberOfDocument;
  }
  set numberOfDocument(n) {
    this._numberOfDocument = n
    this.compute(this.service)
  }
  get numberOfDocumentInMemory() {
    return this._numberOfDocumentInMemory
  }
  set numberOfDocumentInMemory(n) {
    this._numberOfDocumentInMemory = n
    this.compute(this.service)
  }


}

