import {Component, Input} from 'angular2/core';
import {MongoService} from '/app/services/mongo.service';
import {MongoCollection} from '/app/services/collection.service';
import {MongoIndex} from '/app/services/index.service';

@Component({
  selector    : 'mdb-sizing',
  templateUrl : '/app/templates/app.sizing.html'
})
export class SizingComponent {
  constructor(mongo: MongoService) {
    this.mongo  = mongo
  }
}
