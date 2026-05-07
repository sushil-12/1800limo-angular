import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { BlogPost } from './blog.data';
import { BlogService, BlogCategory } from './blog.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  allPosts: BlogPost[] = [];
  featuredArticles: BlogPost[] = [];
  latestArticles: BlogPost[] = [];
  categories: BlogCategory[] = [{ name: 'All Posts', count: 0, id: 'all', active: true }];
  loading = true;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private blogService: BlogService
  ) { }

  ngOnInit(): void {
    const title = 'Blog | 1-800-LIMO.COM';
    const description = 'Expert tips, industry news, and inspiring stories from the world of luxury transportation';

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: '1-800-LIMO.COM' });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    this.blogService.getPosts().subscribe({
     next: posts => {
      this.allPosts = posts;
      this.featuredArticles = posts.slice(0, 2);
      this.latestArticles = posts.slice(2);
      this.loading = false;  
    },
      error: () => { this.loading = false; }
    });

    this.blogService.getCategories().subscribe(cats => {
      const total = cats.reduce((sum, c) => sum + c.count, 0);
      this.categories = [
        { name: 'All Posts', count: total, id: 'all', active: true },
        ...cats
      ];
    });
  }

  getExcerpt(htmlContent: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = htmlContent;
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 150) + '...';
  }

  onTab(category: BlogCategory): void {
    this.categories = this.categories.map(cat => ({
      ...cat,
      active: cat.id === category.id
    }));

    if (category.id === 'all') {
      this.featuredArticles = this.allPosts.slice(0, 2);
      this.latestArticles = this.allPosts.slice(2);
    } else {
      const filtered = this.allPosts.filter(post => post.category === category.name);
      this.featuredArticles = filtered.slice(0, 2);
      this.latestArticles = filtered.slice(2);
    }
 }
}
