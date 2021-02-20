import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from './app.service';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  rows: any[];
  clonedRows: any[];
  nameControl = new FormControl();
  categoryControl = new FormControl();
  nameSub: Subscription;
  categorySub: Subscription;
  previousNameFilter = '';
  previousProducerFilter = '';
  previousCategoryFilter = '';
  columns = [
    { name: 'Name', prop: 'name', width: 250 },
    { name: 'Producer', prop: 'producer', width: 250 },
    { name: 'Category', prop: 'category', width: 250 }
  ];
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((res: any[]) => {
      this.rows = res;
      this.clonedRows = cloneDeep(this.rows);
    })

    this.nameSub = this.nameControl.valueChanges.pipe(
      debounceTime(400),
    ).subscribe((name: string) => {
      this.previousNameFilter = name;
      this.rows = this.filterRows(name, this.previousProducerFilter, this.previousCategoryFilter);
    })

    this.categorySub = this.categoryControl.valueChanges.pipe(
      debounceTime(400),
    ).subscribe((category: string) => {
      this.previousCategoryFilter = category;
      this.rows = this.filterRows(this.previousNameFilter, this.previousProducerFilter, category);
    })
  }

  filterByProducer(producer: string) {
    this.previousProducerFilter = producer;
    this.rows = this.filterRows(this.previousNameFilter, producer, this.previousCategoryFilter);
  }

  filterRows(nameFilter = '', producerFilter = '', categoryFilter = ''): any[] {
    nameFilter = nameFilter.toUpperCase();
    producerFilter = producerFilter.toUpperCase();
    categoryFilter = categoryFilter.toUpperCase();

    return this.clonedRows.filter(row => {
      const isPartialNameMatch = row.name.toUpperCase().indexOf(nameFilter) !== -1 || !nameFilter;
      const isPartialProducerMatch = row.producer.toUpperCase().indexOf(producerFilter) !== -1 || !producerFilter;
      const isPartialCategoryMatch = row.category.toUpperCase().indexOf(categoryFilter) !== -1 || !categoryFilter;
      return isPartialNameMatch && isPartialProducerMatch && isPartialCategoryMatch;
    });
  }

  ngOnDestroy(): void {
    this.nameSub.unsubscribe();
    this.categorySub.unsubscribe();
  }
}
