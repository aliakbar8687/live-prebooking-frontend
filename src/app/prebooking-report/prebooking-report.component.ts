import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { PrebookFormService } from '../prebook-form.service';

@Component({
  selector: 'app-prebooking-report',
  templateUrl: './prebooking-report.component.html',
  styleUrls: ['./prebooking-report.component.css']
})
export class PrebookingReportComponent implements OnInit {
  prebookingData: any[] = [];
  filteredData: any[] = [];
  userRole: string = '';
  isAdmin: boolean = false;
  totalSales: number = 0;
  totalItemsSold: number = 0;
  salesPerMonth: { name: string; value: number }[] = [];
  storeWiseSales: { name: string; value: number }[] = [];
  productWiseSales: { name: string; value: number }[] = [];
  statusWiseDistribution: { name: string; value: number }[] = []; 
  availableStores: string[] = [];
  selectedStore: string = '';
  availableMonthYears: string[] = [];
  selectedMonthYear: string = '';
  successMessage: string = '';
  showMessage: boolean = false;

  colorScheme: Color = {
    domain: [
      '#FF6347', '#4682B4', '#8A2BE2', '#FF7F50', '#20B2AA',
      '#9370DB', '#FF4500', '#1E90FF', '#DAA520', '#32CD32'
    ],
    name: 'Custom',
    selectable: true,
    group: ScaleType.Ordinal
  };

  constructor(private http: HttpClient, private prebookFormService: PrebookFormService) {}

  ngOnInit(): void {
    this.userRole = this.prebookFormService.getUserRole() || '';
    this.isAdmin = this.prebookFormService.isAdmin();
    console.log('User Role:', this.userRole);
    console.log('Is Admin:', this.isAdmin);
    this.loadPrebookingData();
  }

  loadPrebookingData(): void {
    console.log('Loading prebooking data...');
    this.http.get('https://prebookingapi.hyperwafa.com/api/prebookings').subscribe(
      (data: any) => {
        this.prebookingData = data;
        console.log('Prebooking Data Loaded:', this.prebookingData);
        this.populateStoreList();
        this.populateMonthYearList();
        this.filterDataByRole();
        this.calculateMetrics();
      },
      (error) => {
        console.error('Error loading prebooking data:', error);
      }
    );
  }

  populateStoreList(): void {
    if (this.isAdmin) {
      this.availableStores = Array.from(new Set(this.prebookingData.map(item => item.store)));
      console.log('Available Stores for Admin:', this.availableStores);
    }
  }

  populateMonthYearList(): void {
    const monthYearSet = new Set(this.prebookingData.map(item => {
      const date = new Date(item.date);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }));
    this.availableMonthYears = Array.from(monthYearSet).sort((a, b) => b.localeCompare(a));
    console.log('Available Month/Years:', this.availableMonthYears);
  }

  filterDataByRole(): void {
    console.log('Filtering data based on role and date...');
    this.successMessage = 'Data filtered successfully!';
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 2000);

    let filteredByRole = this.isAdmin ? [...this.prebookingData] : this.prebookingData.filter(item => {
      const userStoreSuffix = this.userRole.split('-').pop()?.trim();
      const storeSuffix = item.store.split('-').pop()?.trim();
      return storeSuffix === userStoreSuffix;
    });

    if (this.isAdmin && this.selectedStore) {
      filteredByRole = filteredByRole.filter(item => item.store === this.selectedStore);
    }

    if (this.selectedMonthYear) {
      filteredByRole = filteredByRole.filter(item => {
        const itemDate = new Date(item.date);
        const itemMonthYear = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1).toString().padStart(2, '0')}`;
        return itemMonthYear === this.selectedMonthYear;
      });
    }

    this.filteredData = filteredByRole;
    console.log('Filtered Data:', this.filteredData);
    this.calculateMetrics();
  }

  calculateMetrics(): void {
    console.log('Calculating metrics...');
    this.totalSales = this.filteredData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    this.totalItemsSold = this.filteredData.length;

    const salesPerMonthMap: Record<string, number> = this.filteredData.reduce((acc, curr) => {
      const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(curr.amount);
      return acc;
    }, {});

    this.salesPerMonth = Object.entries(salesPerMonthMap).map(([month, total]) => ({
      name: month,
      value: total
    }));

    if (this.isAdmin) {
      const storeWiseMap: Record<string, number> = this.filteredData.reduce((acc, curr) => {
        acc[curr.store] = (acc[curr.store] || 0) + Number(curr.amount);
        return acc;
      }, {});

      this.storeWiseSales = Object.entries(storeWiseMap).map(([store, total]) => ({
        name: store,
        value: total
      }));
    }

    const productWiseMap: Record<string, number> = this.filteredData.reduce((acc, curr) => {
      acc[curr.product] = (acc[curr.product] || 0) + Number(curr.amount);
      return acc;
    }, {});

    this.productWiseSales = Object.entries(productWiseMap).map(([product, total]) => ({
      name: product,
      value: total
    }));

    const statusWiseMap: Record<string, number> = this.filteredData.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    this.statusWiseDistribution = Object.entries(statusWiseMap).map(([status, count]) => ({
      name: status,
      value: count
    }));

    console.log('Metrics calculated:', {
      totalSales: this.totalSales,
      totalItemsSold: this.totalItemsSold,
      salesPerMonth: this.salesPerMonth,
      storeWiseSales: this.storeWiseSales,
      productWiseSales: this.productWiseSales,
      statusWiseDistribution: this.statusWiseDistribution
    });
  }

  onStoreChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStore = target.value;
    console.log('Selected Store for Filtering:', this.selectedStore);
    this.filterDataByRole();
  }

  onMonthYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMonthYear = target.value;
    console.log('Selected Month/Year for Filtering:', this.selectedMonthYear);
    this.filterDataByRole();
  }

  formatCurrency(amount: number): string {
    return `﷼ ${amount.toFixed(2)}`;
  }

  onSelect(event: any): void {
    console.log('Item selected:', event);
  }
}