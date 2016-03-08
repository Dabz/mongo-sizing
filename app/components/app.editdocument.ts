import {Component, Input} from 'angular2/core';
import {MongoService} from '/app/services/mongo.service';
import {MongoCollection} from '/app/services/collection.service';

@Component({
    selector: 'mdb-editdocument',
    templateUrl: '/app/templates/app.editdocument.html'
})
export class EditDocumentComponent {
  private json: string;
  @Input('collection')
  private collection: MongoCollection;


  constructor(mongo: MongoService) {
    this.mongo = mongo
  }

  ngOnInit() {
    this.json = JSON.stringify(this.collection.json, null, 4)
  }

  public save() {
    try {
      this.json = this.json.replace(/ObjectId\(.*?\)/g, '"$id"').replace(/ISODate\(.*?\)/, '"$date"')
      this.json = this.json.replace(/Timestamp\(.*?\)/, '$timestamp').replace(/new\s+Date\(.*?\)/g, '$date')
      let jsonparsed = RJSON.parse(this.json)
      if (jsonparsed._id === undefined) {
        jsonparsed = jQuery.extend({_id: "$id"}, jsonparsed)
      }

      this.collection.json = jsonparsed
      this.mongo.compute()
    } catch (e) {
      alert(e);
      return;
    }
  }

}
