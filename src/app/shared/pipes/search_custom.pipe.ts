import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search_custom'
})
export class SearchCustomPipe implements PipeTransform {

  public transform(value, keys: string, term: string) {
    if (!term) {
      return value;
    }

    let result = (value || []).filter((item) => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));
    console.log(result);
    if (result.length) {
      return result;
    } else {
      return [-1];
    }
  }

}

