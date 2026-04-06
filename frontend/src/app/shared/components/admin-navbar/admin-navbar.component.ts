import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  isScrolled: boolean = false;
  initials: string = 'AD'; // default

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnInit() {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        const fName = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
        const lName = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
        this.initials = fName + lName || 'US';
      } catch (e) {
        this.initials = 'US';
      }
    }
  }
}
