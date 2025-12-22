import { Component, OnInit } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl,
	ValidationErrors,
} from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../auth/auth.service";
import { RegisterRequest, Organization } from "../../../../core/models/auth.model";

@Component({
	selector: "app-register",
	templateUrl: "./register.component.html",
	styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
	registerForm!: FormGroup;
	loading = false;
	errorMessage = "";
	showPassword = false;
	showConfirmPassword = false;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private http: HttpClient
	) {}

	ngOnInit(): void {
		this.initializeForm();
	}

	initializeForm(): void {
		this.registerForm = this.fb.group(
			{
				accountType: ["guest", [Validators.required]],
				// User fields
				firstName: ["", [Validators.required, Validators.minLength(2)]],
				lastName: ["", [Validators.required, Validators.minLength(2)]],
				email: ["", [Validators.required, Validators.email]],
				mobile: ["", [Validators.pattern(/^[0-9+\-()\s]{7,20}$/)]],
				consentSms: [false],
				consentEmail: [false],
				username: [
					"",
					[
						Validators.required,
						Validators.minLength(3),
						Validators.pattern(/^[a-zA-Z0-9_-]+$/),
					],
				],
				// Common fields
				password: [
					"",
					[
						Validators.required,
						Validators.minLength(8),
						this.passwordStrengthValidator,
					],
				],
				confirmPassword: ["", [Validators.required]],
				// Organization fields
				orgName: [""],
				orgSlug: [""],
				orgBusiness: [false],
				orgDescriptiona: [""],
				orgEmail: [""],
			},
			{
				validators: this.passwordMatchValidator,
			}
		);

		// Dynamically adjust validators based on account type
		this.registerForm.get("accountType")?.valueChanges.subscribe((type) => {
			this.updateValidators(type);
		});
		// Initialize validators for default state
		this.updateValidators(this.registerForm.get("accountType")?.value);
	}

	private updateValidators(type: "guest" | "organization"): void {
		const userControls = ["firstName", "lastName", "email", "username", "mobile"] as const;
		const orgControls = ["orgName", "orgSlug", "orgEmail", "orgBusiness", "orgDescriptiona"] as const;

		// User validators
		if (type === "guest") {
			this.registerForm.get("firstName")?.setValidators([Validators.required, Validators.minLength(2)]);
			this.registerForm.get("lastName")?.setValidators([Validators.required, Validators.minLength(2)]);
			this.registerForm.get("email")?.setValidators([Validators.required, Validators.email]);
			this.registerForm.get("username")?.setValidators([Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]);
			this.registerForm.get("mobile")?.setValidators([Validators.pattern(/^[0-9+\-()\s]{7,20}$/)]);

			// Clear org validators
			this.registerForm.get("orgName")?.clearValidators();
			this.registerForm.get("orgSlug")?.clearValidators();
			this.registerForm.get("orgEmail")?.clearValidators();
		} else {
			// Clear user validators
			this.registerForm.get("firstName")?.clearValidators();
			this.registerForm.get("lastName")?.clearValidators();
			this.registerForm.get("email")?.clearValidators();
			this.registerForm.get("username")?.clearValidators();
			this.registerForm.get("mobile")?.clearValidators();

			// Set org validators
			this.registerForm.get("orgName")?.setValidators([Validators.required, Validators.minLength(2)]);
			this.registerForm.get("orgSlug")?.setValidators([Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]);
			this.registerForm.get("orgEmail")?.setValidators([Validators.required, Validators.email]);
		}

		// Update validity
		[...userControls, ...orgControls, "password", "confirmPassword" as const].forEach((c) => {
			this.registerForm.get(c as string)?.updateValueAndValidity({ emitEvent: false });
		});
	}

	/**
	 * Custom validator for password strength
	 */
	passwordStrengthValidator(
		control: AbstractControl
	): ValidationErrors | null {
		const value = control.value;
		if (!value) {
			return null;
		}

		const hasUpperCase = /[A-Z]/.test(value);
		const hasLowerCase = /[a-z]/.test(value);
		const hasNumeric = /[0-9]/.test(value);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

		const passwordValid =
			hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

		return !passwordValid ? { passwordStrength: true } : null;
	}

	/**
	 * Custom validator to check if passwords match
	 */
	passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.get("password");
		const confirmPassword = control.get("confirmPassword");

		if (!password || !confirmPassword) {
			return null;
		}

		return password.value === confirmPassword.value
			? null
			: { passwordMismatch: true };
	}

	/**
	 * Toggle password visibility
	 */
	togglePasswordVisibility(field: "password" | "confirmPassword"): void {
		if (field === "password") {
			this.showPassword = !this.showPassword;
		} else {
			this.showConfirmPassword = !this.showConfirmPassword;
		}
	}

	/**
	 * Get form control for template access
	 */
	get f() {
		return this.registerForm.controls;
	}

	/**
	 * Check if field has error
	 */
	hasError(fieldName: string, errorType: string): boolean {
		const field = this.registerForm.get(fieldName);
		return !!(
			field &&
			field.hasError(errorType) &&
			(field.dirty || field.touched)
		);
	}

	/**
	 * Get password strength level
	 */
	getPasswordStrength(): { level: string; width: string; color: string } {
		const password = this.registerForm.get("password")?.value || "";

		if (password.length === 0) {
			return { level: "", width: "0%", color: "" };
		}

		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

		if (strength <= 2) {
			return { level: "Weak", width: "33%", color: "#ef4444" };
		} else if (strength <= 4) {
			return { level: "Medium", width: "66%", color: "#f59e0b" };
		} else {
			return { level: "Strong", width: "100%", color: "#10b981" };
		}
	}

	/**
	 * Handle form submission
	 */
	onSubmit(): void {
		if (this.registerForm.invalid) {
			// Mark all fields as touched to show validation errors
			Object.keys(this.registerForm.controls).forEach((key) => {
				this.registerForm.get(key)?.markAsTouched();
			});
			return;
		}

		this.loading = true;
		this.errorMessage = "";

		const accountType = this.registerForm.value.accountType;

		if (accountType === "organization") {
			// Build organization payload
			const orgPayload: Organization = {
				name: this.registerForm.value.orgName,
				slug: this.registerForm.value.orgSlug,
				business: !!this.registerForm.value.orgBusiness,
				descriptiona: this.registerForm.value.orgDescriptiona || "",
				email: this.registerForm.value.orgEmail,
				password: this.registerForm.value.password,
			};

			this.http.post("/api/organizations", orgPayload).subscribe({
				next: (response) => {
					console.log("Organization created:", response);
					alert(`Organization created successfully! You can now login with admin user ${orgPayload.slug}_admin.`);
					this.router.navigate(["/auth/login"]);
				},
				error: (error) => {
					console.error("Organization creation error:", error);
					this.loading = false;
					this.errorMessage = error.error?.message || "Failed to create organization.";
				},
				complete: () => {
					this.loading = false;
				},
			});
			return;
		} else {
      	// Default: user registration (guest)
		const registerRequest: RegisterRequest = {
			firstName: this.registerForm.value.firstName,
			lastName: this.registerForm.value.lastName,
			email: this.registerForm.value.email,
			username: this.registerForm.value.username,
			password: this.registerForm.value.password,
			mobile: this.registerForm.value.mobile || undefined,
			role: this.registerForm.value.accountType === "gost" ? "gost" : undefined,
      		consentSms: this.registerForm.value.consentSms,
      		consentEmail: this.registerForm.value.consentEmail,
		};

		this.authService.register(registerRequest).subscribe({
			next: (response) => {
				console.log("Registration successful:", response);
				alert(`Registration successful! Your username is ${registerRequest.username}. Please log in with Keycloak.`);
				this.router.navigate(["/auth/login"]);
			},
			error: (error) => {
				console.error("Registration error:", error);
				this.loading = false;
				if (error.status === 400) {
					this.errorMessage = error.error?.message || "Invalid registration data. Please check your inputs.";
				} else if (error.status === 409) {
					this.errorMessage = "Username or email already exists. Please choose different ones.";
				} else {
					this.errorMessage = "Registration failed. Please try again later.";
				}
			},
			complete: () => {
				this.loading = false;
			},
		});
    }
	}

	/**
	 * Navigate to login page
	 */
	goToLogin(): void {
		this.router.navigate(["/login"]);
	}
}
