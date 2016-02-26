import {MongoService, toBson, serializeAttribute, deserializeAttribute} from '/app/services//mongo.service';
import {MongoCollection} from '/app/services/collection.service';

export class MongoIndex {
  public json: Object;
  public keys: string[];
  public averageKeySize: int;
  public dataSize: int;
  public storageSize: int;


  /**
   ** @brief return a value with a key "mongo style" (e.g: "doc.subdoc.array.a")
   */
  private getValue(doc: Object, key: string) {
    if (doc == undefined || typeof doc != 'object' || key === "") {
      return doc
    }
    if (doc.length != undefined) {
      let res = []
      for (let i in doc) {
        res.push(this.getValue(doc[i], key))
      }
      return res
    } else {
      let parts = key.split('.')
      if (parts.length >= 1) {
        doc = this.getValue(doc[parts[0]], parts.slice(1).join('.'))
      }
      return doc
    }
  }

  /**
   ** @brief compute the size of the index
   ** For wiredTiger:
   **   - Index use prefix compression
   **   - Index doesn't save field name
   ** For MMAPV1:
   **   - To be determined, currently assuming that the key is BSON
   */
  public compute(col: MongoCollection, service: MongoService) {
    let sampleindex_inmemory = {}
    let fied_size = 0
    for (let i in this.keys) {
      let key = this.keys[i]
      fied_size = fied_size + key.length /* \0 char & type character */
      sampleindex_inmemory[key] = this.getValue(col.json, key)
    }
    sampleindex_inmemory.toBSON = toBson
    this.averageKeySize = bson().BSON.calculateObjectSize(sampleindex_inmemory)

    if (service.engine === "wiredTiger") {
      this.averageKeySizeOnDisk = this.averageKeySize - fied_size // removing field names
      this.averageKeySizeOnDisk = this.averageKeySizeOnDisk / 1.5 // prefix compression
      this.dataSize = (this.averageKeySizeOnDisk) * col.numberOfDocument *  0.05 // internal node
      this.dataSize += (this.averageKeySizeOnDisk) * col.numberOfDocument / 1.5 // leaf node
      this.storageSize = this.dataSize // no index block compression
      this.memoryRequirement = this.storageSize // same format as on disk
    } else {
      this.dataSize = (this.averageKeySize + 8 + 4) * 0.05 * col.numberOfDocument // internal node
      this.dataSize += (this.averageKeySize + 8 + 4) * col.numberOfDocument // leaf node
      this.storageSize = this.dataSize
      this.memoryRequirement = this.dataSize
    }
  }


  public serialize() {
    let res = {}
    let toSave = ['keys', 'json']

    for (let attr in  this) {
      if (toSave.indexOf(attr) != -1) {
        res[attr] = serializeAttribute(this[attr])
      }
    }

    return res
  }


  public deserialize(object) {
    let toSave = ['keys', 'json']

    for (let attr in  object) {
      if (toSave.indexOf(attr) != -1) {
        this[attr] = deserializeAttribute(object[attr])
      }
    }
}

