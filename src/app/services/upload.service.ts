import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
// import * as AWS from 'aws-sdk/global';
import * as S3 from "aws-sdk/clients/s3";

@Injectable({
  providedIn: "root"
})
export class UploadService {
  id = environment.accessKeyId;
  key = environment.secretAccessKey;
  constructor() { }
  async uploadFile(file) {
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
    console.log("data",data)
    return data;
  }
}