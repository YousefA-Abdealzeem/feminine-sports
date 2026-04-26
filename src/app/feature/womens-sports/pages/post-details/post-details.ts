import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute , Router, RouterLink } from '@angular/router';
import { PostsService } from 'app/core/services/posts';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule , FormsModule , RouterLink],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails implements OnInit {



  private route = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private router = inject(Router);

  post: any = null;
  newComment = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.post = this.postsService.getPostById(id);
  }

  likePost() {
    if (!this.post) return;

    this.post.liked = !this.post.liked;
    this.post.likeCount += this.post.liked ? 1 : -1;
  }

  addComment() {
    if (!this.post) return;

    if (this.newComment.trim()) {
      this.post.comments.unshift({
        user: 'يوسف',
        text: this.newComment,
        date: 'الآن',
        img: 'https://i.pravatar.cc/50'
      });

      this.newComment = '';
    }
  }
}