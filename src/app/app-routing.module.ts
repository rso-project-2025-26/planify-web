import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
	{
		path: "",
		redirectTo: "/events/public",
		pathMatch: "full",
	},
	{
		path: "dashboard",
		loadChildren: () =>
			import("./features/dashboard/dashboard.module").then(
				(m) => m.DashboardModule
			),
	},
 {
    path: "events",
    loadChildren: () =>
      import("./features/events/events.module").then(
        (m) => m.EventsModule
      ),
  },
  {
    path: "organizations",
    loadChildren: () =>
      import("./features/organizations/organizations.module").then(
        (m) => m.OrganizationsModule
      ),
  },
	{
		path: "auth",
		loadChildren: () =>
			import("./features/auth/auth.module").then((m) => m.AuthModule),
	},
	{
		path: "**",
		redirectTo: "/events/public",
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
