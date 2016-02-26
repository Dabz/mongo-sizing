import {Component} from 'angular2/core';
import {MongoService} from './mongo.service';

@Component({
    selector: 'mdb-configuration',
    templateUrl: '/app/app.configuration.html'
})
export class ConfigurationComponent {
  compressions: string[] =  ["snappy", "zlib", "none"]
  engines: string[] = ["wiredTiger", "mmapv1"]
  shards: int = 1
  oplog: int = 50

  constructor(mongo: MongoService) {
    this.mongo = mongo
  }
}
