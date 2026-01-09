import { NgModule, inject } from '@angular/core';
import { CanActivateFn, Router, RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../auth/auth.guard';
import { OrgAdminMembersComponent } from './pages/org-admin-members/org-admin-members.component';
import { MyOrganizationsComponent } from './pages/my-organizations/my-organizations.component';
import { AuthService } from '../../auth/auth.service';
import { map } from 'rxjs';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'admin',
        canActivate: [authGuard(['org_admin'])],
        component: OrgAdminMembersComponent,
      },
      {
        path: 'my',
        canActivate: [authGuard(['uporabnik'])],
        component: MyOrganizationsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}