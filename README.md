# Privacy Guardian - Extensão Firefox - TecHack

### Rodrigo Paoliello de Medeiros

## Descrição

**Privacy Guardian** é uma extensão para o navegador Firefox que detecta ameaças à privacidade e ataques durante a navegação na web. Esta ferramenta visa identificar conexões a domínios de terceiros, analisar o uso de cookies e armazenamento local, detectar técnicas de fingerprinting e invasões (browser hijacking), além de calcular uma pontuação de privacidade para cada sessão.

## Funcionalidades

- **Detecção de Conexões de Terceiros**: A extensão identifica e conta quantas conexões a domínios de terceiros ocorrem durante a navegação em uma página.
- **Monitoramento de Cookies**: Analisa os cookies injetados, diferenciando entre cookies de primeira e terceira parte, cookies de sessão e persistentes, além de detectar supercookies.
- **Detecção de Armazenamento Local**: Detecta se o site está utilizando localStorage no navegador do usuário.
- **Sincronização de Cookies**: Verifica se os cookies estão sendo sincronizados com outros serviços.
- **Detecção de Browser Hijacking**: Verifica tentativas de sequestro do navegador, como mudanças não autorizadas de configuração ou injeção de scripts maliciosos.
- **Detecção de Canvas Fingerprinting**: A extensão detecta se o site está utilizando fingerprinting de canvas para coletar informações do usuário de forma furtiva.
- **Pontuação de Privacidade**: A extensão calcula uma pontuação de privacidade baseada em diferentes critérios, como o número de conexões de terceiros, cookies, e detecções de fingerprinting ou hijacking.

## Como Funciona

1. A extensão monitora as conexões e interações feitas pelo navegador com terceiros e coleta dados sobre cookies, armazenamento local e técnicas de fingerprinting.
2. Utiliza escutas de eventos de rede e scripts injetados nas páginas para detectar ameaças.
3. A pontuação de privacidade é calculada com base nos riscos identificados, sendo exibida em uma interface simples para o usuário.

## Como Instalar

1. Clone o repositório para sua máquina local:
   ```bash
   git clone https://github.com/usuario/privacy-guardian.git
   ```
2. Abra o Firefox e acesse `about:debugging`.
3. Clique em "This Firefox" (ou "Este Firefox").
4. Clique em "Load Temporary Add-on" (ou "Carregar Extensão Temporária").
5. Selecione o arquivo `manifest.json` do diretório onde o repositório foi clonado.

## Pontuação de Privacidade

A pontuação de privacidade é calculada com base em diversos fatores como:

- Número de conexões a domínios de terceiros.
- Quantidade e tipos de cookies.
- Detecção de fingerprinting e hijacking.
- Uso de armazenamento local.

O score vai de 0 a 100, onde 100 indica máxima privacidade e 0 indica um alto risco de violação.
