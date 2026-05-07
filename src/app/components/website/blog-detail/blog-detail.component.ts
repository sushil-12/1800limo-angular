import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogPost, BlogComment } from '../blog/blog.data';
import { BlogService } from '../blog/blog.service';


@Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit, OnDestroy {

    post: BlogPost | undefined;
    safeContent: SafeHtml | undefined;
    relatedArticles: BlogPost[] = [];

    comments: BlogComment[] = [];
    commentsLoading = false;

    newComment = { author_name: '', author_email: '', content: '' };
    submitting = false;
    submitError = '';
    submitSuccess = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private titleService: Title,
        private metaService: Meta,
        private sanitizer: DomSanitizer,
        private blogService: BlogService
    ) { }

    private wpStyleObserver: MutationObserver | undefined;
    private wpInjectedIds: string[] = [];

    ngOnInit(): void {
        this.injectWpStyles();
        this.route.paramMap.subscribe(params => {
            const slug = params.get('id');
            if (slug) {
                this.loadPost(slug);
            } else {
                this.router.navigate(['/blog']);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.wpStyleObserver) {
            this.wpStyleObserver.disconnect();
            this.wpStyleObserver = undefined;
        }
        this.wpInjectedIds.forEach(id => {
            const el = document.getElementById(id);
            if (el?.parentNode) el.parentNode.removeChild(el);
        });
        this.wpInjectedIds = [];
    }

    private injectWpStyles(): void {
        this.blogService.getBlockStyles().subscribe(({ links, items }) => {
            // Inject linked stylesheets from `links`
            links.forEach((href, i) => {
                const id = `wp-link-${i}`;
                if (!document.getElementById(id)) {
                    const link = document.createElement('link');
                    link.id = id;
                    link.rel = 'stylesheet';
                    link.href = href;
                    document.head.appendChild(link);
                    this.wpInjectedIds.push(id);
                }
            });

            // Inject per-handle inline CSS from `items` (before / after)
            items.forEach(({ handle, media, before, after }) => {
                if (before) this.injectInlineStyle(`wp-${handle}-before`, before, media);
                if (after)  this.injectInlineStyle(`wp-${handle}-after`,  after,  media);
            });

            this.setupWpStyleObserver();
        });
    }

    private injectInlineStyle(id: string, css: string, media = 'all'): void {
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.media = media;
        style.textContent = css;
        document.head.appendChild(style);
        this.wpInjectedIds.push(id);
    }

    private setupWpStyleObserver(): void {
        if (this.wpStyleObserver) this.wpStyleObserver.disconnect();
        this.wpStyleObserver = new MutationObserver(() => {
            const last = document.head.lastElementChild;
            const needsReorder = this.wpInjectedIds.some(id => {
                const el = document.getElementById(id);
                return el && el !== last;
            });
            if (!needsReorder) return;
            this.wpStyleObserver!.disconnect();
            this.wpInjectedIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) document.head.appendChild(el);
            });
            this.wpStyleObserver!.observe(document.head, { childList: true });
        });
        this.wpStyleObserver.observe(document.head, { childList: true });
    }

    loadPost(slug: string) {
        this.blogService.getPostBySlug(slug).subscribe({
            next: post => {
                if (!post) {
                    this.router.navigate(['/blog']);
                    return;
                }
                this.post = post;
                this.setSeoTags(post);
                this.safeContent = this.sanitizer.bypassSecurityTrustHtml(post.content);

                this.loadComments(post.wpId);

                this.blogService.getPosts().subscribe(all => {
                    this.relatedArticles = all.filter(p => p.id !== slug).slice(0, 3);
                });

                window.scrollTo(0, 0);
            },
            error: () => this.router.navigate(['/blog'])
        });
    }

    private setSeoTags(post: BlogPost) {
        const title = post.title + ' | 1-800-LIMO.COM';
        const description = this.getExcerpt(post.content);
        const url = this.shareUrl();
        const image = post.image && /^https?:\/\//.test(post.image) ? post.image : '';

        this.titleService.setTitle(title);
        this.metaService.updateTag({ name: 'description', content: description });

        // Open Graph (LinkedIn, Facebook, WhatsApp)
        this.metaService.updateTag({ property: 'og:title', content: post.title });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ property: 'og:type', content: 'article' });
        this.metaService.updateTag({ property: 'og:url', content: url });
        this.metaService.updateTag({ property: 'og:site_name', content: '1-800-LIMO.COM' });
        if (image) {
            this.metaService.updateTag({ property: 'og:image', content: image });
            this.metaService.updateTag({ property: 'og:image:alt', content: post.title });
        }
        this.metaService.updateTag({ property: 'article:published_time', content: post.date });
        this.metaService.updateTag({ property: 'article:author', content: post.author.name });
        this.metaService.updateTag({ property: 'article:section', content: post.category });

        // Twitter Card
        this.metaService.updateTag({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
        this.metaService.updateTag({ name: 'twitter:title', content: post.title });
        this.metaService.updateTag({ name: 'twitter:description', content: description });
        if (image) {
            this.metaService.updateTag({ name: 'twitter:image', content: image });
        }
    }

    loadComments(postId: number) {
        this.commentsLoading = true;
        this.blogService.getComments(postId).subscribe({
            next: list => { this.comments = list; this.commentsLoading = false; },
            error: () => { this.commentsLoading = false; }
        });
    }

    submitComment() {
        if (!this.post || this.submitting) return;
        if (!this.newComment.author_name.trim() || !this.newComment.author_email.trim() || !this.newComment.content.trim()) {
            this.submitError = 'Please fill in your name, email, and a comment.';
            return;
        }
        this.submitting = true;
        this.submitError = '';
        this.submitSuccess = '';

        this.blogService.postComment({
            post: this.post.wpId,
            author_name: this.newComment.author_name.trim(),
            author_email: this.newComment.author_email.trim(),
            content: this.newComment.content.trim()
        }).subscribe({
            next: c => {
                this.submitting = false;
                this.submitSuccess = 'Thanks! Your comment has been submitted and is awaiting moderation.';
                this.newComment = { author_name: '', author_email: '', content: '' };
                // Optimistically prepend if approved immediately
                if (c && c.contentHtml) this.comments = [c, ...this.comments];
            },
            error: err => {
                this.submitting = false;
                this.submitError = err?.error?.message || 'Could not submit your comment. Please try again.';
            }
        });
    }

    copyState: 'idle' | 'copied' | 'error' = 'idle';

    shareUrl(): string {
        return typeof window !== 'undefined' ? window.location.href : '';
    }

    shareLink(network: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email'): string {
        const url = encodeURIComponent(this.shareUrl());
        const title = encodeURIComponent(this.post?.title || '');
        switch (network) {
            case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            case 'twitter': return `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            case 'whatsapp': return `https://api.whatsapp.com/send?text=${title}%20${url}`;
            case 'email': return `mailto:?subject=${title}&body=${url}`;
        }
    }

    openShare(event: Event, network: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp'): void {
        event.preventDefault();
        const href = this.shareLink(network);
        const w = 600, h = 500;
        const left = (window.innerWidth - w) / 2;
        const top = (window.innerHeight - h) / 2;
        window.open(href, 'share-popup', `width=${w},height=${h},left=${left},top=${top},noopener`);
    }

    nativeShare(): void {
        if (!this.post) return;
        const data = {
            title: this.post.title,
            text: this.getExcerpt(this.post.content),
            url: this.shareUrl()
        };
        const nav: any = navigator;
        if (nav.share) {
            nav.share(data).catch(() => { /* user cancelled */ });
        } else {
            this.copyLink();
        }
    }

    canNativeShare(): boolean {
        return typeof navigator !== 'undefined' && !!(navigator as any).share;
    }

    copyLink(): void {
        const url = this.shareUrl();
        const done = () => {
            this.copyState = 'copied';
            setTimeout(() => this.copyState = 'idle', 2000);
        };
        const fail = () => {
            this.copyState = 'error';
            setTimeout(() => this.copyState = 'idle', 2000);
        };
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url).then(done, fail);
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = url;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                // execCommand is deprecated but kept as a last-resort fallback
                // for browsers without Clipboard API support
                (document as any).execCommand('copy');
                document.body.removeChild(ta);
                done();
            } catch {
                fail();
            }
        }
    }

    getExcerpt(htmlContent: string): string {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = htmlContent;
        const text = tmp.textContent || tmp.innerText || '';
        return text.substring(0, 160) + '...';
    }
}
