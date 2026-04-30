import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
// import * as AWS from 'aws-sdk/global';
import * as S3 from "aws-sdk/clients/s3";

import { ErrorDialogService } from './error-dialog/errordialog.service';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class UploadService {

  private serverUrl = environment.serverUrl;
  constructor(private errordialog: ErrorDialogService,private httpClient: HttpClient) { }
  
 async uploadFile(file: any) {
  const invalidExtensions = ['.xml', '.yml', '.yaml', '.json', '.js', '.sh', '.dll', '.bat', '.cmd', '.vbs', '.ps1', '.zip', '.rar', '.7z', '.html', '.phtml', '.htm', '.php', '.asp', '.aspx', '.py', '.rb', '.pl', '.cgi', '.jsp', '.jspx', '.css', '.scss', '.sass', '.less', '.ts', '.tsx', '.jsx', '.txt', '.exe', '.vue', '.svelte'];
  const fileName = file.name ? file.name.toLowerCase() : '';
  const hasInvalidExtension = invalidExtensions.some((ext: string) => fileName.endsWith(ext));
  const invalidTypes = ['application/xml', 'text/xml', 'application/json', 'application/javascript', 'text/javascript', 'application/x-sh'];
  const hasInvalidType = invalidTypes.includes(file.type);

  if (hasInvalidExtension || hasInvalidType) {
    this.errordialog.openDialog({ errors: { error: 'Uploading XML, JSON, or script files is not allowed.' } });
    throw new Error('Uploading XML, JSON, or script files is not allowed.');
  }

  // ── Fetch & decrypt credentials ─────────────────────────
  const res: any = await this.getAccessKey().toPromise();
  const creds = res.data[0];
  const secretKey = environment.encryptionKey; // your decryption secret

  const accessKeyId     = await this.decryptField(creds.sid, secretKey);
  const secretAccessKey = await this.decryptField(creds.auth_token, secretKey);

  console.log('Decrypted Access Key ID:', accessKeyId);
  console.log('Decrypted Secret Access Key:', secretAccessKey);
  // ────────────────────────────────────────────────────────

  const contentType = file.type || 'dcm';

  const bucket = new S3({
    accessKeyId,
    secretAccessKey,
    region: 'us-east-2'
  });

  const params = {
    Bucket: '1800limo',
    Key: 'file_' + new Date().getTime() + '.' + contentType.split('/')[1],
    Body: file,
  };

  return bucket.upload(params).promise();
}

private async decryptField(encryptedBase64: string, secretKey: string): Promise<string> {
  // Base64 → Uint8Array
  const raw = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // First 16 bytes = IV, rest = ciphertext
  const iv         = raw.slice(0, 16);
  const ciphertext = raw.slice(16);

  // SHA-256 hash of the secret key (matches PHP's hash('sha256', key))
  const keyMaterial = new TextEncoder().encode(secretKey);
  const hashBuffer  = await crypto.subtle.digest('SHA-256', keyMaterial);

  // Import as AES-CBC key
  const key = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  // Decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    ciphertext
  );

  console.log()

  return new TextDecoder().decode(decryptedBuffer);
 }

  getAccessKey() {
		return this.httpClient.get(`${this.serverUrl}get-encrypted-credentials?service=s3_bucket`);
	}

}