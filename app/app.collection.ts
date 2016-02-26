import {Component, Input} from 'angular2/core';
import {MongoService} from './mongo.service';
import {MongoCollection, MongoIndex} from './mongo.service';

@Component({
  selector    : 'mdb-collection',
  templateUrl : '/app/app.collection.html'
})
export class CollectionComponent {
  private @Input('collection') collection: MongoCollection

  constructor(mongo: MongoService) {
    this.mongo  = mongo
  }

  public syntaxHighlight(json) {
    json = JSON.stringify(json, undefined, 4);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }
}
