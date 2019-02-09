const Discord = require("discord.js");
const client = new Discord.Client();
const {get} = require ("snekfetch");
const low = require("lowdb");
const FileSync = require('lowdb/adapters/FileSync');
const settings = require("./settings.json");
const DBL = require("dblapi.js");
const dbl = new DBL(process.env.DBL, client);
const Client = new Discord.Client();

const adapter = new FileSync('database.json');
const db = low(adapter);

db.defaults({ histoires: [], xp: []}).write();
var prefix = "ub!!";
client.login(process.env.TOKEN);

// Optional events
dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})

client.on('message', message => {
    var msgauthor = message.author.id;

    if(message.author.bot)return;

    if(!db.get("xp").find({user: msgauthor}).value()){
      db.get("xp").push({user: msgauthor, xp: 1}).write();
    }else{
      var userxpdb = db.get("xp").filter({user: msgauthor}).find('xp').value();
      console.log(userxpdb);
      var userxp = Object.values(userxpdb)
      console.log(userxpdb);
      console.log(`Nombre D'xp: ${userxp[1]}`)

      db.get("xp").find({user: msgauthor}).assign({user: msgauthor, xp: userxp[1] += 1}).write();

      if (message.content === prefix + "xp"){
        var xp = db.get("xp").filter({user: msgauthor}).find('xp').value()
        var xpfinal = Object.values(xp);
        var xp_embed = new Discord.RichEmbed()
        .setTitle(`Stat des XP de ${message.author.username}`)
        .setColor('RANDOM')
        .setThumbnail(message.author.avatarURL)
        .setDescription('Affichage Des XP')
        .addField("XP:", `${xpfinal[1]} xp`)
        .setFooter("Amuse toi :p")
        .setTimestamp()
        message.channel.send({embed: xp_embed});
      }

    }
  });

  client.on('ready',() => {

    let statusArray = [
    
            `${settings.botPREFIX}help | ${client.guilds.size} serveurs<=`,
    
            `${settings.botPREFIX}help | ${client.channels.size} channels<=`,
    
            `${settings.botPREFIX}help | ${client.users.size} users<=`,

            `${settings.botPREFIX}help | invite moi dans ton serveur<= ^^`
    
        ];
    
    
        setInterval(function() {
    
            client.user.setActivity(`${statusArray[~~(Math.random() * statusArray.length)]}`, { type: settings.statusTYPE });
    
        }, 2700);
    
    });
      
client.on(`message`, message => {
    
    if(message.content === "ub!!Ping"){
        message.reply("pong :ping_pong: ");
        console.log('Le bot dit pong !');
    }
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find(ch => ch.name === 'welcome');
  if (!channel) return;
  channel.send(`:inbox_tray: Bienvenue sur le serveur passe un agreable moment parmis nous, ${member} ^^`);
});

