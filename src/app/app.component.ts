import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from './shared/components/footer/footer.component';
import { NavComponent } from './shared/components/nav/nav.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavComponent, Footer, ChatComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
