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

            `${settings.botPREFIX}help | invite moi sur ton serveur<= ^^`,

            `${settings.botPREFIX}help | Le bot est en développement<=`
    
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
	if (!logs) return console.log("Impossible de trouver le salon de logs.");
	const cembed = new Discord.RichEmbed()
		.setTitle("Salon créée")
		.setColor("RANDOM")
		.setDescription(`Un **${channel.type} salon**, par le nom de **${channel.name}**, vient d'être créé!`)
		.setTimestamp(new Date());
	logs.send(cembed)
});

client.on("channelDelete", async channel => {
	var logs = channel.guild.channels.find(c => c.name === 'logs');
	if (!logs) return console.log("Impossible de trouver le salon de logs.");
	const cembed = new Discord.RichEmbed()
		.setTitle("Salon supprimée")
		.setColor("RANDOM")
    .setDescription(`Un **${channel.type} salon**, par le nom de **${channel.name}**, vient d'être supprimé!`)
		.setTimestamp(new Date())
	logs.send(cembed)
});

client.on('messageUpdate', async function(oldMessage, newMessage) {
  if(oldMessage.content !== newMessage.content && !newMessage.author.bot){
      let log = new Discord.RichEmbed()
          .setColor(16753920)
          .setAuthor(newMessage.author.username, newMessage.author.avatarURL)
          .setDescription("Le message de" + newMessage.author.toString() + " a été modifié")
          .addField('Avant', (oldMessage && oldMessage.content != null && oldMessage.content !== '')?oldMessage.content:"*Image/Embed*")
          .addField('Après', (newMessage.content)?newMessage.content:"*Image/Embed*")
          .addField('ID', newMessage.id, true)
          .addField('Salon', newMessage.channel.toString(), true)
          .setTimestamp(new Date());
      if(newMessage.member.guild.channels.find((channel) => channel.name === "logs"))newMessage.member.guild.channels.find((channel) => channel.name === "logs").send(log);
  }
});

