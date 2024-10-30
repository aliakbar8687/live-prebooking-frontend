import { Component, OnInit } from '@angular/core';
import { PrebookFormService } from '../prebook-form.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css']
})
export class ActivityLogComponent implements OnInit {
  activityLogs: any[] = [];
  paginatedLogs: any[] = [];
  filteredLogs: any[] = [];
  isLoading = true;
  currentPage: number = 1;
  logsPerPage: number = 20;
  totalPages: number = 0;
  pages: number[] = [];
  
  successMessage: string = '';
  errorMessage: string = '';
  isModalOpen: boolean = false;

  searchText: string = '';

  constructor(
    private activityLogService: PrebookFormService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchActivityLogs();
  }

  fetchActivityLogs() {
    this.activityLogService.getActivityLogs().subscribe(
      (data) => {
        this.activityLogs = data;
        this.filteredLogs = data;
        this.isLoading = false;
        this.totalPages = Math.ceil(this.filteredLogs.length / this.logsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (v, i) => i + 1);
        this.paginateLogs();
      },
      (error) => {
        console.error('Error fetching activity logs', error);
        this.isLoading = false;
      }
    );
  }

  filterLogs(): void {
    if (this.searchText.length >= 3) {
      const searchTerm = this.searchText.toLowerCase();
      this.filteredLogs = this.activityLogs.filter(log =>
        (log.table_name && log.table_name.toLowerCase().includes(searchTerm)) ||
        (log.action && log.action.toLowerCase().includes(searchTerm)) ||
        (log.old_data && JSON.stringify(log.old_data).toLowerCase().includes(searchTerm)) ||
        (log.new_data && JSON.stringify(log.new_data).toLowerCase().includes(searchTerm)) ||
        (log.timestamp && new Date(log.timestamp).toLocaleString().toLowerCase().includes(searchTerm))
      );
    } else {
      this.filteredLogs = this.activityLogs;
    }
    this.totalPages = Math.ceil(this.filteredLogs.length / this.logsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (v, i) => i + 1);
    this.currentPage = 1;
    this.paginateLogs();
  }

  paginateLogs(): void {
    const startIndex = (this.currentPage - 1) * this.logsPerPage;
    const endIndex = startIndex + this.logsPerPage;
    this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateLogs();
    }
  }

  selectAll(event: any): void {
    const checked = event.target.checked;
    this.paginatedLogs.forEach(log => log.selected = checked);
  }

  openDeleteModal(): void {
    this.isModalOpen = true;
    this.errorMessage = '';
  }

  closeDeleteModal(): void {
    this.isModalOpen = false;
  }

  deleteSelectedLogs(): void {
    const selectedLogs = this.paginatedLogs.filter(log => log.selected);
    
    if (selectedLogs.length === 0) {
      this.errorMessage = 'Please select at least one log to delete.';
      return;
    }

    this.activityLogService.deleteLogs(selectedLogs.map(log => log.id)).subscribe(
      () => {
        this.successMessage = 'Logs deleted successfully!';
        this.fetchActivityLogs();
        this.activityLogs = this.activityLogs.filter(log => !log.selected);
        this.filteredLogs = this.filteredLogs.filter(log => !log.selected);
        this.paginateLogs();
        this.isModalOpen = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      (error) => {
        console.error('Error deleting logs', error);
        this.errorMessage = 'An error occurred while deleting logs.';
      }
    );
  }

  beautifyJson(value: any, isOld: boolean = false): SafeHtml {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // If it's not valid JSON, just return the string
        return this.sanitizer.bypassSecurityTrustHtml(`<pre class="${isOld ? 'old-data' : 'new-data'}">${value}</pre>`);
      }
    }
    const formattedJson = this.formatValue(value, isOld);
    return this.sanitizer.bypassSecurityTrustHtml(`<pre class="json ${isOld ? 'old-data' : 'new-data'}">${formattedJson}</pre>`);
  }

  private formatValue(value: any, isOld: boolean, indent: string = ''): string {
    if (value === null) {
      return '<span class="null">null</span>';
    }
    if (typeof value === 'object') {
      return this.formatObject(value, isOld, indent);
    }
    if (typeof value === 'string') {
      return `<span class="string">"${this.escapeHtml(value)}"</span>`;
    }
    if (typeof value === 'number') {
      return `<span class="number">${value}</span>`;
    }
    if (typeof value === 'boolean') {
      return `<span class="boolean">${value}</span>`;
    }
    return this.escapeHtml(String(value));
  }

  private formatObject(obj: any, isOld: boolean, indent: string): string {
    const nextIndent = indent + '  ';
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const elements = obj.map(item => `${nextIndent}${this.formatValue(item, isOld, nextIndent)}`).join(',\n');
      return `[\n${elements}\n${indent}]`;
    } else {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      const props = entries.map(([key, value]) => 
        `${nextIndent}<span class="key">"${this.escapeHtml(key)}"</span>: ${this.formatValue(value, isOld, nextIndent)}`
      ).join(',\n');
      return `{\n${props}\n${indent}}`;
    }
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
