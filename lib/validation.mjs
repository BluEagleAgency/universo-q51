export class InputError extends Error {constructor(message,status=400){super(message);this.status=status}}
export function validate(body){
 if(!body||typeof body!=='object'||Array.isArray(body))throw new InputError('Cadastro inválido.');
 const kind=body.kind;if(!['founder','agent','clue'].includes(kind))throw new InputError('Escolha uma modalidade válida.');
 if(body.website)throw new InputError('Cadastro inválido.');if(body.consent!==true)throw new InputError('Autorize o uso dos dados para esta finalidade.');
 const text=(key,max,required=true)=>{const val=typeof body[key]==='string'?body[key].trim():'';if((required&&!val)||val.length>max||/[\x00-\x08\x0b-\x1f]/.test(val))throw new InputError('Verifique o campo '+key+'.');return val};
 let phone=text('phone',30).replace(/\D/g,'');if(phone.length===12||phone.length===13){if(!phone.startsWith('55'))throw new InputError('Informe um WhatsApp brasileiro com DDD.');phone=phone.slice(2)}if(!/^[1-9]{2}[2-9]\d{7,8}$/.test(phone))throw new InputError('Informe um WhatsApp válido com DDD.');
 const result={kind,phone:'55'+phone,consent:true,consentVersion:'2026-11-02',priority:body.priority===true,updates:body.updates===true};
 if(kind!=='clue'){result.name=text('name',100);if(result.name.length<2)throw new InputError('Informe seu nome completo.');result.email=text('email',180).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))throw new InputError('Verifique seu e-mail.');result.instagram=text('instagram',31).replace(/^@/,'');if(!/^[\w.]{1,30}$/.test(result.instagram))throw new InputError('Verifique seu Instagram.');}
 if(kind==='agent'){result.city=text('city',100);result.motivation=text('motivation',1200)}
 return result;
}
