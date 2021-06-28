'use strict';

const { GuildMember } = require("discord.js");
const { getChannel, defaultEventLogEmbed, trySend } = require("../functions");
const getColor = require("../getColor");

/**
 * 
 * @param {GuildMember} member 
 * @returns 
 */
module.exports = (member) => {
    if (member.guild.eventChannels?.leave) {
        const log = getChannel(member, member.guild.eventChannels.leave);
        if (!log) return;
        const days = Math.floor(new Date(new Date().valueOf() + member.client.matchTimestamp - member.joinedAt.valueOf()).valueOf() / 86400000),
            emb = defaultEventLogEmbed(member.guild);
        emb
            .setTitle("Member `" + member.user.tag + "` left")
            .setThumbnail(member.user.displayAvatarURL({ format: "png", size: 4096, dynamic: true }))
            .setColor(getColor("yellow"))
            .addField("Registered", "**" + member.user.createdAt.toUTCString().slice(0, -4) + "**", true)
            .addField("Joined", "**" + member.joinedAt.toUTCString().slice(0, -4) + "**" + `\n(${days > 0 ? `${days} day${days > 1 ? "s" : ""} ago` : "Today"})`, true)
            .addField("Roles", member.roles.cache.size > 1 ? "<@&" + member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id).slice(0, -1).join(">, <@&") + ">" : "`[NONE]`")
            .setDescription(`<@!${member.id}> (${member.id}) just left.\nWe have ${member.guild.memberCount} total members now.`);
        return trySend(member.client, log, emb);
    }
}