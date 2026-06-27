import { Injectable, ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GloabalErrorHandlerService implements ErrorHandler {

  constructor() { }
  handleError(error: any): void {
    // Surface every Angular error so it shows up in the browser console AND in the
    // on-screen debug overlay (which intercepts console.error). Previously this handler
    // silently swallowed non-chunk errors, so runtime/CD errors on the homepage never
    // appeared anywhere — making the debug panel look empty ("DBG 0").
    console.error('[Angular ErrorHandler]', error);

    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (chunkFailedMessage.test(error?.message)) {
      if (confirm("New version available. Load New Version?")) {
        window.location.reload();
      }
    }
  }

}
