# 🌐 Configuração DNS - calculateur.moovelabs.com

## 📋 Status Atual

✅ **Domínio**: `calculateur.moovelabs.com`
✅ **DNS Provider**: Cloudflare
✅ **Registro A**: 72.62.36.167 (Hostinger)
✅ **TTL**: 5 minutos

---

## 🔄 Atualização para Easypanel

### Passo 1: Obter IP do Easypanel
Após configurar o projeto no Easypanel, você receberá o IP do servidor.

### Passo 2: Atualizar DNS no Cloudflare
1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecione o domínio `moovelabs.com`
3. Vá em **DNS** → **Records**
4. Encontre o registro:
   ```
   Type: A
   Name: calculateur
   Content: 72.62.36.167 (atual - Hostinger)
   ```

5. Clique em **Edit** e altere para:
   ```
   Type: A
   Name: calculateur
   Content: [IP_DO_EASYPANEL]
   TTL: Auto (ou 5 min)
   Proxy status: DNS only (nuvem cinza)
   ```

### Passo 3: Verificar Propagação
```bash
# Verificar DNS
nslookup calculateur.moovelabs.com

# Ou use ferramentas online:
# - https://dnschecker.org/
# - https://mxtoolbox.com/SuperTool.aspx
```

---

## ⚙️ Configuração no Easypanel

### 1. Adicionar Domínio Personalizado
No painel do Easypanel:
1. Vá em **Settings** → **Domains**
2. Adicione: `calculateur.moovelabs.com`
3. O Easypanel configurará automaticamente:
   - ✅ SSL Certificate (Let's Encrypt)
   - ✅ HTTPS redirect
   - ✅ Load balancing (se aplicável)

### 2. Variáveis de Ambiente
```env
NEXT_PUBLIC_APP_URL=https://calculateur.moovelabs.com
```

---

## 🔍 Troubleshooting

### DNS não atualiza
- **TTL baixo**: 5 min (já configurado ✅)
- **Limpar cache**: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)
- **Verificar propagação**: Use ferramentas online

### SSL não funciona
- Aguardar 5-10 minutos após configurar domínio
- Verificar se DNS aponta corretamente
- Let's Encrypt pode demorar alguns minutos

### App não carrega
1. Verificar se aplicação está rodando no Easypanel
2. Verificar logs do container
3. Verificar variáveis de ambiente
4. Testar com IP direto primeiro

---

## 📞 Suporte

- **Cloudflare DNS**: [Cloudflare Support](https://support.cloudflare.com/)
- **Easypanel**: [Documentação](https://easypanel.io/docs)

---

**Última atualização**: Dezembro 2025