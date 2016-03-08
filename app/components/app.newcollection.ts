import {Component} from 'angular2/core';
import {MongoService} from '/app/services/mongo.service';
import {MongoCollection} from '/app/services/collection.service';
import {MongoIndex} from '/app/services/index.service';

@Component({
    selector: 'mdb-newentry',
    templateUrl: '/app/templates/app.newcollection.html'
})
export class NewCollectionComponent {
  private json: string;
  private indexes: string;
  private name: string;

  constructor(mongo: MongoService) {
    this.mongo = mongo
  }

  public save() {
    this.name = this.name.replace('.', '-')
    this.name = this.name.replace(' ', '-')

    for (let i in this.mongo.collections) {
      if (this.mongo.collections[i].name == this.name) {
        alert ("Already containing a collection with name: " + this.name);
        return;
      }
    }

    try {
      this.json = this.json.replace(/ObjectId\(.*?\)/g, '"$id"').replace(/ISODate\(.*?\)/, '"$date"')
      this.json = this.json.replace(/Timestamp\(.*?\)/, '$timestamp').replace(/new\s+Date\(.*?\)/g, '$date')
      this.json = this.json.replace(/NumberLong\(.*?\)/, '1')

      let jsonparsed = RJSON.parse(this.json)
      if (jsonparsed._id === undefined) {
        jsonparsed = jQuery.extend({_id: "$id"}, jsonparsed)
      }
    } catch (e) {
      alert(e);
      return;
    }

    let col = new MongoCollection()
    col.json = jsonparsed
    col.name = this.name

    let idx = this.indexes.split(';')
    let found_id = false
    for (let key in idx) {
      try {
        if (idx[key] == "") {
          continue
        }
        let index = new MongoIndex()
        let ji = RJSON.parse(idx[key])
        index.json = ji
        index.keys = []
        for (let attr in ji) {
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
      let index = new MongoIndex()
      index.json = {_id: 1}
      index.keys = ["_id"]
      col.indexes.push(index)
    }

    this.mongo.addCollection(col)
    $('.reveal').foundation('close')

    setTimeout(function() {
      new Foundation.Tabs($('.tabs'))
      $(document).foundation()
    }, 20)
  }
}
