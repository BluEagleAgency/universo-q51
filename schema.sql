-- Executar uma vez no SQL Editor de um projeto Supabase vazio para esta plataforma.
-- Acesso somente pelo servidor com service_role. Nunca expor essa chave no navegador.
create table if not exists public.q51_registrations (
 id bigint generated always as identity primary key,
 kind text not null check (kind in ('founder','agent','clue')),
 identity_hash text not null unique,
 email_identity_hash text unique,
 request_key uuid not null unique,
 payload_hash text not null,
 data jsonb not null,
 credential text unique,
 created_at timestamptz not null default now()
);
create table if not exists public.q51_limits (
 hash text primary key, hits integer not null, created_at timestamptz not null default now()
);
create sequence if not exists public.q51_founder_sequence maxvalue 9999 no cycle;
alter table public.q51_registrations enable row level security;
alter table public.q51_limits enable row level security;
revoke all on public.q51_registrations, public.q51_limits from anon, authenticated;
create or replace function public.q51_register(p_data jsonb,p_key uuid,p_payload_hash text,p_identity text,p_email_identity text,p_ip_hash text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare old_record public.q51_registrations; n integer; cred text; result jsonb;
begin
 -- Serializa também repetições concorrentes de uma mesma chave.
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into old_record from public.q51_registrations where request_key=p_key;
 if found then
   if old_record.payload_hash<>p_payload_hash then return jsonb_build_object('error','Identificador já utilizado. Atualize a página.','status',409); end if;
   if old_record.kind='founder' then return jsonb_build_object('ok',true,'name',old_record.data->>'name','credential',old_record.credential,'priority',old_record.data->'priority'); end if;
   return jsonb_build_object('ok',true);
 end if;
 insert into public.q51_limits(hash,hits) values(p_ip_hash,1) on conflict(hash) do update set hits=q51_limits.hits+1 returning hits into n;
 if n>20 then return jsonb_build_object('error','Limite de tentativas atingido. Tente novamente amanhã.','status',429); end if;
 if exists(select 1 from public.q51_registrations where identity_hash=p_identity or email_identity_hash=p_email_identity) then return jsonb_build_object('error','Já existe cadastro nesta modalidade com este WhatsApp ou e-mail. Fale com o projeto.','status',409);end if;
 if p_data->>'kind'='founder' then
   begin n:=nextval('public.q51_founder_sequence'); exception when sequence_generator_limit_exceeded then return jsonb_build_object('error','Credenciamento temporariamente encerrado.','status',409);end;
   cred:='#U51-FND-'||lpad(n::text,4,'0');
 end if;
 insert into public.q51_registrations(kind,identity_hash,email_identity_hash,request_key,payload_hash,data,credential) values(p_data->>'kind',p_identity,p_email_identity,p_key,p_payload_hash,p_data,cred);
 if p_data->>'kind'='founder' then return jsonb_build_object('ok',true,'name',p_data->>'name','credential',cred,'priority',p_data->'priority');end if;
 return jsonb_build_object('ok',true);
end;$$;
revoke all on function public.q51_register(jsonb,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.q51_register(jsonb,uuid,text,text,text,text) to service_role;
-- Rotina de manutenção: remover hashes de limite com mais de 2 dias.
-- delete from public.q51_limits where created_at < now()-interval '2 days';
