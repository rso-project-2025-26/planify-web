import { Injectable, ComponentRef, ApplicationRef, Injector, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogComponentRef: ComponentRef<ConfirmDialogComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {}

  openConfirmDialog(config: DialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      // Create component
      this.dialogComponentRef = createComponent(ConfirmDialogComponent, {
        environmentInjector: this.environmentInjector
      });

      // Set inputs
      this.dialogComponentRef.instance.data = {
        title: config.title,
        message: config.message,
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        isDangerous: config.isDangerous || false
      };

      // Subscribe to outputs
      this.dialogComponentRef.instance.confirmed.subscribe(() => {
        this.closeDialog();
        resolve(true);
      });

      this.dialogComponentRef.instance.cancelled.subscribe(() => {
        this.closeDialog();
        resolve(false);
      });

      // Attach to DOM
      this.appRef.attachView(this.dialogComponentRef.hostView);
      const domElem = (this.dialogComponentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  private closeDialog(): void {
    if (this.dialogComponentRef) {
      this.appRef.detachView(this.dialogComponentRef.hostView);
      this.dialogComponentRef.destroy();
      this.dialogComponentRef = null;
    }
  }
}