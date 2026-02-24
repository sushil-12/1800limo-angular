import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
// import * as AWS from 'aws-sdk/global';
import * as S3 from "aws-sdk/clients/s3";

import { ErrorDialogService } from './error-dialog/errordialog.service';

@Injectable({
  providedIn: "root"
})
export class UploadService {
  id = environment.accessKeyId;
  key = environment.secretAccessKey;
  constructor(private errordialog: ErrorDialogService) { }
  async uploadFile(file: any) {
    const invalidExtensions = ['.xml', '.yml', '.yaml', '.json', '.js', '.sh', '.dll', '.bat', '.cmd', '.vbs', '.ps1', '.zip', '.rar', '.7z', '.html', '.phtml', '.htm', '.php', '.asp', '.aspx', '.py', '.rb', '.pl', '.cgi', '.jsp', '.jspx', '.css', '.scss', '.sass', '.less', '.ts', '.tsx', '.jsx', '.tsx', '.txt', '.exe', '.vue', '.svelte', '.svelte-kit', '.svelte-kit', '.svelte-kit'];
    const fileName = file.name ? file.name.toLowerCase() : '';
    const hasInvalidExtension = invalidExtensions.some((ext: string) => fileName.endsWith(ext));

    const invalidTypes = ['application/xml', 'text/xml', 'application/json', 'application/javascript', 'text/javascript', 'application/x-sh'];
    const hasInvalidType = invalidTypes.includes(file.type);

    if (hasInvalidExtension || hasInvalidType) {
      this.errordialog.openDialog({
        errors: {
          error: 'Uploading XML, JSON, or script files is not allowed.'
        }
      });
      throw new Error('Uploading XML, JSON, or script files is not allowed.');
    }

    let contentType = file.type;
    if (file.type == "") {
      contentType = "dcm";
    } else {
      contentType = file.type;
    }
    console.log("file", file, contentType)
    const bucket = new S3({
      accessKeyId: this.id,
      secretAccessKey: this.key,
      region: "us-east-2"
    });
    let params = {
      Bucket: "1800limo",
      Key: "file_" + new Date().getTime() + "." + contentType.split("/")[1],
      Body: file,
      // ACL: "public-read"
      // ContentType: contentType
    };

    let data = bucket.upload(params).promise();
    console.log("data", data)
    return data;
  }
}