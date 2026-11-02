import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {InputError} from './validation.mjs';
export function localStore(path){mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS registrations(id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, identity TEXT UNIQUE NOT NULL, email_identity TEXT UNIQUE, request_key TEXT UNIQUE NOT NULL, payload_hash TEXT NOT NULL, data TEXT NOT NULL, credential TEXT UNIQUE, created_at TEXT DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS limits(hash TEXT PRIMARY KEY,hits INTEGER NOT NULL);`);
 return {db,save:async x=>{db.exec('BEGIN IMMEDIATE');try{
 const prev=db.prepare('SELECT payload_hash,data,credential FROM registrations WHERE request_key=?').get(x.key);if(prev){if(prev.payload_hash!==x.payloadHash)throw new InputError('Identificador já utilizado. Atualize a página.',409);db.exec('COMMIT');return response(JSON.parse(prev.data),prev.credential)}
 const limit=db.prepare('INSERT INTO limits(hash,hits) VALUES(?,1) ON CONFLICT(hash) DO UPDATE SET hits=hits+1 RETURNING hits').get(x.ipHash);if(limit.hits>20)throw new InputError('Limite de tentativas atingido. Tente novamente amanhã.',429);
 if(db.prepare('SELECT id FROM registrations WHERE identity=? OR email_identity=?').get(x.identity,x.emailIdentity))throw new InputError('Já existe um cadastro nesta modalidade com este WhatsApp ou e-mail. Fale com o projeto para consultar sua inscrição.',409);
 let credential=null;if(x.data.kind==='founder'){const n=Number(db.prepare("SELECT COUNT(*) AS n FROM registrations WHERE kind='founder'").get().n)+1;if(n>9999)throw new InputError('Credenciamento temporariamente encerrado.',409);credential='#U51-FND-'+String(n).padStart(4,'0')}
 db.prepare('INSERT INTO registrations(kind,identity,email_identity,request_key,payload_hash,data,credential) VALUES(?,?,?,?,?,?,?)').run(x.data.kind,x.identity,x.emailIdentity,x.key,x.payloadHash,JSON.stringify(x.data),credential);db.exec('COMMIT');return response(x.data,credential)
 }catch(e){db.exec('ROLLBACK');throw e}},close:()=>db.close()};
}
export function response(data,credential){return data.kind==='founder'?{ok:true,name:data.name,credential,priority:data.priority}:{ok:true}}
