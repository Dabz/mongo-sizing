import {Component, View, Inject} from "angular2/core";
import {NgIf} from 'angular2/common';
import {ConfigurationComponent} from './app.configuration';
import {NewEntryComponent} from './app.newentry';
import {CollectionComponent} from './app.collection';
import {SizingComponent} from './app.sizing';
import {MongoService, MongoCollection, MongoIndex} from './mongo.service';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/src/common/directives/ng_switch';

@View({
  directives: [ConfigurationComponent, NewEntryComponent, CollectionComponent, SizingComponent, NgSwitch, NgSwitchWhen, NgSwitchDefault, NgIf]
  templateUrl: '/app/app.dashboard.html',
})
@Component({
    selector: 'mdb-dashboard',
    bindings: [MongoService]
})
export class AppDashboard {
  constructor(mongo: MongoService) {
    this.mongo = mongo
    col = new MongoCollection()
    _id = new MongoIndex()
    col.json = {_id: 1, a: 1, b: "test", c: [1, 2, 3]}
    col.name = "test"
    _id.keys = ["_id"]
    _id.json = {_id: 1}
    col.indexes.push(_id)
    mongo.addCollection(col)
  }

  ngAfterViewInit() {
    new Foundation.Accordion($(".accordion"));
    new Foundation.OffCanvas($("#offCanvas"));
    new Foundation.Reveal($('#newEntry'));
  }

  initializeTab() {
    if (this.mongo.collections.length > 0) {
      new Foundation.Tabs($(".tabs"));
    }

    return true;
  }

}
