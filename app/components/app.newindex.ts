import {Component, Input} from 'angular2/core';
import {MongoService} from '/app/services/mongo.service';
import {MongoCollection} from '/app/services/collection.service';
import {MongoIndex} from '/app/services/index.service';

@Component({
    selector: 'mdb-newindex',
    templateUrl: '/app/templates/app.newindex.html'
})
export class NewIndexComponent {
  private key: string;
  @Input('collection')
  private collection: MongoCollection;


  constructor(mongo: MongoService) {
    this.mongo = mongo
  }

  public save() {
    let index = new MongoIndex
    try {
      index.json = rj.parse(this.key)
    } catch (e) {
      alert(e);
      return;
    }
    index.keys = []
    for (let attr in index.json) {
      index.keys.push(attr)
    }

    this.collection.indexes.push(index)
    this.mongo.compute()
  }
}
