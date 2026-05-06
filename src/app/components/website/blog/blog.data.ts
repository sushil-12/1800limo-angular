export interface BlogPost {
   id: string;
   wpId: number;
   title: string;
   category: string;
   date: string;
   readTime: string;
   author: {
      name: string;
      image?: string;
      initials?: string;
      bio?: string;
   };
   image: string;
   tags: string[];
   content: string;
}

export interface BlogComment {
   id: number;
   authorName: string;
   authorInitials: string;
   authorAvatar?: string;
   date: string;
   contentHtml: string;
}
