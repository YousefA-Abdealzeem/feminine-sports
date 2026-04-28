import { Routes } from '@angular/router';

import { Hero } from './feature/womens-sports/pages/hero/hero';
import { About } from './feature/womens-sports/pages/about/about';
import { Terms } from './feature/womens-sports/pages/terms/terms';
import { Contact } from './feature/womens-sports/pages/contact/contact';
import { Profile } from './feature/womens-sports/pages/profile/profile';
import { PostDetails } from './feature/womens-sports/pages/post-details/post-details';
import { Login } from './feature/womens-sports/pages/login/login';
import { Register } from './feature/womens-sports/pages/register/register';
import { Layout } from './layout/layout';
import { LoadingScreen } from './feature/womens-sports/pages/loading-screen/loading-screen';




export const routes: Routes = [

  { path: '', component: LoadingScreen },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    component: Layout,
    children: [
      { path: 'hero', component: Hero },
      { path: 'post/:id', component: PostDetails },
      { path: 'about', component: About },
      { path: 'terms', component: Terms },
      { path: 'contact', component: Contact },
      { path: 'profile', component: Profile },
      { path: 'post-details', component: PostDetails },
    ]
  },

  { path: '**', redirectTo: '' },

];