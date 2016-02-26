import {Component} from 'angular2/core';
import {MongoService} from './mongo.service';
import {MongoCollection, MongoIndex} from './mongo.service';

@Component({
    selector: 'mdb-newentry',
    templateUrl: '/app/app.newentry.html'
})
export class NewEntryComponent {
  private json: string;
  private indexes: string;
  private name: string;

  constructor(mongo: MongoService) {
    this.mongo = mongo
  }

  public save() {
    try {
      this.json = this.json.replace(/ObjectId\(.*?\)/g, '"objectd"').replace(/ISODate\(.*?\)/, '12311551')
      this.json = this.json.replace(/Timestamp\(.*?\)/, '1234151').replace(/new\s+Date\(.*?\)/g, '1235151')
      jsonparsed = rj.parse(this.json)
      if (jsonparsed._id === undefined) {
        jsonparsed = jQuery.extend({_id: "__objectd__"}, jsonparsed)
        /* ObjectID is 12 Bytes, creating a 12 bytes field */
      }
    } catch (e) {
      alert(e);
      return;
    }

    col = new MongoCollection()
    col.json = jsonparsed
    col.name = this.name

    idx = this.indexes.split(';')
    found_id = false
    for (key in idx) {
      try {
        index = new MongoIndex()
        ji = rj.parse(idx[key])
        index.json = ji
        index.keys = []
        for (attr in ji) {
          index.keys.push(attr)
        }
      } catch(e) {
        alert(e)
        return
      }

      if (index.json._id != undefined) {
        found_id = true
      }
      col.indexes.push(index)
    }
    if (!found_id) {
      index = new MongoIndex()
      index.json = rj.parse("{_id: 1}")
      index.keys = ["_id"]
      col.indexes.push(index)
    }

    this.mongo.addCollection(col)
    $('.reveal').foundation('close')
  }
}
