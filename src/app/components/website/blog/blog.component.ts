import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { BLOG_POSTS, BlogPost } from './blog.data';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  allPosts: BlogPost[] = BLOG_POSTS;
  featuredArticles: BlogPost[] = [];
  latestArticles: BlogPost[] = [];

  categories = [
    { name: 'All Posts', count: 9, id: 'all', active: true },
    { name: 'Travel Tips', count: 4, id: 'travel', active: false },
    { name: 'Industry News', count: 1, id: 'industry', active: false },
    { name: 'Company Updates', count: 2, id: 'company', active: false },
    { name: 'Customer Stories', count: 1, id: 'customer', active: false },
    { name: 'Luxury Lifestyle', count: 2, id: 'luxury', active: false }
  ];

  constructor(private titleService: Title, private metaService: Meta) { }

  ngOnInit(): void {
    const title = 'Blog | 1-800-LIMO.COM';
    const description = 'Expert tips, industry news, and inspiring stories from the world of luxury transportation';

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: '1-800-LIMO.COM' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    // Based on the mockup, set the second and third items as featured
    this.featuredArticles = [this.allPosts[1], this.allPosts[2]];

    // The rest go into latest articles
    this.latestArticles = this.allPosts.filter(p => p.id !== this.featuredArticles[0].id && p.id !== this.featuredArticles[1].id);
  }

  // Quick helper to strip HTML and get a clean excerpt
  getExcerpt(htmlContent: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = htmlContent;
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 150) + '...';
  }
}
