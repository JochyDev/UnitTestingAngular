import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FakeValueService {

  constructor() { }

  getValue(){
    return 'fake value';
  }

  setValue(value: string){}

  getPromiseValue(){
    return Promise.resolve('fake promise value');
  }
  
  
}
