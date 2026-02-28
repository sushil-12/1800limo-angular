import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BLOG_POSTS, BlogPost } from '../blog/blog.data';

@Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {

    post: BlogPost | undefined;
    safeContent: SafeHtml | undefined;
    relatedArticles: BlogPost[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private titleService: Title,
        private metaService: Meta,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadPost(id);
            } else {
                this.router.navigate(['/blog']);
            }
        });
    }

    loadPost(id: string) {
        this.post = BLOG_POSTS.find(p => p.id === id);

        if (this.post) {
            // Set page metadata
            this.titleService.setTitle(this.post.title + ' | 1-800-LIMO.COM');
            this.metaService.updateTag({ name: 'description', content: this.getExcerpt(this.post.content) });

            // Sanitize the HTML content for safe rendering
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.post.content);

            // Load 3 related articles (just pick first 3 not equal to this one for now)
            this.relatedArticles = BLOG_POSTS.filter(p => p.id !== id).slice(0, 3);

            // Scroll to top
            window.scrollTo(0, 0);
        } else {
            // Post not found
            this.router.navigate(['/blog']);
        }
    }

    getExcerpt(htmlContent: string): string {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = htmlContent;
        const text = tmp.textContent || tmp.innerText || '';
        return text.substring(0, 160) + '...';
    }
}
