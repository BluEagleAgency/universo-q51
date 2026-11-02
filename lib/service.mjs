import {createHash} from 'node:crypto';
import {validate,InputError} from './validation.mjs';
export async function register(body,{store,ip='local',secret='local-development-only',key=''}){
 const data=validate(body);if(!/^[a-f0-9-]{36}$/.test(key))throw new InputError('Atualize a página e tente novamente.');
 const digest=s=>createHash('sha256').update(s).digest('hex');
 return store.save({data,key,payloadHash:digest(JSON.stringify(data)),identity:digest(data.kind+':'+data.phone),emailIdentity:data.email?digest(data.kind+':'+data.email):null,ipHash:digest(secret+ip+new Date().toISOString().slice(0,10))});
}
