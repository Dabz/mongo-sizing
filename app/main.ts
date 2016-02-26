import {provide} from 'angular2/core';
import {bootstrap}    from 'angular2/platform/browser'
import {AppDashboard} from './app.dashboard'
import {MongoService} from './mongo.service';
provide(MongoService, {useClass: MongoService})
bootstrap(AppDashboard);
