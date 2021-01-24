import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { switchMap, retry, share } from 'rxjs/operators';
import { ImeteoParameterList } from './interfaces';


@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(private http: HttpClient) { }

  public updateParameters = timer(0, 5000).pipe(
    switchMap(() => this.http.get<ImeteoParameterList>('https://meteo.ipp.pt/ramdisk/json/meteoparameterlist.txt')),
    retry(),
    share()
  );

}
