'use strict';

const commando = require("@iceprod/discord.js-commando");
const { getChannel, trySend, defaultImageEmbed, parseDoubleDash, parseDash, parseComa } = require("../../resources/functions");

module.exports = class eventlog extends commando.Command {
    constructor(client) {
        super(client, {
            name: "eventlog",
            aliases: ["eventlogs"],
            memberName: "eventlog",
            group: "moderation",
            description: "Configure server's Event Log Channels.",
            guildOnly: true,
            userPermissions: ["MANAGE_GUILD"]
        });
    }
    async run(msg, arg) {
        if (!msg.guild.dbLoaded) await msg.guild.dbLoad();
        const set = parseDoubleDash(arg);
        let eventChannels = msg.guild.eventChannels;
        if (set.length < 2 && set[0].length === 0) return trySend(this.client, msg, await resultEmbed(this));
        let report = "", joinlog, leavelog, channellog, banlog, unbanlog, mesEdlog = { channel: undefined, ignore: [] }, invitelog, rolelog,
            guildlog, membernicklog, emotelog, memberroleslog, remove = false, [setMesEdIgnore, setMesDelIgnore] = [false, false], mesDellog = { channel: undefined, ignore: [] };
        for (const args of set) {
            if (args.startsWith("r ")) remove = true;
            if (args.startsWith("j ")) {
                if (remove) eventChannels.join = undefined; else {
                    leavelog = getChannel(msg, args.slice("j".length).trim(), ["category", "voice"])?.id;
                    if (!leavelog) report += "**[JOIN]** Unknown channel.\n";
                }
            }
            if (args.startsWith("l ")) {
                if (remove) eventChannels.leave = undefined; else {
                    leavelog = getChannel(msg, args.slice("l ".length).trim(), ["category", "voice"])?.id;
                    if (!leavelog) report += "**[LEAVE]** Unknown channel.\n";
                }
            }
            if (args.startsWith("c ")) {
                if (remove) eventChannels.channel = undefined; else {
                    channellog = getChannel(msg, args.slice("c ".length).trim(), ["category", "voice"])?.id;
                    if (!channellog) report += "**[CHANNEL]** Unknown channel.\n";
                }
            }
            if (args.startsWith("b ")) {
                if (remove) {
                    eventChannels.ban = undefined;
                } else {
                    banlog = getChannel(msg, args.slice("b ".length).trim(), ["category", "voice"])?.id;
                    if (!banlog) {
                        report += "**[BAN]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("u ")) {
                if (remove) {
                    eventChannels.unban = undefined;
                } else {
                    unbanlog = getChannel(msg, args.slice("u ".length).trim(), ["category", "voice"])?.id;
                    if (!unbanlog) {
                        report += "**[UNBAN]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("e ")) {
                if (remove) {
                    eventChannels.mesEd = {
                        channel: undefined,
                        ignore: []
                    }
                } else {
                    const mesArgs = parseDash(args.slice("e ").trim());
                    if (mesArgs.length > 0 && /(?<!\\)-i /.test(args)) {
                        setMesEdIgnore = true;
                        for (const mesArg of mesArgs) {
                            if (mesArg.startsWith("i ")) {
                                const ignoreArgs = parseComa(mesArg.slice("i ".length).trim());
                                if (ignoreArgs.length > 0) {
                                    for (const ign of ignoreArgs) {
                                        if (ign.length === 0) {
                                            continue;
                                        }
                                        const chan = getChannel(msg, ign, ["category", "voice"]);
                                        if (chan) {
                                            if (mesEdlog.ignore.includes(chan.id)) {
                                                report += "**[MESEDIT_CHANNELIGNORE]** Duplicate result: <#" + chan.id +
                                                    `> with keyword: **${ign.trim()}**\n`;
                                            } else {
                                                mesEdlog.ignore.push(chan.id);
                                            }
                                        } else {
                                            report += "**[MESEDIT_CHANNELIGNORE]** Unknown channel: **" + ign.trim() + "**\n";
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const igno = /(?<!\\)-i +.+/.test(args);
                    mesEdlog.channel = getChannel(msg, args.slice("e ".length).replace(/(?<!\\)-i +.+/, "").trim(), ["category", "voice"])?.id;
                    if (!mesEdlog.channel) {
                        if (!igno) {
                            report += "**[MESEDIT]** Unknown channel.\n";
                        } else {
                            report += "**[MESEDIT]** Ignored channels reset!\n"
                        }
                    }
                }
            }
            if (args.startsWith("d ")) {
                if (remove) {
                    eventChannels.mesDel = {
                        channel: undefined,
                        ignore: []
                    }
                } else {
                    const mesArgs = parseDash(args.slice("d ").trim());
                    if (mesArgs.length > 0 && /(?<!\\)-i /.test(args)) {
                        setMesDelIgnore = true;
                        for (const mesArg of mesArgs) {
                            if (mesArg.startsWith("i ")) {
                                const ignoreArgs = parseComa(mesArg.slice("i ".length).trim());
                                if (ignoreArgs.length > 0) {
                                    for (const ign of ignoreArgs) {
                                        if (ign.length === 0) {
                                            continue;
                                        }
                                        const chan = getChannel(msg, ign, ["category", "voice"]);
                                        if (chan) {
                                            if (mesDellog.ignore.includes(chan.id)) {
                                                report += "**[MESDEL_CHANNELIGNORE]** Duplicate result: <#" + chan.id +
                                                    `> with keyword: **${ign.trim()}**\n`;
                                            } else {
                                                mesDellog.ignore.push(chan.id);
                                            }
                                        } else {
                                            report += "**[MESDEL_CHANNELIGNORE]** Unknown channel: **" + ign.trim() + "**\n";
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const igno = /(?<!\\)-i +.+/.test(args);
                    mesDellog.channel = getChannel(msg, args.slice("d ".length).replace(/(?<!\\)-i +.+/, "").trim(), ["category", "voice"])?.id;
                    if (!mesDellog.channel) {
                        if (!igno) {
                            report += "**[MESDEL]** Unknown channel.\n";
                        } else {
                            report += "**[MESDEL]** Ignored channels reset!\n"
                        }
                    }
                }
            }
            if (args.startsWith("i ")) {
                if (remove) {
                    eventChannels.invite = undefined;
                } else {
                    invitelog = getChannel(msg, args.slice("i ".length).trim(), ["category", "voice"])?.id;
                    if (!invitelog) {
                        report += "**[INVITE]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("r ")) {
                if (remove) {
                    eventChannels.role = undefined;
                } else {
                    rolelog = getChannel(msg, args.slice("r ".length).trim(), ["category", "voice"])?.id;
                    if (!rolelog) {
                        report += "**[GUILD_ROLE]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("g ")) {
                if (remove) {
                    eventChannels.guild = undefined;
                } else {
                    guildlog = getChannel(msg, args.slice("g ".length).trim(), ["category", "voice"])?.id;
                    if (!guildlog) {
                        report += "**[GUILD]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("p ")) {
                if (remove) {
                    eventChannels.member = undefined;
                } else {
                    console.log(args);
                    membernicklog = getChannel(msg, args.slice("p ".length).trim(), ["category", "voice"])?.id;
                    if (!membernicklog) {
                        report += "**[MEMBER_PROFILE]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("em ")) {
                if (remove) {
                    eventChannels.emote = undefined;
                } else {
                    emotelog = getChannel(msg, args.slice("em ".length).trim(), ["category", "voice"])?.id;
                    if (!emotelog) {
                        report += "**[EMOJI]** Unknown channel.\n";
                    }
                }
            }
            if (args.startsWith("mr ")) {
                if (remove) {
                    eventChannels.memberRole = undefined;
                } else {
                    memberroleslog = getChannel(msg, args.slice("mr ".length).trim(), ["category", "voice"])?.id;
                    if (!memberroleslog) {
                        report += "**[MEMBER_ROLE]** Unknown channel.\n";
                    }
                }
            }
        }
        async function resultEmbed(the) {
            const emb = defaultImageEmbed(msg, null, "Event Log Channels Configuration");
            emb
                .setDescription(`Set configuration using \`\`\`js\n${msg.guild.commandPrefix + the.name} [--remove] --<Category> <Channel_[Mention | Name | ID]>\`\`\`**Categories:** \`\`\`js\n[MESSAGE[EDIT, DELETE]: --[e, d] [IGNORE: -i <Channel_[Mention | Name | ID]>], JOIN: --j, LEAVE: --l, MEMBER: --p, MEMBERROLE: --mr, BAN: --b, UNBAN: --u, GUILD: --g, ROLE: --r, CHANNEL: --c, EMOJI: --em, INVITE: --i]\`\`\``)
                .addField(`Message Edit`, eventChannels?.mesEd?.channel ? `<#${eventChannels?.mesEd.channel}>\n**Ignores:** ${eventChannels?.mesEd?.ignore?.length > 0 ?
                    "<#" + eventChannels?.mesEd.ignore.join(">, <#") + ">" : "None"}`
                    : "Not set", true)
                .addField(`Message Delete`, eventChannels?.mesDel?.channel ? `<#${eventChannels?.mesDel.channel}>\n**Ignores:** ${eventChannels?.mesDel?.ignore?.length > 0 ?
                    "<#" + eventChannels?.mesDel.ignore.join(">, <#") + ">" : "None"}`
                    : "Not set", true)
                .addField(`Member Join`, eventChannels?.join ? `<#${eventChannels.join}>` : "Not set", true)
                .addField(`Member Leave`, eventChannels?.leave ? `<#${eventChannels.leave}>` : "Not set", true)
                .addField(`Member Profile Updates`, eventChannels?.member ? `<#${eventChannels?.member}>` : "Not set", true)
                .addField(`Member Role Updates`, eventChannels?.memberRole ? `<#${eventChannels?.memberRole}>` : "Not set", true)
                .addField(`Member Ban`, eventChannels?.ban ? `<#${eventChannels?.ban}>` : "Not set", true)
                .addField(`Member Unban`, eventChannels?.unban ? `<#${eventChannels?.unban}>` : "Not set", true)
                .addField(`Server Updates`, eventChannels?.guild ? `<#${eventChannels?.guild}>` : "Not set", true)
                .addField(`Server Role Updates`, eventChannels?.role ? `<#${eventChannels?.role}>` : "Not set", true)
                .addField(`Server Channels Updates`, eventChannels?.channel ? `<#${eventChannels?.channel}>` : "Not set", true)
                .addField(`Server Emoji Updates`, eventChannels?.emote ? `<#${eventChannels?.emote}>` : "Not set", true)
                .addField(`Server Invites`, eventChannels?.invite ? `<#${eventChannels?.invite}>` : "Not set", true);
            return emb;
        }
        eventChannels = {
            join: joinlog ?? eventChannels?.join,
            leave: leavelog ?? eventChannels?.leave,
            channel: channellog ?? eventChannels?.channel,
            unban: unbanlog ?? eventChannels?.unban,
            ban: banlog ?? eventChannels?.ban,
            mesEd: {
                channel: mesEdlog.channel ?? eventChannels?.mesEd?.channel,
                ignore: setMesEdIgnore ? mesEdlog.ignore : eventChannels?.mesEd?.ignore
            },
            mesDel: {
                channel: mesDellog.channel ?? eventChannels?.mesDel?.channel,
                ignore: setMesDelIgnore ? mesDellog.ignore : eventChannels?.mesDel?.ignore
            },
            invite: invitelog ?? eventChannels?.invite,
            role: rolelog ?? eventChannels?.role,
            guild: guildlog ?? eventChannels?.guild,
            member: membernicklog ?? eventChannels?.member,
            emote: emotelog ?? eventChannels?.emote,
            memberRole: memberroleslog ?? eventChannels?.memberRole
        }
        const r = await msg.guild.setEventChannels(eventChannels);
        if (r) {
            report += "Event Log Channels set!\n";
            report += "\n**SUMMARY:**";
        }
        return trySend(this.client, msg, (await resultEmbed(this)).setDescription(report.slice(0, 2048)));
    }
};