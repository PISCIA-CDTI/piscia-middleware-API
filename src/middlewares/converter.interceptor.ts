import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const msgpack = require('msgpack5')();

@Injectable()
export class ConverterInterceptor implements NestInterceptor {
  private logger = new Logger (ConverterInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    this.logger.log('Transforming data....');
    return next.handle().pipe(map(data => {
      const req = context.switchToHttp().getRequest();
      const encode = msgpack.encode;

      const res = JSON.parse(JSON.stringify(data));

      if (!res) return res;

      if (req.headers['accept'] === 'application/json'){
        this.logger.log(`JSON representation selected`);
        if (Array.isArray(res)){
          res.forEach( value => {
            if (value.hasOwnProperty('@context')) delete value['@context'];
            if (value.hasOwnProperty('@type')) delete value['@type'];
          });
        }else {
          if (res.hasOwnProperty('@context')) delete res['@context'];
          if (res.hasOwnProperty('@type')) delete res['@type'];
        }
        return res;
      }

      if (req.headers['accept'] === 'application/ld+json'){
        this.logger.log(`JSONLD representation selected`);
        req.headers['type'] = 'application/ld+json';
        if (Array.isArray(res)){
          res.forEach( value => {
            if (!value.hasOwnProperty('@context')) value['@context'] = [
              'http://ibathwater.com/context.jsonld',
              'http://ibathwater.com/geo-context.jsonld'
            ]
          })
        }else {
          if (!res.hasOwnProperty('@context')) res['@context'] = [
            'http://ibathwater.com/context.jsonld',
            'http://ibathwater.com/geo-context.jsonld'
          ]
        }

        return res;
      }

      if(req.headers['accept'] === 'application/x-msgpack'){
        this.logger.log(`MessagePack representation selected`);
        req.headers['type'] = 'application/x-msgpack';
        return encode(res)
      }

      this.logger.log('Defaulting to JSON representation')
      if (Array.isArray(res)){
        res.forEach( value => {
          if (value.hasOwnProperty('@context')) delete value['@context'];
          if (value.hasOwnProperty('@type')) delete value['@type'];
        });
      }else {
        if (res.hasOwnProperty('@context')) delete res['@context'];
        if (res.hasOwnProperty('@type')) delete res['@type'];
      }
      return res;

    }));
  }
}
