import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrgAdminMembersComponent } from './pages/org-admin-members/org-admin-members.component';
import { MyOrganizationsComponent } from './pages/my-organizations/my-organizations.component';

@NgModule({
  declarations: [
    OrgAdminMembersComponent,
    MyOrganizationsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OrganizationsRoutingModule,
  ],
})
export class OrganizationsModule {}
