import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class ReCaptchaService {
  private siteKey: string = (environment as any).recaptchaEnterpriseKey;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    console.log('[reCAPTCHA] Service initialized. Site key:', this.siteKey);
    this.loadScript();
  }

  private loadScript(): void {
    if (this.document.querySelector('#recaptcha-enterprise-script')) {
      console.log('[reCAPTCHA] Script already loaded, skipping.');
      return;
    }
    const scriptSrc = `https://www.google.com/recaptcha/enterprise.js?render=${this.siteKey}`;
    console.log('[reCAPTCHA] Loading Enterprise script:', scriptSrc);
    const script = this.document.createElement('script');
    script.id = 'recaptcha-enterprise-script';
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => console.log('[reCAPTCHA] Script loaded successfully.');
    script.onerror = (err) => console.error('[reCAPTCHA] Script failed to load:', err);
    this.document.head.appendChild(script);
  }

  public execute(action: string): Promise<string> {
    console.log('[reCAPTCHA] Executing for action:', action);
    return new Promise((resolve, reject) => {
      grecaptcha.enterprise.ready(() => {
        console.log('[reCAPTCHA] Enterprise ready, calling execute...');
        grecaptcha.enterprise.execute(this.siteKey, { action })
          .then((token: string) => {
            console.log('[reCAPTCHA] Token received:', token ? token.substring(0, 20) + '...' : 'EMPTY');
            resolve(token);
          })
          .catch((err: any) => {
            console.error('[reCAPTCHA] Execute failed:', err);
            reject(err);
          });
      });
    });
  }
}
