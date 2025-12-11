import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMenuOpen = false;
  isDark = false;
  private storageKey = 'theme';

  constructor(private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'dark') {
      this.setDark(true);
    } else if (saved === 'light') {
      this.setDark(false);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDark(prefersDark);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMenuOpen = false;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleTheme() {
    this.setDark(!this.isDark);
  }

  private setDark(shouldBeDark: boolean) {
    this.isDark = shouldBeDark;
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark-theme');
      localStorage.setItem(this.storageKey, 'dark');
    } else {
      root.classList.remove('dark-theme');
      localStorage.setItem(this.storageKey, 'light');
    }
  }
}
