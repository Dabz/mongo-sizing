import {Component, Input} from 'angular2/core';
import {MongoService} from './mongo.service';
import {MongoCollection, MongoIndex} from './mongo.service';

@Component({
  selector    : 'mdb-sizing',
  templateUrl : '/app/app.sizing.html'
})
export class SizingComponent {
  constructor(mongo: MongoService) {
    this.mongo  = mongo
  }
}
