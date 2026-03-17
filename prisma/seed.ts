import {
  ApplicationScope,
  ApplicationTemplateStatus,
  GuildRole,
  MemberStatus,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { discordId: "123456789012345678" },
    update: {},
    create: {
      discordId: "123456789012345678",
      username: "vasek",
      globalName: "Vasek"
    }
  });

  const guild = await prisma.guild.upsert({
    where: { slug: "ems-reux-rp" },
    update: {},
    create: {
      discordGuildId: "987654321098765432",
      name: "EMS / ReuX RP",
      slug: "ems-reux-rp",
      description: "Unified ops demo guild",
      primaryColor: "#8b5cf6",
      accentColor: "#facc15"
    }
  });

  const member = await prisma.guildMember.upsert({
    where: {
      guildId_userId: {
        guildId: guild.id,
        userId: user.id
      }
    },
    update: {},
    create: {
      guildId: guild.id,
      userId: user.id,
      role: GuildRole.OWNER,
      status: MemberStatus.ACTIVE,
      isActive: true,
      nickname: "GameFunns98"
    }
  });

  const workflow = await prisma.workflowDefinition.upsert({
    where: {
      guildId_slug: {
        guildId: guild.id,
        slug: "default-ems-flow"
      }
    },
    update: {},
    create: {
      guildId: guild.id,
      name: "Default EMS Flow",
      slug: "default-ems-flow",
      isDefault: true,
      stages: {
        create: [
          { key: "submitted", label: "Submitted", sortOrder: 1 },
          { key: "review", label: "Pending Review", sortOrder: 2 },
          { key: "interview", label: "Interview", sortOrder: 3 }
        ]
      }
    }
  });

  const template = await prisma.applicationTemplate.upsert({
    where: {
      guildId_slug: {
        guildId: guild.id,
        slug: "ems-application"
      }
    },
    update: {},
    create: {
      guildId: guild.id,
      workflowDefinitionId: workflow.id,
      name: "EMS Application",
      slug: "ems-application",
      description: "Primary recruitment template",
      status: ApplicationTemplateStatus.LIVE,
      scope: ApplicationScope.PUBLIC,
      isPublic: true,
      fields: {
        create: [
          {
            key: "motivation",
            label: "Why do you want to join?",
            type: "long_text",
            isRequired: true,
            sortOrder: 1
          }
        ]
      },
      limits: {
        create: [
          {
            type: "MAX_ACTIVE_SUBMISSIONS",
            value: "2"
          }
        ]
      }
    }
  });

  console.log({
    guildId: guild.id,
    userId: user.id,
    memberId: member.id,
    templateId: template.id
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });