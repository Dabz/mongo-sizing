import {provide} from 'angular2/core';
import {bootstrap}    from 'angular2/platform/browser'
import {AppDashboard} from '/app/components/app.dashboard'
import {MongoService} from '/app/services/mongo.service';
provide(MongoService, {useClass: MongoService})
bootstrap(AppDashboard);
