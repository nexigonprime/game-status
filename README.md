# Server Status Checker V1.0

O **Server Status Checker** é uma ferramenta poderosa para monitoramento de servidores de jogos. Ele exibe informações detalhadas sobre o status de servidores, como IP, porta, status (online/offline), jogadores online, ping e outros detalhes importantes. Além disso, o sistema permite a integração com o **Discord**, enviando atualizações automáticas de status para um canal específico via webhooks.

## Funcionalidades

- **Monitoramento de Servidores de Jogos**: Verifique servidores de diferentes jogos, como Minecraft, CS:GO, Valheim e muitos outros.
- **Informações Detalhadas**: Obtenha dados como número de jogadores, ping, status (online/offline) e jogadores conectados.
- **Integração com Discord**: Receba atualizações automáticas de status diretamente em seu canal Discord via webhooks.
- **Interface Web para Gerenciamento**: Permita que os usuários adicionem servidores manualmente e visualizem seu status em tempo real.

## Tecnologias Usadas

- **Node.js**: Plataforma de desenvolvimento para o backend.
- **Express**: Framework para construir o servidor e gerenciar rotas.
- **GameDig**: Biblioteca para consultar o status de servidores de jogos como Minecraft, CS:GO, Valheim, entre outros.
- **Discord Webhooks**: Para enviar atualizações de status para canais no Discord.
- **HTML, CSS, JavaScript**: Para a construção da interface web.
- **File System (fs)**: Para armazenar configurações de servidores e cache localmente.

## Arquitetura do Projeto

### **Arquivos Principais**

#### **`server.js`**
Controla o servidor web e gerencia as rotas. As principais funções incluem:
- **Carregar e salvar servidores**: Armazena os servidores em um arquivo `servers.json`.
- **Gerenciar cache de status**: O cache de status dos servidores é atualizado periodicamente.
- **Rota `/add-server`**: Permite adicionar novos servidores ao sistema e atualizar seu status.
- **Rota `/remaining-time`**: Retorna o tempo restante para a próxima atualização de status.
- **Notificações para Discord**: Envia atualizações para o Discord via webhook quando o status de um servidor é alterado.

#### **`dig.js`**
Este arquivo é responsável pela consulta do status dos servidores utilizando a biblioteca **GameDig**. As principais funções incluem:
- **`getCachedServerStatuses`**: Recebe uma lista de servidores e consulta o status (online, ping, jogadores, etc.).
- **`addServer`**: Adiciona novos servidores à lista de monitoramento.

#### **`discordWebhook.js`**
Envia atualizações de status dos servidores para o Discord. A principal função é:
- **`sendToDiscord`**: Envia uma mensagem formatada com as informações de status do servidor para o Discord.

#### **`public/index.html`**
A interface web onde os usuários interagem com o sistema. As principais funcionalidades são:
- **Exibição de Status**: Mostra informações como IP, porta, tipo de jogo, número de jogadores, e status (online/offline).
- **Adicionar Servidores**: Permite adicionar servidores com IP, porta, tipo de jogo e webhook do Discord.
- **Contagem Regressiva**: Exibe o tempo restante até a próxima atualização.

#### **`public/users.json`**
Armazena as credenciais dos usuários para autenticação. Contém um array de usuários com nome de usuário e senha.

#### **`servers.json`**
Armazena a lista de servidores monitorados, incluindo informações como IP, porta, tipo de jogo e webhook do Discord.

#### **`cache.json`**
Armazena o status mais recente dos servidores, incluindo o número de jogadores, ping, status (online/offline), entre outros detalhes.

## Como Executar

1. **baixe o arquivo**:
    
    **versão para baixar as releases**: [download](https://github.com/nexigonprime/game-status/releases/tag/server_status_1.0)

    ou
    
    ```bash
    curl https://file.gamerdesk.xyz/statusV1
    ```

---

2. **Instale as Dependências**:
    Navegue até o diretório do projeto e instale as dependências:
    ```bash
    npm install
    ```

---

3. **Inicie o Servidor**:
    Após instalar as dependências, inicie o servidor com o seguinte comando:
    ```bash
    npm start
    ```

---

4. **Acesse a Aplicação**:
    Abra o navegador e vá para o endereço [http://localhost:3000](http://localhost:3000) para visualizar a interface do sistema.

## Como Adicionar um Servidor

1. Na página principal, preencha os seguintes campos:
   - **IP do Servidor**: O IP do servidor a ser monitorado.
   - **Porta**: A porta do servidor.
   - **Tipo de Jogo**: Escolha entre Minecraft, CS:GO, Valheim entre outros.
   - **Webhook do Discord**: A URL do webhook para enviar notificações para o Discord.

2. Após preencher os campos, clique em **Adicionar Servidor**. O servidor será adicionado à lista de servidores monitorados.

![server-List](https://prnt.sc/KM9BAzJZ36L3)


## Jogos Compatíveis com GameDig

O **GameDig** suporta uma ampla variedade de jogos. Abaixo estão alguns dos jogos compatíveis:

- Minecraft
- CS:GO (Counter-Strike: Global Offensive)
- Valheim
- ARK: Survival Evolved
- Fortnite
- PUBG (PlayerUnknown's Battlegrounds)
- Rust
- Team Fortress 2
- Left 4 Dead 2
- Garry's Mod
- DOOM (2016)
- Counter-Strike 1.6
- Battlefield
- Conan Exiles
- 7 Days to Die
- Minecraft PE (Pocket Edition)
- Unturned
- Quake Live
- Factorio
- H1Z1

Se o jogo que você deseja monitorar não estiver na lista, você pode verificar a documentação do **GameDig** para mais informações sobre a compatibilidade com outros jogos.

**Documentação do [gamedig](https://www.npmjs.com/package/gamedig)**
**Gamedig games [list](https://github.com/gamedig/node-gamedig/blob/HEAD/GAMES_LIST.md)**
---

**Desenvolvido por [nexigonprime](https://github.com/nexigonprime)**