client.on('guildMemberRemove', member => {
  const channel = member.guild.channels.find(ch => ch.name === 'leave');
  if (!channel) return;
  channel.send(`:outbox_tray: Aurevoir a bientot l'ami, ${member}`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`On m'a ajouter sur un serveur: ${guild.name} (id: ${guild.id}). Ce serveur a ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`On m'a retirer sur un serveur: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("channelCreate", async channel => {
	var logs = channel.guild.channels.find(c => c.name === 'logs');
	if (!logs) return console.log("Can't find logs channel.");
	const cembed = new Discord.RichEmbed()
		.setTitle("Channel Created")
		.setColor("RANDOM")
		.setDescription(`A **${channel.type} channel**, by the name of **${channel.name}**, was just created!`)
		.setTimestamp(new Date());
	logs.send(cembed)
});

client.on("channelDelete", async channel => {
	var logs = channel.guild.channels.find(c => c.name === 'logs');
	if (!logs) return console.log("Can't find logs channel.");
	const cembed = new Discord.RichEmbed()
		.setTitle("Channel Deleted")
		.setColor("RANDOM")
		.setDescription(`A **${channel.type} channel**, by the name of **${channel.name}**, was just deleted!`)
		.setTimestamp(new Date())
	logs.send(cembed)
});

client.on("message", (message) => {
      
    if(message.content.startsWith(prefix + "sondage"))  {
      message.delete(message.author);
      let args = message.content.split(" ").slice(1);
      let thingToEcho = args.join(" ")
      let embed = new Discord.RichEmbed()
      
      .setDescription("Sondage")
      .addField(thingToEcho, "Répondre avec 🇦(Oui) ou 🇧(Non)")
      .setColor('RANDOM')
      .setThumbnail()
      .setTimestamp()
      .setFooter(`Demandé par ${message.author.tag}`)
      message.channel.send({embed})
      .then(function (message){
        message.react('🇦')
        message.react('🇧')
      }).catch(function(){

      });
    }
});

client.on("message", (message) => {
      
  if(message.content.startsWith(prefix + "annonce"))  {
    message.delete(message.author);
    let args = message.content.split(" ").slice(1);
    let thingToEcho = args.join(" ")
    let embed = new Discord.RichEmbed()
    
    .setDescription("annonce")
    .addField(thingToEcho, "Répondre avec 🇦 si vous avez compris l'annonce ou  🇧 si vous avez pas compris l'annonce")
    .setColor('RANDOM')
    .setThumbnail()
    .setTimestamp()
    .setFooter(`Demandé par ${message.author.tag}`)
    message.channel.send({embed})
    .then(function (message){
      message.react('🇦')
      message.react('🇧')
    }).catch(function(){

    });
  }
});

  
client.on('ready', () => {
    client.user.setPresence({ game: { name: `ub!!help| serveurs : ${client.guilds.size}| ${client.users.size} users`}})
    console.log("Le bot est pret !")
});

client.on(`message`, message => {
    if(message.content === prefix + "avatar"){
        var avatar_embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("Avatar")
        .setImage(message.author.avatarURL)
        .setDescription("Affiche Ton avatar")
        .setFooter(client.user.avatarURL)
        console.log("Un utilisateur a effectuer la commande avatar")
    message.channel.send(avatar_embed)
    }
});
   
client.on(`message`, message => {

    if(message.content === "Re"){
        message.reply("nard X)")
        console.log('Le bot dit nard X)')
    }

    if(message.content === prefix + "help"){
        var help_embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("Voici mes commandes d'aide X)")
        .setThumbnail(message.author.avatarURL)
        .setDescription("Je suis un bot moderation/fun voici mes commandes disponible !")
        .addField("ub!!help", "Affiche ce menu de tout les commandes du bot")
        .addField("N'oubliez pas de mettre le prefix avant chaque commandes que vous effectuer", "Prefix(ub!!):arrow_left:")
        .addField(":tools:moderation.help", "Affiche l'aide pour la moderation")
        .addField(":tada:fun.help", "Affiche l'aide pour le fun")
        .addField(":gear:utilitaires.help", "Affiche l'aide pour les commandes utilitaires comme par exemple(ub!!bi donne les infos sur le bot)")
        .addField(":bookmark_tabs:vcs.help", "Affiche l'aide pour le vcs d'ultrabot")
        .addField("La commande :loudspeaker:d'annonce a été tranferé dans", ":gear:utilitaires.help :arrow_left:")
        .addField(":pencil:report.help", "Affiche l'aide pour la commande de report")
        .addField(":green_book:greeting.help","Affiche l'aide pour les messages de bienvenue/aurevoir")
        .addField(":speech_left:Ce bot a une commandes speciale d'anti spam auto", "ne vous inquiéter plus d'etre spam par des gens ce bot possede un anti spam auto et si vous donnez la perm ban au bot elle pourras bannir le membre qui est en train de spam en quelques minutes sans aucune commandes a effectuer")
        .addField(":speech_balloon: channellogs.help", "Affiche l'aide pour les logs des channels du bot")
        .setFooter("Menu d'aide - De tout les commandes")
        .setTimestamp()
        message.channel.sendMessage(help_embed);
        console.log("Un utilisateur a effectuer la commande d'aide !")
    }
    
    if(message.content === prefix + "moderation.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici mes commandes :tools:moderation.help")
      .setThumbnail(message.author.avatarURL)
      .addField("ub!!kick", "kick un utilisateur !")
      .addField("ub!!ban", "ban un utilisateur !")
      .addField("ub!!mute", "empeche quelq'un de parler et l'utilisateur va rester mute jusqu'a vous le unmuter parce que j'ai pas le timer")
      .addField("ub!!unmute", "redonne la voix a la personne que vous avez mute")
      .addField("ub!!clear nombre", "supprime le nombre de message que vous avez indiquer maximum message a effacer avec ce commande(100) et les message doit date de [moins de 14 jours]")
      .addField("ub!!warn(mentionner un utilisateur + raison)", "Donne un avertissement a la personne que vous avez warn")
      .addField("ub!!listwarns(mentionner un utilisateur)", "vous permez de voir les warns de la personne que vous avez mentionner")
      .addField("ub!!removewarns(mentionner un utilisateur + Le numero du warn)", "vous permez de retire le numero du warn que vous avez indiquer")
      .setFooter("Menu d'aide - moderation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("Un utilisateur a effectuer la commande moderation")
    }

    if(message.content === prefix + "fun.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici mes commandes :tada:fun")
      .setThumbnail(message.author.avatarURL)
      .addField("ub!!Ping", "Le bot repond pong !")
      .addField("Re", "Le bot repond nard X)")
      .addField("ub!!say", "Le bot dit tout ce que vous voulez qu'elle dises")
      .addField("ub!!8ball", "Le bot te repond une reponse random")
      .addField("ub!!.ping", "Le bot donne le temp de latence de votre serveur")
      .addField("ub!!avatar", "Affiche votre avatar en plus grand")
      .addField("ub!!randomchat", "Le bot vous donnes des images ou des gifs de chat amusantes")
      .addField("ub!!xp", "Affche votre taux d'xp avec le bot")
      .addField("ub!!dog", "Affiche des gifs de chiens")
      .setFooter("Menu d'aide - fun")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("Un utilisateur a effectuer la commande fun")
    }
    
    if(message.content === prefix + "utilitaires.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici mes commandes :gear:utilitaires")
      .setThumbnail(message.author.avatarURL)
      .addField("ub!!Statistiques", "Le bot envoie des info sur votre profil !")
      .addField("ub!!si", "Donne des infos sur le serveur !")
      .addField("ub!!bi","Donne des infos sur le bot")
      .addField("ub!!serverlist", "Affiche tout les serveurs que je fait partie et le nombre de membres des serveurs")
      .addField("ub!!sondage", "Vous devez d'ecrire votre sondage et le bot le fait a votre place")
      .addField("ub!!annonce", "vous voulez faire une annonce urgente faite cet commande(ub!!annoce + votre annonce)")
      .setFooter("Menu d'aide - utilitaires")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("Un utilisateur a effectuer la commande utilitaires")
    }

    if(message.content === prefix + "vcs.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour mon :bookmark_tabs:vcs")
      .setThumbnail(message.author.avatarURL)
      .addField("Vous devez creer un salon est renomé le", "(vcs-ultrabot) !")
      .addField("ub!!vcs(votre message)", "commande a utiliser dans le salon(vcs-ultrabot)")
      .setFooter("vcs-ultrabot corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("un utilisateur a effectuer la commande de vcs")
    }

    if(message.content === prefix + "report.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :pencil:report")
      .setThumbnail(message.author.avatarURL)
      .addField("Vous devez cree un salon supplementaire", "Et renommer le reports")
      .addField("commande a utiliser pour le report", "ub!!report(L'utilisateur + la raison)")
      .setFooter("report ultrabot corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("un utilisateur a effectuer la commande de report")
    }

    if(message.content === prefix + "greeting.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :green_book:greeting.help")
      .setThumbnail(message.author.avatarURL)
      .addField("Vous devez cree un salon et nommer le welcome", "pour avoir un message sur votre serveur quand quelq'un rejoin")
      .addField("Vous devez cree un salon et nommer le leave", "pour avoir un message sur votre serveur quand quelq'un quitte le serv")
      .setFooter("greeting ultra bot corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a rejoin/quitter un serv")
    }

    if(message.content === prefix + "channellogs.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :speech_balloon:channellogs.help")
      .setThumbnail(message.author.avatarURL)
      .addField("Vous devez cree un salon et nommer le logs", "pour avoir des logs sur des channels que vous créer")
      .addField("Vous devez cree un salon et nommer le logs", "pour avoir des logs sur des channels que vous effacer")
      .setFooter("logs ultra bot corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("logs envoyer dans le salon logs")
    }
    
    if(message.content.startsWith(prefix + 'say')) { 

     if(message.channel.type === "dm") return;

     if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.reply(":x: Desoler mais vous n'avez pas la permission de faire ce commande !").catch(console.error);

     
         var args = message.content.split(" ").slice(1).join(" ");
         
         if(!args) return message.channel.send(":x: Vous voulez rien me faire dire");

         message.delete()

         message.channel.send(`${args}`)
    }

    if(message.content === prefix + "si"){ 
        var info_embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setThumbnail(message.author.avatarURL)
        .setTitle("Voici les infos sur le serveur !")
        .addField("ID :id: ", `${client.user.id}`)
        .addField("Nom du discord", message.guild.name)
        .addField("Le serveur discord a ete cree le", message.guild.createdAt)
        .addField("Vous avez rejoin le serveur le", message.member.joinedAt)
        .addField("Region", message.guild.region)
        .addField("Owner:crown: : ", message.guild.owner.user.username)
        .addField("Owner ID:crown:: ", message.guild.owner.id)
        .addField("Nombre de membres:busts_in_silhouette:", message.guild.members.size)
        .addField("Humains:bust_in_silhouette:", message.guild.members.filter(member => !member.user.bot).size)
        .addField("Bots:robot:", message.guild.members.filter(member => member.user.bot).size)
        .addField("Activité des membres",':arrow_down:')
        .addField("online:recycle:", OnlineMember = message.guild.members.filter(utilisateurs => utilisateurs.presence.status === 'online').size)
        .addField("idle:large_orange_diamond:", OnlineMember = message.guild.members.filter(utilisateurs => utilisateurs.presence.status === 'idle').size)
        .addField("dnd:red_circle:", OnlineMember = message.guild.members.filter(utilisateurs => utilisateurs.presence.status === 'dnd').size)
        .addField("offline:white_circle:", OnlineMember = message.guild.members.filter(utilisateurs => utilisateurs.presence.status === 'offline').size)
        .addField("Nombre de categories et salons", message.guild.channels.size)
        .addField("Nombre de roles", message.guild.roles.size)
        .addField("Nombres d'emojis", message.guild.emojis.size)
        .setFooter("Info - sur le serveur")
        .setTimestamp()
        message.channel.sendMessage(info_embed)
        console.log("Un utilisateur a effectuer la commande d'infoserveur !")
    }

    if(message.content === prefix + "bi"){
        var info_embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setThumbnail(message.author.avatarURL)
        .setTitle("Les infos sur le bot")
        .addField(" :robot: Nom :", `${client.user.tag}`, true)
        .addField("Descriminateur du bot :hash:", `#${client.user.discriminator}`)
        .addField("ID :id: ", `${client.user.id}`)
        .addField(":clock5: Uptime", Math.round(client.uptime / (1000 * 60 * 60)) + "Heures, " + Math.round(client.uptime / (1000 * 60)) % 60 + "Minutes, et" + Math.round(client.uptime / 1000) % 60 + "Secondes", true)
        .addField("Nombre de serveur sur lequel je suis", `${client.guilds.size}`)
        .addField("Nombre d'users", `${client.users.size}`)
        .addField("Cree par", "[♛Jean0™㋡ 💎#1070]")
        .addField("Le bot a ete cree le", "15/05/18")
        .addField("Version du bot", "v2")
        .addField("voici mon serveur de secours", "https://discord.gg/qDNz4NM")
        .addField("Voici mon lien pour m'inviter dans ton serveur ou a partager", "https://discordapp.com/oauth2/authorize?client_id=450449433344344064&scope=bot&permissions=1677016263")
        .addField("Si vous aimez le bot, s’il vous plaît, pourriez-vous voter pour mon bot sur ce lien ? Cela me ferait très plaisir ^^", "https://discordbots.org/bot/450449433344344064")
        .addField("Vous pouvez retrouver le bot sur ce lien aussi", "https://bots.discord.pw/bots/450449433344344064")
        .setFooter("Info - sur le bot")
        .setTimestamp()
        message.channel.sendMessage(info_embed)
        console.log("Un utilisateur a effectuer la commande d'infobot !")
    }

    if(message.content.startsWith(prefix + "dog")) {

      var chien = [
    
        "https://media.giphy.com/media/bbshzgyFQDqPHXBo4c/giphy.gif",
        "https://media.giphy.com/media/YTXujdmJn3iOVZhMlQ/giphy.gif",
        "https://media.giphy.com/media/14wXMGbHjXK2k0/giphy.gif",
        "https://media.giphy.com/media/Y4pAQv58ETJgRwoLxj/giphy.gif",
        "https://media.giphy.com/media/Pn1gZzAY38kbm/giphy.gif",
        "https://media.giphy.com/media/WLbtNNR5TKJBS/giphy.gif"
      ];

      var gif = chien[Math.floor(Math.random() * chien.length)];

      var dog_embed = new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle(':dog: Chien :')
      .setImage(gif)
      //.setThumbnail(gif)
      .setFooter(`Chien Demandé par ${message.author.tag}`)
      .setTimestamp()
      message.channel.send(dog_embed);
    }

    if (!message.content.startsWith(prefix)) return;

    var args = message.content.substring(prefix.length).split(" ");
    
    switch (args[0].toLowerCase()) { 
    
    case "report":
          
       
    let target = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let reason =  args.slice(2).join(' ');
    let reports = message.guild.channels.find('name' , 'reports');

    if(!target) return message.channel.send(':x: Dsl vous devez spécifier un membre svp pour pouvoir le report');
    if(!reason) return message.channel.send(':x: Dsl mais vous devez spécifiez une raison pour votre report');
    if(!reports) return message.channel.send(':x: Je peut pas effectuer votre commande  parce que vous avez pas le salon reports svp créer le salon et retenter votre commande' );

    let reportembed = new Discord.RichEmbed()
        .setThumbnail(target.user.avatarURL)
        .setAuthor('Report', 'https://cdn.discordapp.com/emojis/465245981613621259.png?v=1')
        .setDescription(`une commande de report a été effectuer par ${message.author.username}`)
        .addField('⚠ La personne qui a été reporté', `${target.user.tag}\n(${target.user.id})`, true)
        .addField(':arrow_down: Reporté par', `${message.author.tag}\n(${message.author.id})`, true)
        .addField(':arrow_down: salon', `${message.channel}`)
        .addField(':pen_ballpoint: La raison du report', `${reason}`)
        .setColor('RANDOM')
        .setTimestamp();
    reports.send(reportembed);

    message.channel.send(`**${target}** a été report par **${message.author}** [ ${reason} ]`).then(message => message.delete(5000));
break;
}

    if(message.content.startsWith(prefix + "kick")) { 
        if(!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return message.channel.send(":x: Vous n'avez pas la permission pour kick un utilisateur !");

        if(message.mentions.users.size === 0) { 
            return message.channel.send(":x: Vous devez mentionner un utilisateur")
        }

        var kick = message.guild.member(message.mentions.users.first());
        if(!kick) { 
            return message.channel.send(":x: Je ne sais pas si l'utilisateur existe :/")
        }

        if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")) { 
            return message.channel.send(":x: Je n'ai pas la permission pour kick");
        }

        kick.kick().then(member => { 
            message.channel.send(`:white_check_mark: ${member.user.username} est kick par ${message.author.username}`);
        });
    }

    if(message.content.startsWith(prefix + "ban")) { 
        if(!message.guild.member(message.author).hasPermission("BAN_MEMBERS")) return message.channel.send(":x: Vous n'avez pas la permission pour ban un utilisateur !");

        if(message.mentions.users.size === 0) { 
            return message.channel.send(":x: Vous devez mentionner un utilisateur");
        }

        var ban = message.guild.member(message.mentions.users.first());
        if(!ban) { 
            return message.channel.send(":x: Je ne sais pas si l'utilisateur existe");
        }

        if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) { 
            return message.channel.send(":x: Je n'ai pas la permission pour ban");
        }
        ban.ban().then(member => { 
            message.channel.send(`:white_check_mark: ${member.user.username} est ban par ${message.author.username} !`)
        } 

        )
    }

    if(message.content.startsWith(prefix + "clear")) {
      if(!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) return message.channel.send(":x: Vous n'avez pas la permission pour utiliser cet commande !");

        let args = message.content.split(" ").slice(1);

        if(!args[0]) return message.channel.send(":x: Tu dois preciser un nombre de messages a supprimer !")
        message.channel.bulkDelete(args[0]).then(() => { 
            message.channel.send(`:white_check_mark: ${args[0]} messages ont ete supprimer !`);
            })
    }

    if (message.content.startsWith(prefix + "mute")) {
  
        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(":x: Il te faut la permission GÉRER LES ROLES")
        let member = message.mentions.members.first();
        if(!member) return message.channel.send(':x: Vous avez oubliez le @[utilisateur] ou vous avez pas la permission');
        if(!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send(":x: Je peux pas mute cet utilisateur");
        let channels = message.guild.channels.array()
        for (var i=0; i < channels.length; i++) {
          channels[i].overwritePermissions(member, {SEND_MESSAGES: false})
            .catch(er => {message.channel.send("je suis pas bien.."); i = channels.length;});
        }
        message.channel.send(member.displayName + " vient d'être mute par " + message.member.displayName)
      }

      if (message.content.startsWith(prefix + "unmute")) {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send(":x: Il te faut la permission GÉRER LES ROLES")
        let member = message.mentions.members.first();
        if(!member) return message.channel.send(':x: Vous avez oubliez le @ ou vous avez pas la permission');
        if(!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send(":x: Je peux pas mute cet utilisateur");
        let channels = message.guild.channels.array()
        for (var i=0; i < channels.length; i++) {
          channels[i].overwritePermissions(member, {SEND_MESSAGES: true})
            .catch(er => {message.channel.send("je suis pas bien.."); i = channels.length;});
        }
        message.channel.send(member.displayName + " vient d'être unmute par " + message.member.displayName)
      }

      var fs = require('fs');
 
let warns = JSON.parse(fs.readFileSync("./warns.json", "utf8"));
 
if (message.content.startsWith(prefix + "warn")){
 
if (message.channel.type === "dm") return;
 
var mentionned = message.mentions.users.first();
 
if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur dsl je peut pas executer votre commande**").catch(console.error);
 
if(message.mentions.users.size === 0) {
 
  return message.channel.send("**:x: Vous devez mentionnée un utilisateur**");
 
}else{
 
    const args = message.content.split(' ').slice(1);
 
    const mentioned = message.mentions.users.first();
 
    if (message.member.hasPermission('MANAGE_GUILD')){
 
      if (message.mentions.users.size != 0) {
 
        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">") {
 
          if (args.slice(1).length != 0) {
 
            const date = new Date().toUTCString();
 
            if (warns[message.guild.id] === undefined)
 
              warns[message.guild.id] = {};
 
            if (warns[message.guild.id][mentioned.id] === undefined)
 
              warns[message.guild.id][mentioned.id] = {};
 
            const warnumber = Object.keys(warns[message.guild.id][mentioned.id]).length;
 
            if (warns[message.guild.id][mentioned.id][warnumber] === undefined){
 
              warns[message.guild.id][mentioned.id]["1"] = {"raison": args.slice(1).join(' '), time: date, user: message.author.id};
 
            } else {
 
              warns[message.guild.id][mentioned.id][warnumber+1] = {"raison": args.slice(1).join(' '),
 
                time: date,
 
                user: message.author.id};
 
            }
 
            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});
 
message.delete();
 
            message.channel.send(':warning: | **'+mentionned.tag+' à été averti avec succès sur le serveur**');
 
message.mentions.users.first().send(`:warning: **Warn |** depuis **${message.guild.name}** donné par **${message.author.username}**\n\n**Raison:** ` + args.slice(1).join(' '))
 
          } else {
 
            message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");
 
          }
 
        } else {
 
          message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");
 
        }
 
      } else {
 
        message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");
 
      }
 
    } else {
 
      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur dsl je peut pas executer votre commande**");
 
    }
 
  }
 
}
 
 
 
  if (message.content.startsWith(prefix+"listwarns")||message.content===prefix+"listwarns") {
 
if (message.channel.type === "dm") return;
 
if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur dsl je peut pas executer votre commande**").catch(console.error);
 
    const mentioned = message.mentions.users.first();
 
    const args = message.content.split(' ').slice(1);
 
    if (message.member.hasPermission('MANAGE_GUILD')){
 
      if (message.mentions.users.size !== 0) {
 
        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">") {
 
          try {
 
            if (warns[message.guild.id][mentioned.id] === undefined||Object.keys(warns[message.guild.id][mentioned.id]).length === 0) {
 
              message.channel.send("**"+mentioned.tag+"** n'a aucun warn sur le serveur :eyes:");
 
              return;
 
            }
 
          } catch (err) {
 
            message.channel.send("**"+mentioned.tag+"** n'a aucun warn sur le serveur :eyes:");
 
            return;
 
          }
 
          let arr = [];
 
          arr.push(`**${mentioned.tag}** a **`+Object.keys(warns[message.guild.id][mentioned.id]).length+"** warns :eyes:");
 
          for (var warn in warns[message.guild.id][mentioned.id]) {
 
            arr.push(`**${warn}** - **"`+warns[message.guild.id][mentioned.id][warn].raison+
 
            "**\" warn donné par **"+message.guild.members.find("id", warns[message.guild.id][mentioned.id][warn].user).user.tag+"** a/le **"+warns[message.guild.id][mentioned.id][warn].time+"**");
 
          }
 
          message.channel.send(arr.join('\n'));
 
        } else {
 
          message.channel.send("Erreur mauvais usage: "+prefix+"listwarns <user> <raison>");
 
          console.log(args);
 
        }
 
      } else {
 
        message.channel.send("Erreur mauvais usage: "+prefix+"listwarns <user> <raison>");
 
      }
 
    } else {
 
      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur dsl je peut pas executer votre commande**");
 
    }
 
  }
 

 
 
  if (message.content.startsWith(prefix+"removewarns")||message.content===prefix+"removewarns") {
 
if (message.channel.type === "dm") return;
 
if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur dsl je peut pas executer votre commande**").catch(console.error);
 
   const mentioned = message.mentions.users.first();
 
    const args = message.content.split(' ').slice(1);
 
    const arg2 = Number(args[1]);
 
    if (message.member.hasPermission('MANAGE_GUILD')){
 
      if (message.mentions.users.size != 0) {
 
        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">"){
 
          if (!isNaN(arg2)) {
 
            if (warns[message.guild.id][mentioned.id] === undefined) {
 
              message.channel.send(mentioned.tag+" n'a aucun warn");
 
              return;
 
            } if (warns[message.guild.id][mentioned.id][arg2] === undefined) {
 
              message.channel.send("**:x: Ce warn n'existe pas**");
 
              return;
 
            }
 
            delete warns[message.guild.id][mentioned.id][arg2];
 
            var i = 1;
 
            Object.keys(warns[message.guild.id][mentioned.id]).forEach(function(key){
 
              var val=warns[message.guild.id][mentioned.id][key];
 
              delete warns[message.guild.id][mentioned.id][key];
 
              key = i;
 
              warns[message.guild.id][mentioned.id][key]=val;
 
              i++;
 
            });
 
            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});
 
            if (Object.keys(warns[message.guild.id][mentioned.id]).length === 0) {
 
              delete warns[message.guild.id][mentioned.id];
 
            }
 
            message.channel.send(`Le warn de **${mentioned.tag}**\': **${args[1]}** a été enlevé avec succès sur le serveur l'ami!`);
 
            return;
 
          } if (args[1] === "tout") {
 
            delete warns[message.guild.id][mentioned.id];
 
            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});
 
            message.channel.send(`Les warns de **${mentioned.tag}** a été enlevé avec succès sur le serveur l'ami!`);
 
            return;
 
          } else {
 
            message.channel.send("Erreur mauvais usage: "+prefix+"removewarns <utilisateur> <nombre>");
 
          }
 
        } else {
 
          message.channel.send("Erreur mauvais usage: "+prefix+"removewarns <utilisateur> <nombre>");
 
        }
 
      } else {
 
       message.channel.send("Erreur mauvais usage: "+prefix+"removewarns <utilisateur> <nombre>");
 
      }
 
    } else {
 
      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur dsl je peut pas executer votre commande**");
 
    }
 
  }

      if (!message.content.startsWith(prefix)) return;

        var args = message.content.substring(prefix.length).split(" ");

        switch (args[0].toLowerCase()) {
           case "statistiques":

        var userCreateDate = message.author.createdAt.toString().split(" ");
        var msgauthor = message.author.id;

        var stats_embed = new Discord.RichEmbed()

        .setColor("RANDOM")
        .setTitle(`Statistiques de l'utilisateur : ${message.author.username}`)
        .addField(`ID de l'utilisateur :id:`, msgauthor, true)
        .addField("Date de creation de l'utilisateur :", userCreateDate[1] + ' ' + userCreateDate[2] + ' ' + userCreateDate[3])
        .setTimestamp()
        .setThumbnail(message.author.avatarURL)
        message.reply("Tu peux regarder tes messages prives ! Tu viens de recevoir tes statistiques !")
        message.author.send({embed: stats_embed});
        break;

        case "8ball":
        let args = message.content.split(" ").slice(1);
        let tte = args.join(" ")
        if(!tte){
            return message.reply(":x: Merci de me poser une question :8ball:")};

            var replys = [
                "Oui",
                "Non",
                "Je ne sais pas",
                "Peut etre"
            ];
            
            let reponse = (replys[Math.floor(Math.random() * replys.length)])
            var bembed = new Discord.RichEmbed()
            .setDescription(":8ball: 8ball")
            .addField("Question", tte)
            .addField("Reponse", reponse)
            .setColor("RANDOM")
            .setTimestamp()
            .addField("Demandé par", `${message.author.username}`)
        message.channel.sendEmbed(bembed)
        break;
        
        case ".ping":
        message.channel.sendMessage('Temp de latence avec le serveur: `' + `${message.createdTimestamp - Date.now()}` + ' ms`');
        break;

        case "serverlist":
        message.channel.send(client.guilds.map(r => r.name + ` | **${r.memberCount}** membres`))
        break;

        case "randomchat":
        try {
            get('https://aws.random.cat/meow').then(res => {
                const embed = new Discord.RichEmbed()
                .setDescription(":cat: Images des chats")
                .setImage(res.body.file)
                .setColor("RANDOM")
                .addField("Demandé par", `${message.author.username}`)
                .setTimestamp()
                return message.channel.send({embed});
        });
    } catch(err) {
        return message.channel.send(error.stack);
    }
        break;

        case "vcs":
        let xoargs = message.content.split(" ").slice(1);
        let xo03 = xoargs.join(" ")
        var xo02 = message.guild.channels.find('name', 'vcs-ultrabot');
        if(!xo02) return message.reply("Le channel vcs-ultrabot est introuvable l'ami")
        if(message.channel.name !== 'vcs-ultrabot') return message.reply("La commande que tu doit executer dans vcs-ultrabot")
        if(!xo03) return message.reply("Merci d'écrire une message a envoyer a la globalité des discords l'ami !")
        var embedglobal = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("Message global de vcs-ultrabot")
        .addField("Pseudo de l'utilisateur qui a effectuer la commande", message.author.username + "#" + message.author.discriminator, true)
        .addField("Le serveur d'ou provient le message", message.guild.name, true)
        .addField("Le message", xo03)
        .setFooter("vcs-ultrabot corporation")
        .setTimestamp()
        client.channels.findAll('name', 'vcs-ultrabot').map(channel => channel.send(embedglobal))
        break;
  }
});
