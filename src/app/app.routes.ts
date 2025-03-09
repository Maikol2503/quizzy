import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { QuestionsComponent } from './questions/questions.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'questions/:id', component: QuestionsComponent },
    { path: 'fileUploader', component:FileUploaderComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' } 
];
