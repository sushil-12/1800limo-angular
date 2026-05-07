import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BlogPost, BlogComment } from './blog.data';

const WP_API = 'https://blog.1800limo.com/wp-json/wp/v2';
const WP_CUSTOM_API = 'https://blog.1800limo.com/wp-json/custom/v1';

export interface WpStyleHandle {
    handle: string;
    src: string;
    ver: string;
    media: string;
    before: string;
    after: string;
}

export interface WpStyles {
    links: string[];
    items: WpStyleHandle[];
}
const PLACEHOLDER_IMG = 'assets/images/placeholder.jpg';

interface WpRendered { rendered: string; }
interface WpPost {
   id: number;
   slug: string;
   date: string;
   title: WpRendered;
   content: WpRendered;
   excerpt: WpRendered;
   featured_media: number;
   author: number;
   categories: number[];
   tags: number[];
   _embedded?: {
      author?: Array<{ name: string; description?: string; avatar_urls?: { [key: string]: string } }>;
      'wp:featuredmedia'?: Array<{ source_url?: string; media_details?: any }>;
      'wp:term'?: Array<Array<{ taxonomy: string; name: string; slug: string }>>;
   };
}

interface WpComment {
   id: number;
   author_name: string;
   date: string;
   content: WpRendered;
   author_avatar_urls?: { [key: string]: string };
}

export interface BlogCategory {
   id: string;
   name: string;
   count: number;
   active: boolean;
}

export interface NewComment {
   post: number;
   author_name: string;
   author_email: string;
   content: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {

   constructor(private http: HttpClient) { }

   getBlockStyles(): Observable<WpStyles> {
      return this.http
         .get<WpStyles>(`${WP_CUSTOM_API}/styles`)
         .pipe(catchError(() => of({ links: [], items: [] })));
   }

   getPosts(): Observable<BlogPost[]> {
      return this.http
         .get<WpPost[]>(`${WP_API}/posts?per_page=100&_embed`)
         .pipe(map(posts => posts.map(p => this.mapPost(p))));
   }

   getPostBySlug(slug: string): Observable<BlogPost | undefined> {
      return this.http
         .get<WpPost[]>(`${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed`)
         .pipe(map(posts => posts.length ? this.mapPost(posts[0]) : undefined));
   }

   getCategories(): Observable<BlogCategory[]> {
      return this.http
         .get<Array<{ id: number; name: string; slug: string; count: number }>>(
            `${WP_API}/categories?per_page=100&hide_empty=true`
         )
         .pipe(
            map(cats => cats.map(c => ({
               id: c.slug,
               name: c.name,
               count: c.count,
               active: false
            }))),
            catchError(() => of([]))
         );
   }

   getComments(postId: number): Observable<BlogComment[]> {
      return this.http
         .get<WpComment[]>(`${WP_API}/comments?post=${postId}&per_page=100&order=desc&orderby=date`)
         .pipe(
            map(comments => comments.map(c => this.mapComment(c))),
            catchError(() => of([]))
         );
   }

   postComment(payload: NewComment): Observable<BlogComment> {
      return this.http
         .post<WpComment>(`${WP_API}/comments`, payload)
         .pipe(map(c => this.mapComment(c)));
   }

   private mapPost(p: WpPost): BlogPost {
      const emb = p._embedded || {};
      const author = emb.author?.[0];
      const featured = emb['wp:featuredmedia']?.[0];
      const terms = emb['wp:term'] || [];
      const categoryName = terms.flat().find(t => t.taxonomy === 'category')?.name || 'General';
      const tagNames = terms.flat()
         .filter(t => t.taxonomy === 'post_tag')
         .map(t => `#${t.name.replace(/\s+/g, '')}`);

      const authorName = author?.name || 'Editorial Team';
      const avatar = author?.avatar_urls?.['96'] || author?.avatar_urls?.['48'];

      return {
         id: p.slug,
         wpId: p.id,
         title: this.decodeHtml(p.title.rendered),
         category: this.decodeHtml(categoryName),
         date: this.formatDate(p.date),
         readTime: this.estimateReadTime(p.content.rendered),
         author: {
            name: authorName,
            image: avatar,
            initials: avatar ? undefined : this.initialsFromName(authorName),
            bio: author?.description || ''
         },
         image: featured?.source_url || PLACEHOLDER_IMG,
         tags: tagNames,
         content: p.content.rendered
      };
   }

   private mapComment(c: WpComment): BlogComment {
      const avatar = c.author_avatar_urls?.['96'] || c.author_avatar_urls?.['48'];
      return {
         id: c.id,
         authorName: c.author_name || 'Anonymous',
         authorInitials: this.initialsFromName(c.author_name || 'Anonymous'),
         authorAvatar: avatar,
         date: this.formatDate(c.date),
         contentHtml: c.content?.rendered || ''
      };
   }

   private formatDate(iso: string): string {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
   }

   private estimateReadTime(html: string): string {
      const text = html.replace(/<[^>]+>/g, ' ').trim();
      const words = text ? text.split(/\s+/).length : 0;
      const minutes = Math.max(1, Math.round(words / 200));
      return `${minutes} min read`;
   }

   private initialsFromName(name: string): string {
      return name
         .split(/\s+/)
         .filter(Boolean)
         .slice(0, 2)
         .map(n => n[0].toUpperCase())
         .join('');
   }

   private decodeHtml(html: string): string {
      const txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
   }
}
