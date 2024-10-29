import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      // Convert date fields to a string format for searching
      const ddateStr = item.ddate ? new Date(item.ddate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : ''; // Format: dd MMMM yyyy
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : ''; // Format: dd MMMM yyyy

      // Check specific fields for the search text
      return (
        item.uniqueId.toString().toLowerCase().includes(searchText) ||
        item.store.toLowerCase().includes(searchText) ||
        item.product.toLowerCase().includes(searchText) ||
        item.name.toLowerCase().includes(searchText) ||
        item.phone.toLowerCase().includes(searchText) ||
        item.description.toLowerCase().includes(searchText) ||
        ddateStr.toLowerCase().includes(searchText) || // Search in formatted ddate
        dateStr.toLowerCase().includes(searchText) ||   // Search in formatted date
        item.status.toLowerCase().includes(searchText)
      );
    });
  }
}
