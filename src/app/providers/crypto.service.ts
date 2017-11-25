import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class CryptoService {
  cryptoError$ = new Subject<string>()
  
  constructor() {}

  async aesGcmEncrypt(plaintext, password) {
    const pwUtf8 = new TextEncoder().encode(password);                                 // encode password as UTF-8
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);                      // hash the password
    const iv = crypto.getRandomValues(new Uint8Array(12));                             // get 96-bit random iv
    const alg = { name: 'AES-GCM', iv: iv };                                           // specify algorithm to use
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']); // generate key from pw
    const ptUint8 = new TextEncoder().encode(plaintext);                               // encode plaintext as UTF-8
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);                   // encrypt plaintext using key
    const ctArray = Array.from(new Uint8Array(ctBuffer));                              // ciphertext as byte array
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');             // ciphertext as string
    const ctBase64 = btoa(ctStr);                                                      // encode ciphertext as base64
    const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join(''); // iv as hex string
    return ivHex+ctBase64;                                                             // return iv+ciphertext
  }
  
  async aesGcmDecrypt(ciphertext, password) {
    const pwUtf8 = new TextEncoder().encode(password);                                 // encode password as UTF-8
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);                      // hash the password
    let iv = []
    for(let i=0;i<24;i=i+2){iv.push(parseInt(ciphertext.slice(i,i+2),16))}
    const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };                           // specify algorithm to use
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']); // use pw to generate key
    const ctStr = atob(ciphertext.slice(24));                                          // decode base64 ciphertext
    let ctArr=[]
    for(let i=0;i<ctStr.length;i++){ctArr.push(ctStr.charCodeAt(i))}
    let ctUint8 = Uint8Array.from(ctArr)
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);                // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer);                           // decode password from UTF-8
    return plaintext;                                                                  // return the plaintext
  }

  scorePassword(pass) {
    let score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    let letters = new Object();
    for (let i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    let variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    let variationCount = 0;
    for (let check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return score;
  }

  checkPasswordStrength(pass) {
    let score = this.scorePassword(pass);
    if (score > 80)
        return "very strong";
    if (score > 60)
        return "strong";
    if (score >= 40)
        return "average";
    if (score >= 25)
        return "weak";

    return "too short";
  }

}
