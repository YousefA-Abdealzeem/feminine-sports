import { Routes } from '@angular/router';
import { Hero } from './feature/womens-sports/pages/hero/hero';
import { About } from './feature/womens-sports/pages/about/about';
import { Terms } from './feature/womens-sports/pages/terms/terms';
import { Contact } from './feature/womens-sports/pages/contact/contact';
import { Profile } from './feature/womens-sports/pages/profile/profile';
import { PostDetails } from './feature/womens-sports/pages/post-details/post-details';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'register',
        redirectTo: 'register',
        pathMatch: 'full',
    },
    {
        path: 'hero',
        component:Hero,
        title: 'Home',

    },
    {
        path: 'about',
        component:About,
        title: 'About Us ',

    },
    {
        path: 'terms',
        component:Terms,
        title: 'Terms',

    },
    {
        path: 'contact',
        component:Contact,
        title: 'Contact Us',

    },
    {
        path: 'profile',
        component:Profile,
        title: 'Profile',

    },
    {
        path: 'post-details',
        component:PostDetails,
        title: 'Post Details',

    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',

    },


];
