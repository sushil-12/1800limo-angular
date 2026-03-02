import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { FAQ, customerFaqData, customerFaqMetaData } from './customer-faq-data';

@Component({
  selector: 'app-customer-faq',
  templateUrl: './customer-faq.component.html',
  styleUrls: ['./customer-faq.component.scss']
})
export class CustomerFaqComponent implements OnInit {

  faqs: FAQ[] = [];
  filteredFaqs: FAQ[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'all';

  suggestions: string[] = [];
  searchChips: string[] = [];
  showSuggestions: boolean = false;

  categories = [
    { id: 'all', label: 'All Questions', icon: 'bi bi-question-circle' },
    { id: 'booking', label: 'Booking & Reservations', icon: 'bi-calendar-check' },
    { id: 'payment', label: 'Payment & Pricing', icon: 'bi-credit-card' },
    { id: 'fleet', label: 'Service & Fleet', icon: 'bi-car-front' },
    { id: 'policies', label: 'Policies', icon: 'bi-shield-lock' }
  ];

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(customerFaqMetaData.title);
    this.metaService.updateTag({ name: 'description', content: customerFaqMetaData.description });
    this.metaService.updateTag({ name: 'keywords', content: customerFaqMetaData.keywords });

    this.faqs = customerFaqData.map(faq => ({ ...faq, isOpen: false }));
    this.applyFilters();
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch() {
    this.onSearchInput();
  }

  onSearchInput() {
    if (!this.searchQuery.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.applyFilters();
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    const matchingQuestions = this.faqs
      .filter(faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query))
      .map(faq => faq.question);

    this.suggestions = Array.from(new Set(matchingQuestions)).slice(0, 5);
    this.showSuggestions = this.suggestions.length > 0;
    this.applyFilters();
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.executeSearch();
  }

  executeSearch() {
    const trimmedStr = this.searchQuery.trim();
    if (trimmedStr && !this.searchChips.includes(trimmedStr)) {
      this.searchChips.push(trimmedStr);
    }
    this.searchQuery = '';
    this.showSuggestions = false;
    this.applyFilters();
  }

  removeChip(chip: string) {
    this.searchChips = this.searchChips.filter(c => c !== chip);
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredFaqs = this.faqs.filter(faq => {
      let matchesSearch = true;
      const currentSearch = this.searchQuery.trim().toLowerCase();
      const chips = this.searchChips.map(c => c.toLowerCase());

      const searchTerms = [...chips];
      if (currentSearch) {
        searchTerms.push(currentSearch);
      }

      if (searchTerms.length > 0) {
        matchesSearch = searchTerms.some(term =>
          faq.question.toLowerCase().includes(term) ||
          faq.answer.toLowerCase().includes(term)
        );
      }

      const matchesCategory = this.selectedCategory === 'all' || faq.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getCategoryLabel(): string {
    const cat = this.categories.find(c => c.id === this.selectedCategory);
    return cat ? cat.label : 'All Questions';
  }

  toggleAccordion(index: number): void {
    this.filteredFaqs[index].isOpen = !this.filteredFaqs[index].isOpen;

    // Optional: Close others
    this.filteredFaqs.forEach((faq, i) => {
      if (i !== index) faq.isOpen = false;
    });
  }
}
