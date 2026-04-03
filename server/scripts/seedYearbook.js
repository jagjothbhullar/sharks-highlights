import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  console.log('[seed-yearbook] Starting...');

  const players = await prisma.player.findMany({
    include: {
      goals: {
        where: { isSharksGoal: true, brightcoveId: { not: null } },
        include: { game: true },
      },
    },
  });

  const byName = Object.fromEntries(players.map(p => [p.lastName, p]));
  function randGoal(player) { return player.goals.length > 0 ? pick(player.goals) : null; }

  const entries = [
    { p: 'Celebrini', name: 'SharksFanForever', note: 'Generational. We waited years for this kid and he exceeded every expectation. 40 goals as a sophomore is insane.' },
    { p: 'Celebrini', name: 'TealAndBlack88', note: 'That hat trick against the Rangers in October was the moment I knew this season was different. Franchise cornerstone.' },
    { p: 'Celebrini', name: 'SJBarracuda', note: 'My daughter wants to be Macklin Celebrini when she grows up. Thanks for giving us someone to believe in.' },
    { p: 'Celebrini', name: 'Section209', note: 'Been a season ticket holder since 2003. Havent been this excited about a Shark since Jumbo and Patty.' },
    { p: 'Celebrini', name: 'FinnyTheFan', note: 'That overtime winner against Vegas was the loudest Ive ever heard the Tank. Gave me chills.' },
    { p: 'Celebrini', name: 'HockeyMom408', note: 'My son got your autograph after the game vs Colorado. You made his whole year. Thank you Macklin!' },
    { p: 'Celebrini', name: 'BayAreaPuckhead', note: '105 points. Let that sink in. On a rebuilding team. The Calder was never in doubt.' },
    { p: 'Celebrini', name: 'SharksReddit', note: 'The way you create space out of nothing is art. Best hands in the league already and youre 19.' },
    { p: 'Celebrini', name: 'PuckDaddy', note: 'Celebrini to Smith is the best 1-2 punch weve had since Thornton to Marleau. Future is NOW.' },
    { p: 'Celebrini', name: 'SJSharkie', note: 'Every shift you take something happens. Cant remember the last Shark who controlled a game like this.' },
    { p: 'Celebrini', name: 'TealTownUSA', note: 'That snipe against Dostal on April 1 to tie it up? Clutch gene is real. This kid is BUILT different.' },
    { p: 'Celebrini', name: 'SanJoseSharks', note: 'Thank you for making Sharks hockey must-watch again. This city needed it.' },
    { p: 'Celebrini', name: 'BarDown71', note: 'Saw you dangle through three Oilers defenders in December. My jaw literally dropped. Generational.' },
    { p: 'Celebrini', name: 'NorcalNHL', note: 'You play like every shift matters. That work ethic is contagious for the whole locker room.' },
    { p: 'Celebrini', name: 'JumboJoeFan19', note: 'Jumbo would be proud of what youre building here. Carry the torch kid.' },

    { p: 'Smith', name: 'WillPower4', note: 'That power play one-timer is absolutely lethal. Goalies dont even see it coming.' },
    { p: 'Smith', name: 'SharkTankLoud', note: 'Smith and Celebrini on the same line is cheat codes. Best young duo in the NHL.' },
    { p: 'Smith', name: 'FreshPrinceSJ', note: 'Fresh Prince of San Jose! 22 goals as a rookie is no joke. PPG specialist.' },
    { p: 'Smith', name: 'Section228', note: 'That slapper against Dostal was a rocket. Goalies are going to have nightmares about that release.' },
    { p: 'Smith', name: 'TealArmy', note: 'Will Smith chose the right career. His vision on the ice is next level. Sees plays before they happen.' },
    { p: 'Smith', name: 'SharksLifer', note: 'Remember when people said taking two centers was a mistake? Yeah about that...' },
    { p: 'Smith', name: 'BayAreaHockey', note: 'The chemistry with Celebrini is unreal. You can tell they just KNOW where each other will be.' },
    { p: 'Smith', name: 'PuckNorris', note: '54 points as a rookie. Thats Calder-worthy in any other year without his linemate hogging the spotlight.' },
    { p: 'Smith', name: 'SJHockeyFan', note: 'That assist on Celebrinis PPG on April 1st was a thing of beauty. Vision for days.' },
    { p: 'Smith', name: 'SharkBait00', note: 'Smoothest skater on the team. Makes everything look effortless.' },
    { p: 'Smith', name: 'DigitalTeal', note: 'Smith on the power play is automatic. That one-timer from the circle is already elite.' },
    { p: 'Smith', name: 'NHLFanatic', note: 'Going to be a perennial all-star. Book it. The kid is special.' },

    { p: 'Eklund', name: 'SwedenToSJ', note: 'Willy E finally putting it all together this year. 43 points and that vision is world class.' },
    { p: 'Eklund', name: 'EklundIsland', note: 'The patience you play with is insane. That sauce pass to Toffoli against Minnesota was disgusting.' },
    { p: 'Eklund', name: 'SharksFanSWE', note: 'Watching you from Sweden and so proud! You are the future of Swedish hockey in SJ.' },
    { p: 'Eklund', name: 'Section214', note: 'Eklund quietly having a breakout year and nobody outside SJ is talking about it. Fine by me.' },
    { p: 'Eklund', name: 'TealPuck72', note: 'Best playmaker on the team not named Celebrini. Those no-look passes are filthy.' },
    { p: 'Eklund', name: 'SharkByte', note: '12 goals and 31 assists is a legit top-6 season. And hes only getting better.' },
    { p: 'Eklund', name: 'BarracudaGrad', note: 'Watched you in the AHL and always knew you had it. So happy to see it click at the NHL level.' },
    { p: 'Eklund', name: 'SJHockeyMom', note: 'My kids favorite player! He loves your celebration after goals. Keep being you William!' },
    { p: 'Eklund', name: 'TealTide', note: 'That goal against Dallas where you walked the entire D-zone was FILTHY. Top shelf beauty.' },
    { p: 'Eklund', name: 'SanJoseIce', note: 'The Swedish connection with the young core is electric. Building something special.' },

    { p: 'Toffoli', name: 'TopTittyToffoli', note: 'Veteran leadership this team needed. 18 goals and always in the right spot. Playoff Toffoli activated.' },
    { p: 'Toffoli', name: 'Section216', note: 'That snipe against Edmonton was pure class. Still got it.' },
    { p: 'Toffoli', name: 'SharksTillIDie', note: 'Thank you for showing the young guys how its done. Your experience is invaluable to this group.' },

    { p: 'Graf', name: 'GrafGrind', note: '19 goals out of nowhere! This dude earned every minute of ice time. Grinder mentality.' },
    { p: 'Graf', name: 'TealGrit', note: 'Most surprising breakout of the season. Nobody saw 41 points from Collin Graf coming.' },

    { p: 'Wennberg', name: 'WennyThePooh', note: 'That game winner against Anaheim with under a minute left? CLUTCH. 17 goals and 50 points from a setup man.' },
    { p: 'Wennberg', name: 'CenterIce21', note: 'Wennberg is the most underrated player in the NHL. Fight me.' },
    { p: 'Wennberg', name: 'SharksFam', note: 'Best free agent signing we made. Quiet, consistent, and deadly.' },

    { p: 'Gaudette', name: 'Gaud81', note: '16 goals from the bottom six? Thats elite depth scoring. Keep grinding Adam.' },
    { p: 'Gaudette', name: 'SharkPit', note: 'That hatty against Chicago was legendary. The Tank went absolutely nuts.' },

    { p: 'Sherwood', name: 'SherwoodForest', note: '21 goals and plays like his hair is on fire every shift. Pure energy.' },
    { p: 'Sherwood', name: 'TealWarrior', note: 'Kiefer Sherwood is what happens when talent meets effort. Fan favorite for a reason.' },

    { p: 'Ferraro', name: 'FerraroFan38', note: 'Best defensive dman on the team. That hip check against McDavid lives rent free in my head.' },
    { p: 'Ferraro', name: 'BlueLineBoss', note: '6 goals from a shutdown D-man? Plus hes physical? Mario is a beast.' },

    { p: 'Klingberg', name: 'KlingOn', note: 'The comeback story of the year. 10 goals from the blue line and quarterbacking the PP. Welcome back John.' },

    { p: 'Reaves', name: 'ReavesSmash', note: 'The enforcer we needed. Nobody messes with the young guys when Reaves is on the ice. Legend.' },
    { p: 'Reaves', name: 'SharksFight', note: 'Three goals AND he drops the gloves? Ryan Reaves is a national treasure.' },
  ];

  let created = 0;
  for (const entry of entries) {
    const player = byName[entry.p];
    if (!player) { console.log(`[seed-yearbook] Player ${entry.p} not found, skipping`); continue; }
    const goal = randGoal(player);
    await prisma.yearbookEntry.create({
      data: {
        playerId: player.id,
        favoriteGoalId: goal?.id || null,
        note: entry.note,
        signerName: entry.name,
      },
    });
    created++;
  }

  console.log(`[seed-yearbook] Created ${created} yearbook entries`);
  await prisma.$disconnect();
}

main();
