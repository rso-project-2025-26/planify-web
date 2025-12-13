import { Component } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  appName = environment.appName;
  version = environment.version;
  constructor(public auth: AuthService) {}
}
