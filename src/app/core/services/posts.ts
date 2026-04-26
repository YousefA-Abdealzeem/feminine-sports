import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts = [
    {
      id: 1,
      category: 'كرة القدم',
      title: 'تحطيم الأرقام القياسية',
      date: '2023-10-15',
      desc: 'شهدت بطولة كرة القدم النسائية حدثًا تاريخيًا بتحقيق أرقام قياسية جديدة.',
      img: '/assets/images/posts.jpg',
      likeCount: 0,
      liked: false,
      comments: []
    },
    {
      id: 2,
      category: 'السباحة',
      title: 'أرقام قياسية جديدة',
      date: '2024-01-20',
      desc: 'تم تسجيل أسرع زمن جديد في البطولة العالمية للسباحة.',
      img: '/assets/images/swimming.jpg',
      likeCount: 0,
      liked: false,
      comments: []
    },
    {
      id: 3,
      category: 'السلة',
      title: 'نهائي مثير في بطولة السلة',
      date: '2024-03-01',
      desc: 'نهائي قوي في بطولة السلة بين أفضل اللاعبات عالميًا.',
      img: '/assets/images/baskt.jpg',
      likeCount: 0,
      liked: false,
      comments: []
    },
    {
      id: 4,
      category: 'الجري',
      title: 'أرقام قياسية جديدة في البطولة العالمية للجري',
      date: '2024-04-15',
      desc: 'تم تسجيل أسرع زمن جديد في البطولة العالمية للجري.',
      img: '/assets/images/running.jpg',
      likeCount: 0,
      liked: false,
      comments: []
    }
  ];

  getAllPosts() {
    return this.posts;
  }

  getPostById(id: number) {
    return this.posts.find(p => p.id === id) || null;
  }
}