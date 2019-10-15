import { Params } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';

import { Feature } from './feature';

export class SearchResults {
  _id: string;
  totalFeatures: number;
  date: Date = null;
  crs: string;
  type: string;
  status: string;
  hostname: string;

  features: Feature[] = [];
  sidsFound: string[] = [];

  constructor(search?: any, hostname?: any) {
    this._id = (search && search._id) || null;
    this.totalFeatures = (search && search.totalFeatures) || 0;
    this.crs = (search && search.crs) || null;
    this.type = (search && search.type) || null;
    this.date = (search && search.date) || null;
    this.status = (search && search.status) || null;
    this.hostname = hostname;

    if (search && search.date) {
      this.date = new Date(search.date);
    }

    // copy features
    if (search && search.features) {
      for (const feature of search.features) {
        this.features.push(feature);
      }
    }

    // copy sidsFound
    if (search && search.sidsFound) {
      for (const sid of search.sidsFound) {
        this.sidsFound.push(sid);
      }
    }
  }
}

export class SearchArray {
  items: SearchResults[];

  constructor(obj?: any) {
    // copy items
    if (obj && obj.items) {
      for (const item of obj.items) {
        this.items.push(item);
      }
    }
  }

  sort() {
    this.items.sort((a: SearchResults, b: SearchResults) => {
      const aDate = a && a.date ? new Date(a.date).getTime() : 0;
      const bDate = b && b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });
  }

  get length() {
    return this.items.length;
  }

  add(search?: SearchResults) {
    if (search) {
      this.items.push(search);
    }
  }
}

export class SearchTerms {
  keywords: string; // comma- or space-delimited list
  dateStart: NgbDateStruct;
  dateEnd: NgbDateStruct;

  constructor(obj?: any) {
    this.keywords = (obj && obj.keywords) || null;
    this.dateStart = (obj && obj.dateStart) || null;
    this.dateEnd = (obj && obj.dateEnd) || null;
  }

  getParams(): Params {
    const params = {};

    if (this.keywords) {
      // tokenize by comma, space, etc and remove duplicate items
      const keywords = _.uniq(this.keywords.match(/\b(\w+)/g));
      params['keywords'] = keywords.join(',');
    }
    if (this.dateStart) {
      params['datestart'] = this.getDateParam(this.dateStart);
    }
    if (this.dateEnd) {
      params['dateend'] = this.getDateParam(this.dateEnd);
    }

    return params;
  }

  private getDateParam(date: NgbDateStruct) {
    let dateParam = date.year + '-';

    if (date.month < 10) {
      dateParam += '0';
    }
    dateParam += date.month + '-';

    if (date.day < 10) {
      dateParam += '0';
    }
    dateParam += date.day;

    return dateParam;
  }
}
