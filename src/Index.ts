import {ReporterFactory} from 'stryker-api/report';
import reporter from './BaselineReporter';

ReporterFactory.instance().register('baseline', reporter);