client.on('messageDelete', async function(message) {
  const entry = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first());
  let user;
  if (entry.extra.channel && entry.extra.channel.id === message.channel.id
      && (entry.target.id === message.author.id)
      && (entry.createdTimestamp > (Date.now() - 5000))
      && (entry.extra.count >= 1)) {
      user = entry.executor
  } else {
      user = message.author
  }
if(user.bot)return;
        if(user === message.author){
            let log = new Discord.RichEmbed()
                .setColor(16711680)
                .setAuthor(user.username, user.avatarURL)
                .setDescription("Le message a été supprimé par" + user.toString())
                .addField('Message', (message.content)?message.content:"*Image/Embed*")
                .addField('ID', message.id, true)
                .addField('Salon', message.channel.toString(), true)
                .setTimestamp(new Date());
            if(message.member.guild.channels.find((channel) => channel.name === "logs"))message.member.guild.channels.find((channel) => channel.name === "logs").send(log);
        }else{
            let log = new Discord.RichEmbed()
                .setColor(16711680)
                .setAuthor(user.username, user.avatarURL)
                .setDescription(user.toString() + " a supprimé le message de "+ message.author.toString())
                .addField('Message', (message.content)?message.content:"*Image/Embed*")
                .addField('ID', message.id, true)
                .addField('Salon', message.channel.toString(), true)
                .setTimestamp(new Date());
            if(message.member.guild.channels.find((channel) => channel.name === "logs"))message.member.guild.channels.find((channel) => channel.name === "logs").send(log);
        }
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
  if(message.content.startsWith(prefix + "avatar"))  {
    const member = message.mentions.members.first() || message.member;
        var avatar_embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("Avatar")
        .setImage(member.user.displayAvatarURL)
        .setDescription(`Affiche l'avatar de ${member.user.username}`)
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
        .addField(":heavy_plus_sign:help.addrole", "Affiche l'aide pour le addrole d'Ultra Bot")
        .addField(":heavy_minus_sign:help.removerole", "Affiche l'aide pour le removerole d'Ultra Bot")
        .addField(":arrow_heading_up:ub!!update","Affiche les mise a jour du bot")
        .addField(":notepad_spiral:ub!!help.roleinfo", "Affiche l'aide pour le roleinfo du bot")
        .addField(":notebook:ub!!logs.help", "Affiche l'aide pour les channel logs d'Ultra Bot")
        .addField(":ticket:ub!!help.ticket", "Affiche l'aide pour le systeme de ticket du bot")
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
      .addField("ub!!unban", "unban un utilisateur !")
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
      .addField("ub!!avatar/ub!!avatar[@member]", "Affiche votre avatar en plus grand")
      .addField("ub!!randomchat", "Le bot vous donnes des images ou des gifs de chat amusantes")
      .addField("ub!!xp", "Affche votre taux d'xp avec le bot")
      .addField("ub!!dog", "Affiche des gifs de chiens")
      .addField("ub!!roll", "Vous permez de roulé un dé avec le bot")
      .addField("ub!!slots", "Vous permez de jouer a slots avec le bot")
      .addField("ub!!smoke", "Permez au bot de fumer une cigarette")
      .addField("ub!!coinflip", "Vous permez de jouer a heads et tails avec une pièce")
      .addField("ub!!flip", "Je vous laisse découvrir ^^")
      .addField("ub!!roulette", "Une version améliorer du slots ^^")
      .addField("ub!!pf", "Vous permez de jouer a pile ou face avec le bot")
      .addField("ub!!calin", "Le bot te fais un gros calin ^^")
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
      .addField("ub!!stats", "Le bot donne des info sur votre profil ou sur un utilisateur mentionner !")
      .addField("ub!!si", "Donne des infos sur le serveur !")
      .addField("ub!!bi","Donne des infos sur le bot")
      .addField("ub!!serverlist", "Affiche tout les serveurs que je fait partie et le nombre de membres des serveurs")
      .addField("ub!!sondage", "Vous devez d'ecrire votre sondage et le bot le fait a votre place")
      .addField("ub!!annonce", "vous voulez faire une annonce urgente faite cet commande(ub!!annoce + votre annonce)")
      .addField("ub!!monid", "Si vous connaissez pas votre id faite cette commande `ub!!monid`")
      .addField("ub!!ui/ub!!ui[@utilisateur]", "Donne des infos sur toi ou sur un utilisateur")
      .addField("ub!!emoji", "Vous montre les emojis de votre serveur")
      .addField("ub!!uptime", "Vous montre l'activité du bot sur tous les serveurs qu'il est présent")
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

    if(message.content === prefix + "help.addrole"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :heavy_plus_sign:addrole.help")
      .setThumbnail(message.author.avatarURL)
      .addField("ub!!addrole","`[@role]+[@l'utilisateur]`")
      .setFooter("Ultra Bot addrole corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a utiliser la commande addrole")
    }

    if(message.content === prefix + "help.removerole"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :heavy_minus_sign:removerole.help")
      .setThumbnail(message.author.avatarURL)
      .addField("ub!!remove","`[@role]+[@l'utilisateur]`")
      .setFooter("Ultra Bot remove corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a utiliser la commande removerole")
    }

    if(message.content === prefix + "help.roleinfo"){
      var help_embed = new Discord.RichEmbed()
      .setColor("Random")
      .setTitle("Voici l'aide pour la commande :notepad_spiral:roleinfo.help")
      .setThumbnail(message.author.avatarURL)
      .addField("ub!!roleinfo[@role]", "Le bot vous donne des infos sur le role mentionner")
      .setFooter("Ultra Bot roleinfo corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a utilier la commande de roleinfo")
    }

    if(message.content === prefix + "logs.help"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :notebook:logs.help")
      .setThumbnail(message.author.avatarURL)
      .addField("Creer un salon et nommer le logs", "Pour recevoir tous les logs du bot")
      .setFooter("Ultra Bot channel logs corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a effectuer la commande de logs.help")
    }

    if(message.content === prefix + "help.ticket"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici l'aide pour la commande :ticket:ticket.help")
      .setThumbnail(message.author.avatarURL)
      .addField("Creer un role et nommer le Help team", "Pour pouvoir occuper les ticket que les membres feront sur votre serveur")
      .addField("La commande de ticket d'Ultra Bot", "ub!!ticket cree un ticket pour l'utiliateur qui a besoin d'aide sur n'importe quel serveur")
      .addField("La commande pour fermer un ticket", "ub!!fermer vous permet de fermer le ticket que vous avez ouvert")
      .addField("la commande ub!!confirm", "Vous permez de confirmer la fermeture de votre ticket ouvert")
      .setFooter("Ultra Bot ticket corporation")
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a effectuer la commande de logs.help")
    }

    if(message.content === prefix + "update"){
      var help_embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle("Voici les mise a jours de mes commandes")
      .setThumbnail(message.author.avatarURL)
      .addField("N'oublier pas le prefix avant chaque commande", "prefix : `ub!!` <--")
      .addField("Nouveaux commandes", ":arrow_down_small:")
      .addField("addrole", "A l'aide d'une commande vous aide a ajouter un role a un utilisateur")
      .addField("removerole", "A l'aide d'une commande vous aide a retirer un role d'un utilisateur")
      .addField("unban", "Vous aide a unbannir un membre de votre serveur")
      .addField("roll", "Vous permez de roulé un dé avec le bot")
      .addField("roleinfo", "Le bot vous donne des infos sur le role mentionner")
      .addField("slots", "Vous permez de jouer a slots avec le bot")
      .addField("smoke", "Permez au bot de fumer une cigarette")
      .addField("coinflip", "Vous permez de jouer a heads et tails avec une pièce grace a une commande")
      .addField("flip", "Je vous laisse découvrir ^^")
      .addField("monid", "Le bot vous donne votre id")
      .addField("roulette", "Une version améliorer du slots")
      .addField("logs.help", "Affiche l'aide pour les logs du bot")
      .addField("ui", "Affiche des infos sur toi ou sur l'utilisateur mentionner")
      .addField("Fix avatar", "Maintenant vous pouvez voir l'avatar de qui vous voulez en grand en fesant `ub!!avatar[@member]`/ si vous voulez voir que le votre c'est `ub!!avatar`")
      .addField("pf", "Vous permez de jouer a pile ou face avec le bot")
      .addField("calin", "Le bot te fais un gros calin")
      .addField("help.ticket", "Affiche l'aide pour le systeme de ticket du bot")
      .addField("emoji", "Vous montre les emojis de votre serveur")
      .addField("uptime", "Vous montre l'activité du bot sur tous les serveurs sur lesquels elle travaille")
      .setFooter(`Les mise a jours du bot ${message.author.username}`)
      .setTimestamp()
      message.channel.sendMessage(help_embed);
      console.log("quelq'un a fait la commande de update")
    }

    if(message.content.startsWith(prefix + 'addrole')) {
      var role = message.mentions.roles.first();
      if (!role) return message.channel.send(`Vous devez mentionner un rôle.`);
      var member = message.mentions.members.first();
      if (!member) return message.channel.send("Vous devez mentionner quelqu'un.");
      var roleid = role.id;
      var rolename = role.name;
      
      if (!message.guild.roles.get(roleid)) return message.channel.send(`Ce rôle n'existe pas...`);
      member.addRole(role.id);
      var em = new Discord.RichEmbed()
      .setTitle("Ultra Bot addrole corporation")
      .setDescription(`Okay! J'ai ajouté le rôle ${rolename} à l'utilisateur ${member.user.username}.`)
      .setColor("RANDOM")
      .setTimestamp()
      .setFooter(`${message.author.username} rôle ajouté ${rolename} à l'utilisateur ${member.user.username}.`)
      message.channel.send({embed: em})
      if (member.displayName) {
        em.setDescription(`Okay! J'ai ajouté le rôle ${rolename} à l'utilisateur ${member.displayName}.`)
        em.setFooter(`${message.author.username} rôle ajouté ${rolename} à l'utilisateur ${member.displayName}.`)
      }
    };

    if(message.content.startsWith(prefix + 'removerole')) {
      let member = message.mentions.members.first();
      if (!member) return message.channel.send("Vous devez mentionner quelqu'un.")
      let role = message.mentions.roles.first();
      if (!role) return message.channel.send("Vous devez mentionner un rôle.")
      let roleid = role.id
      let rolename = role.name
      if (!message.guild.roles.get(roleid)) return message.channel.send(`Ce rôle n'existe pas...`);
      
      member.removeRole(roleid);
      let em = new Discord.RichEmbed()
      .setTitle("Ultra Bot removerole corporation")
      .setDescription(`Okay! J'ai enlevé le rôle ${rolename} de l'utilisateur ${member.user.username}.`)
      .setColor("RAMDOM")
      .setTimestamp()
      .setFooter(`${message.author.username} rôle supprimé ${rolename} de l'utilisateur ${member.user.username}.`)
      message.channel.send({embed: em})
    }

    if(message.content.startsWith(prefix + "roll")) {
      var result = Math.floor((Math.random() * 6) + 1);
      message.channel.send({
          embed: {
              color: 0x9400d3,
              title: `:game_die: ***Vous avez roulé un***... ${result}`
          }
      });
  }

  if(message.content.startsWith(prefix + "slots")) {
    if (!message.guild.member(client.user).hasPermission("SEND_MESSAGES")) return message.author.send("Je n'ai pas la permission d'envoyer des messages. Veuillez activer l'envoi de messages pour mon rôle.!");

    let slots = ["🍎", "🍌", "🍒", "🍓", "🍈"];
    let result1 = Math.floor((Math.random() * slots.length));
    let result2 = Math.floor((Math.random() * slots.length));
    let result3 = Math.floor((Math.random() * slots.length));
    let name = message.author.displayName;
    let aicon = message.author.displayAvatarURL;

    if (slots[result1] === slots[result2] && slots[result3]) {
        let wEmbed = new Discord.RichEmbed()
            .setFooter("Tu as gagné!", aicon)
            .setTitle(':slot_machine:Slots:slot_machine:')
            .addField('Résultat:', slots[result1] + slots[result2] + slots[result3], true)
            .setColor("RANDOM");
        message.channel.send(wEmbed);
    } else {
        let embed = new Discord.RichEmbed()
            .setFooter('Tu as perdu!', aicon)
            .setTitle(':slot_machine:Slots:slot_machine:')
            .addField('Résultat', slots[result1] + slots[result2] + slots[result3], true)
            .setColor("RANDOM");
        message.channel.send(embed);
    }

}

if(message.content.startsWith(prefix + "monid")) {
  message.channel.send(`Votre identifiant est: ${message.author.id}`)
}

if(message.content.startsWith(prefix + "ui")) {
  const member = message.mentions.members.first() || message.member;
  let aicon = message.author.displayAvatarURL;

    const em = new Discord.RichEmbed()
    .addField(`Infos de ${member.user.username}`, `Voici les info que j'ai trouvée pour ${member.user.username} !`)
    .addField(`> User ID :`, `${member.user.id}`)
    .addField(`> Username :`, `${member.user.username}`)
    .addField(`> Nickname :`, `${member.displayName}`)
    .addField(`> Tag :`, `${member.user.tag}`)
    .addField(`> Status :`, `${member.presence.status}`)
    .addField(`> Jeu :`, `${member.user.presence.game ? `${member.user.presence.game.name}` : "Aucun jeu"}`)
    .addField(`> Rejoin le :`, `${member.joinedAt}`)
    .addField(`> Crée le :`, `${member.user.createdAt}`)
    .setThumbnail(member.user.displayAvatarURL)
    .setTimestamp()
    .setFooter(`Demandé par ${message.author.username}`, aicon)
    .setColor("RANDOM")
    message.channel.send({embed: em})
}

if(message.content.startsWith(prefix + "pf")) {
  message.channel.send("Le bot lance la pièce :fist:").then(result => {
    setTimeout(function(){
        if(getRandomInt(2) === 0){
            result.edit("Pile :stuck_out_tongue:");
        }else{
            result.edit("Face :scream:");
        }
    }, 2000);
});
};

if(message.content.startsWith(prefix + "calin")) {
  let hugs = [
    "`＼(^o^)／`",
    "`d=(´▽｀)=b`",
    "`⊂((・▽・))⊃`",
    "`⊂( ◜◒◝ )⊃`",
    "`⊂（♡⌂♡）⊃`",
    "`⊂(◉‿◉)つ`"
];
message.reply(`${hugs[~~(Math.random() * hugs.length)]}`);

};

function getRandomInt(max) {
return Math.floor(Math.random() * Math.floor(max));
}

if(message.content.startsWith(prefix + "ticket")) {
  const reason = message.content.split(" ").slice(1).join(" ");
  if (!message.guild.roles.exists("name", "Help Team")) return message.channel.send(":x: Je peut pas trouver le role `Help Team` il est introuvable. Merci de contacter un administrateur du serveur pour résoudre cette erreur !");
  if (message.guild.channels.exists("name", "ticket-" + message.author.id)) return message.channel.send(`:x: Vous avez  déja un ticket \`d'ouvert\` vous pouvez cree une autre.`);
  message.guild.createChannel(`ticket-${message.author.id}`, "text").then(channel => {
      let HelpTeam = message.guild.roles.find("name", "Help Team");
      let everyone = message.guild.roles.find("name", "@everyone");
      channel.overwritePermissions(HelpTeam, {
          SEND_MESSAGES: true,
          READ_MESSAGES: true
      });
      channel.overwritePermissions(everyone, {
          SEND_MESSAGES: false,
          READ_MESSAGES: false
      });
      channel.overwritePermissions(message.author, {
          SEND_MESSAGES: true,
          READ_MESSAGES: true
      });
      message.channel.send(`:white_check_mark: Votre ticket a bien été créé, rendez vous dans ${channel}`);
      const embed = new Discord.RichEmbed()
          .setColor("#2D66B8")
          .setAuthor(`Hey ${message.author.username} !`)
          .setDescription("Merci d'expliquer votre probleme a un staff du serveur. \nUne fois que votre ticket a été résolu par un staff utiliser la commande `ub!!fermer` pour fermer votre ticket.")
          .setTimestamp();
      channel.send(embed);
  }).catch(console.error);
};

if(message.content.startsWith(prefix + "fermer")) {
  if (!message.channel.name.startsWith(`ticket-`)) return;

  message.channel.send(`Est-ce que vous etre sur? Une fois que vous avez ecrit ub!!confirm, vous ne pourrez pas retourner en arrière !\nPour confirmer la fermeture de votre ticket, écrivez \`ub!!confirm\`. Le bot vous donne un délai de 20 secondes et si vous n'avez toujour pas fermer le ticket votre demande seras expire est annulé.`)
  .then((m) => {
          message.channel.awaitMessages(response => response.content === 'ub!!confirm', {
              max: 1,
              time: 20000,
              errors: ['time'],
          })
      .then((collected) => {
          message.channel.delete();
      })
      .catch(() => {
          m.edit(' Votre commande a expirée, Votre ticket n\'a pas été fermé.').then(m2 => {
              m2.delete();
          }, 3000);
      });
  });
};

if(message.content.startsWith(prefix + "emoji")) {
  const emoji = message.guild.emojis;
  let aicon = message.author.displayAvatarURL;
  if (!emoji.size) return message.channel.send("J'ai pas pu trouver d'emoji sur ce serveur :construction:");
  const embed = new Discord.RichEmbed()
  .setColor("RANDOM")
  .setFooter(`Demandé par ${message.author.tag}`, aicon)
  .setTimestamp()
  .addField("Nombres d'emojis sur le serveur :", message.guild.emojis.size)
  .addField("Emojis du serveur :", emoji.map((e) => e).join(' '));
  message.channel.send({embed});
};

if(message.content.startsWith(prefix + "uptime")) {
  var hrs = Math.round(client.uptime / (1000 * 60 * 60)) + " hour(s),"
  var mins = " " + Math.round(client.uptime / (1000 * 60)) % 60 + " minute(s), "
  var sec = Math.round(client.uptime / 1000) % 60 + " second(s)"
  if (hrs == "0 hour(s),") hrs = ""
  if (mins == " 0 minute(s), ") mins = ""
  let uptime = hrs+mins+sec
  
  let em = new Discord.RichEmbed()
  .setTitle(`**${client.user.username} Uptime**\n`)
  .setDescription(`**Servir ${client.guilds.size} serveurs pour ${uptime}!**`)
  .setColor("RANDOM")
  .setTimestamp()
  .setFooter(`Demandé par ${message.author.username}.`)
  message.channel.send({embed: em})
}

if (message.content === prefix + "roulette") {
  var replys1 = [
      ":gem: : :gem: : :gem: ",
      ":lemon: : :lemon: : :lemon: ",
      ":seven: : :seven: : :seven: ",
      ":bell: : :bell: : :bell:",
      ":cherries: : :cherries: : :cherries: ",
      ":star: : :star: : :star: ",
      ":gem: : :star: : :seven: ",
      ":star: : :bell: : :bell:",
      ":star: : :star: : :cherries: ",
      ":gem: : :gem: : :cherries:",
      ":gem: : :seven: : :seven: ",
      ":star: : :bell: : :lemon: ",
      ":star: : :star: : :cherries: ",
      ":seven: : :star: : :star: ",
      ":star: : :star: : :seven: ",
      ":gem: : :gem: : :seven: "
  ];
  let reponse = (replys1[Math.floor(Math.random() * replys1.length)])

  var replys2 = [
      ":gem: : :gem: : :gem: ",
      ":lemon: : :lemon: : :lemon: ",
      ":seven: : :seven: : :seven: ",
      ":bell: : :bell: : :bell:",
      ":cherries: : :cherries: : :cherries: ",
      ":gem: : :star: : :seven: ",
      ":star: : :bell: : :bell:",
      ":star: : :star: : :cherries: ",
      ":gem: : :gem: : :cherries:",
      ":gem: : :seven: : :seven: ",
      ":star: : :bell: : :lemon: ",
      ":star: : :star: : :cherries: ",
      ":seven: : :star: : :star: ",
      ":star: : :star: : :seven: ",
      ":gem: : :gem: : :seven: ",
      ":gem: : :cherries: : :cherries:",
      ":gem: : :bell: : :star:"
  ];
  let reponse2 = (replys2[Math.floor(Math.random() * replys2.length)])
  var replys3 = [
      ":lemon: : :lemon: : :lemon: ",
      ":bell: : :bell: : :bell:",
      ":cherries: : :cherries: : :cherries: ",
      ":star: : :star: : :star: ",
      ":gem: : :star: : :seven: ",
      ":star: : :bell: : :bell:",
      ":star: : :star: : :cherries: ",
      ":gem: : :gem: : :cherries:",
      ":gem: : :seven: : :seven: ",
      ":star: : :bell: : :lemon: ",
      ":star: : :star: : :cherries: ",
      ":seven: : :star: : :star: ",
      ":star: : :star: : :seven: ",
      ":gem: : :gem: : :seven: "
  ];
  let reponse3 = (replys3[Math.floor(Math.random() * replys3.length)])
  let aicon = message.author.displayAvatarURL;

  const embed = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`**[ :slot_machine: @${message.author.tag} a lancé la machine à sous ! :slot_machine: ]**`)
      .addField("**-------------------**", "** **")
      .addField(`${reponse} \n \n${reponse2}**<** \n \n${reponse3}`, `** **`)
      .addField("**-------------------**", "** **")
      .setTimestamp()
      .setFooter("Tu as eu ça comme résultat (voir en haut) !", aicon)
      .setDescription("** **")
  message.channel.send(embed)
}

if(message.content.startsWith(prefix + 'flip')) {
  var result = Math.floor((Math.random() * 2) + 1);
  if (result == 1) {
      let headembed = new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle("La pièce a atterri sur :regional_indicator_h: :regional_indicator_e: :regional_indicator_a: :regional_indicator_d: :regional_indicator_s:.")
      message.channel.send(headembed);
  } else if (result == 2) {
      let tailsembed = new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle("La pièce a atterri sur :regional_indicator_t: :regional_indicator_a: :regional_indicator_i: :regional_indicator_l: :regional_indicator_s:.")
      message.channel.send(tailsembed);
  }
}


if(message.content.startsWith(prefix + 'coinflip')) {
  const result = Math.round(Math.random());
  if (result) {
    let embed = new Discord.RichEmbed()
    .setTitle(`${client.user.username} Coinflip`)
    .setThumbnail(`https://media3.giphy.com/media/mA51FMHGo3BDi/giphy.gif`)
    .setDescription(`Welp! La pièce a atterri sur heads! Tu a gagner.`)
    .setColor(`GREEN`)
    .setFooter(`Demandé par ${message.author.tag}`)
    .setTimestamp()
    message.channel.send({embed: embed})
  } else {
    let em = new Discord.RichEmbed()
    .setTitle(`${client.user.username} Coinflip`)
    .setThumbnail(`https://media3.giphy.com/media/mA51FMHGo3BDi/giphy.gif`)
    .setDescription(`Welp! La pièce a atterri sur tails! Tu as perdu.`)
    .setColor(`RED`)
    .setFooter(`Demandé par ${message.author.tag}`)
    .setTimestamp()
    message.channel.send({embed: em})
  }
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
        .addField("Version du bot", "2.0.1")
        .addField("Utilisation de la mémoire", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
        .addField("voici mon serveur de secours", "https://discord.gg/qDNz4NM")
        .addField("Voici mon lien pour m'inviter dans ton serveur ou a partager", "https://discordapp.com/oauth2/authorize?client_id=450449433344344064&scope=bot&permissions=1677016263")
        .addField("Si vous aimez le bot, s’il vous plaît, pourriez-vous voter pour mon bot sur ce lien ? Cela me ferait très plaisir ^^", "https://discordbots.org/bot/450449433344344064")
        .addField("Vous pouvez retrouver le bot sur ce lien aussi", "https://bots.discord.pw/bots/450449433344344064")
        .setFooter("Info - sur le bot")
        .setTimestamp()
        message.channel.sendMessage(info_embed)
        console.log("Un utilisateur a effectuer la commande d'infobot !")
    }

    if(message.content.startsWith(prefix + 'roleinfo')) {
      const role = message.mentions.roles.first();
      if (!role) return message.channel.send("Vous devez mentionner un rôle.");
      if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Autorisations non valides!");
      if (!message.guild.me.hasPermission("MANAGE_ROLES")) return message.channel.send("Je ne peux pas faire ça ... Assurez-vous d'avoir l'autorisation `Gérer les rôles`.");
      
      const n = role.name
      const i = role.id
      const hoisted = role.hoist
      const canBeEdited = role.editable
      const mentioned = role.mentionable
      const hex = role.hexColor
      
      
      const em = new (require('discord.js').RichEmbed)()
      .addField("Ulra Bot Role Info:", "Voici les informations demandées!",true)
      .addField("Nom de rôle:", n,true)
      .addField("ID du rôle:", i,true)
      .addField("Palan du rôle:", hoisted,true)
      .addField("Rôle Editable:", canBeEdited,true)
      .addField("Rôle Mentionable:", mentioned, true)
      .addField("Couleur de Hex du rôle:", hex, true)
      .setTimestamp()
      .setFooter("Demandé par %s".replace("%s", message.member.displayName))
      .setColor("RANDOM")
      message.channel.send({embed: em})
    }

    if(message.content.startsWith(prefix + "smoke")) {
      message.channel.send('**Je suis en train de fumer**').then(async msg => {
        setTimeout(() => {
            msg.edit('🚬');
        }, 500);
        setTimeout(() => {
            msg.edit('🚬 ☁ ');
        }, 1000);
        setTimeout(() => {
            msg.edit('🚬 ☁☁ ');
        }, 1500);
        setTimeout(() => {
            msg.edit('🚬 ☁☁☁ ');
        }, 2000);
        setTimeout(() => {
            msg.edit('🚬 ☁☁');
        }, 2500);
        setTimeout(() => {
            msg.edit('🚬 ☁');
        }, 3000);
        setTimeout(() => {
            msg.edit('🚬 ');
        }, 3500);
        setTimeout(() => {
            msg.edit(`J'ai fini de fumer`);
        }, 4000);
    });
};

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

    if(message.content.startsWith(prefix + "unban")) {
      let id = args.join(' ');
      if (!message.member.hasPermission(["BAN_MEMBERS"], false, true, true)) return message.channel.send(`Vous avez pas la permission d'utiliser cette commande.`);
    let member = client.fetchUser(id)
    .then(user => {
      message.guild.unban(user.id)
      .then(() => {
        message.channel.send(`Cool, J'ai unbanni ${user} de ton serveur.`)
      }).catch(err => {
          message.channel.send(`Echec d'unbannir ${user} de ton serveur`)
      })
    }).catch(() => message.channel.send("Desoler, j'ai pas pu trouver un membre avec cette id..."))
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

  switch (args[0].toLowerCase()) {
    case "":
    var stats_embed = new Discord.RichEmbed()
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
