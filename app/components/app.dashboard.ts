import {Component, View, Inject} from "angular2/core";
import {NgIf} from 'angular2/common';
import {ConfigurationComponent} from '/app/components/app.configuration';
import {NewCollectionComponent} from '/app/components/app.newcollection';
import {CollectionComponent} from '/app/components/app.collection';
import {SizingComponent} from '/app/components/app.sizing';
import {MongoService} from '/app/services/mongo.service';
import {MongoCollection} from '/app/services/collection.service';
import {MongoIndex} from '/app/services/index.service';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/src/common/directives/ng_switch';

@View({
  directives: [ConfigurationComponent, NewCollectionComponent, CollectionComponent, SizingComponent, NgSwitch, NgSwitchWhen, NgSwitchDefault, NgIf],
  templateUrl: '/app/templates/app.dashboard.html',
})
@Component({
    selector: 'mdb-dashboard',
    bindings: [MongoService]
})
export class AppDashboard {
  constructor(mongo: MongoService) {
    this.mongo = mongo
    /*var col = new MongoCollection()
    var _id = new MongoIndex()
    col.json = {_id: 1, a: 1, b: "test", c: [1, 2, 3]}
    col.name = "test"
    _id.keys = ["_id"]
    _id.json = {_id: 1}
    col.indexes.push(_id)
    mongo.addCollection(col)*/
  }

  ngAfterViewInit() {
    $(document).foundation();
  }

  public save() {
    let serializedDoc = this.mongo.serialize()
    download('mongo-sizing.json', JSON.stringify(serializedDoc, null, 4))
  }

  public load() {
    let service = this.mongo
    let input = $(document.createElement('input'));
    input.attr("type", "file")
    input.change(function(ev) {
      let files = ev.target.files;
      let file = files[0];
      let reader = new FileReader();
      reader.onload = function() {
        let deserialize_string = this.result
        let deserialize_object = rj.parse(deserialize_string)
        service.deserialize(deserialize_object)
        service.compute()
        setTimeout(function() {
          $(document).foundation();
        }, 20)
      }
      reader.readAsText(file)
    });
    input.trigger('click')
    return false
  }
}

function download(filename, text) {
  saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), filename)
}
