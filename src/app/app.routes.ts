import { Routes } from '@angular/router';

import { Hero }           from './feature/womens-sports/pages/hero/hero';
import { About }          from './feature/womens-sports/pages/about/about';
import { Terms }          from './feature/womens-sports/pages/terms/terms';
import { Contact }        from './feature/womens-sports/pages/contact/contact';
import { Profile }        from './feature/womens-sports/pages/profile/profile';
import { PostDetails }    from './feature/womens-sports/pages/post-details/post-details';
import { Login }          from './feature/womens-sports/pages/login/login';
import { Register }       from './feature/womens-sports/pages/register/register';
import { ForgotPassword } from './feature/womens-sports/pages/forgot-password/forgot-password';
import { Layout }         from './layout/layout';
import { LoadingScreen }  from './feature/womens-sports/pages/loading-screen/loading-screen';

import { LoginDashboard }    from './feature/womens-sports/login-dashboard/login-dashboard';
import { DashboardLayout }   from './feature/womens-sports/dashboard/dashboard-layout/dashboard-layout';
import { DashboardHome }     from './feature/womens-sports/dashboard/dashboard-home/dashboard-home';
import { DashboardPosts }    from './feature/womens-sports/dashboard/dashboard-posts/dashboard-posts';
import { DashboardUsers }    from './feature/womens-sports/dashboard/dashboard-users/dashboard-users';
import { DashboardComments } from './feature/womens-sports/dashboard/dashboard-comments/dashboard-comments';
import { DashboardSettings } from './feature/womens-sports/dashboard/dashboard-settings/dashboard-settings';

export const routes: Routes = [

  { path: '', component: LoadingScreen },

  { path: 'login',           component: Login          },
  { path: 'register',        component: Register       },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'login-dashboard', component: LoginDashboard },

  {
    path: '',
    component: Layout,
    children: [
      { path: 'hero',         component: Hero        },
      { path: 'post/:id',     component: PostDetails },
      { path: 'about',        component: About       },
      { path: 'terms',        component: Terms       },
      { path: 'contact',      component: Contact     },
      { path: 'profile',      component: Profile     },
      { path: 'post-details', component: PostDetails },
    ]
  },

  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      { path: '',         component: DashboardHome     },
      { path: 'posts',    component: DashboardPosts    },
      { path: 'users',    component: DashboardUsers    },
      { path: 'comments', component: DashboardComments },
      { path: 'settings', component: DashboardSettings },
    ]
  },

  { path: '**', redirectTo: '' },
];
