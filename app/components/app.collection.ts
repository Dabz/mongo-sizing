import {Component, Input} from 'angular2/core';
import {MongoService} from '/app/services/mongo.service';
import {MongoCollection} from '/app/services/collection.service';
import {NewIndexComponent} from '/app/components/app.newindex'
import {EditDocumentComponent} from '/app/components/app.editdocument'

@Component({
  selector    : 'mdb-collection',
  templateUrl : '/app/templates/app.collection.html',
  directives: [NewIndexComponent, EditDocumentComponent]
})
export class CollectionComponent {
  @Input('collection')
  private collection: MongoCollection;

  constructor(mongo: MongoService) {
    this.mongo  = mongo
  }

  public syntaxHighlight(json) {
    var json = JSON.stringify(json, undefined, 4);
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

  public openNewIndex() {
    this.indexPanel.open()
  }
  public openEditDocument() {
    this.editDocPanel.open()
  }

  ngAfterViewInit() {
    this.indexPanel = new Foundation.Reveal($('#newIndex-' + this.collection.name));
    this.editDocPanel = new Foundation.Reveal($('#editDocument-' + this.collection.name))

    $('#newIndex-' + this.collection.name).on('closed.zf.reveal', function () {
      setTimeout(function() {
        $(document).foundation();
      }, 20);
    })
  }
}
