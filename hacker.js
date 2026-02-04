/** @param {NS} ns */
export async function main(ns) {
  //ns.tprint(ns.args);
  var targetServer = ns.args[0];
  var me = ns.getHostname();
  ns.tprint(`started hacker.js, on ${me}, targeting ${targetServer}`);
  while (true) {
    await JobDecider(ns, targetServer);
  }
}
//   var v = "1.4"

//   var me = ns.getHostname();
//   var meRAM = ns.getScriptRam("crawler.js", me);
//   var availRAM = ns.getServerMaxRam(me) - ns.getServerUsedRam(me);

//   ns.tprint("this scripts RAM = " + meRAM);
//   ns.tprint("availRAM RAM = " + availRAM);
//   if (meRAM > availRAM) {
//     ns.tprint("running another instance of hacker.js");
//     ns.run("hacker.js");
//   }
//   if (me != "home") {
//     while (true) {
//       await DoStuff(me);
//     }
//   }


function msToHMS_Timespan(ms) {
  // 1- Convert to seconds:
  let seconds = ms / 1000;
  // 2- Extract hours:
  const hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = parseInt(seconds / 60) + (60*hours); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = Math.round( seconds % 60);
  return (minutes + "m " + seconds + "s");
}
function msToHMS_Time(ms) {
  return new Date(ms).toLocaleString();
}


async function Hack(ns, serverName) {
  var hackTime = await ns.getHackTime(serverName);
  ns.tprint("hacking " + serverName);
  var start = Date.now();
  var timeTakeMS = hackTime;
  ns.tprint("start @ " + msToHMS_Time(start) + " for " + msToHMS_Timespan(timeTakeMS) + " to " + msToHMS_Time(start+timeTakeMS));
  await ns.hack(serverName);
  ns.tprint("hacked " + serverName);
}
async function Weaken(ns, serverName) {
  var weakenTime = await ns.getWeakenTime(serverName);
  ns.tprint("weakening " + serverName);
  var start = Date.now();
  //ns.tprint(start);
  var timeTakeMS = weakenTime;
  //ns.tprint(start+timeTakeMS);
  ns.tprint("start @ " + msToHMS_Time(start) + " for " + msToHMS_Timespan(timeTakeMS) + " to " + msToHMS_Time(start+timeTakeMS));
  await ns.weaken(serverName);
  ns.tprint("weakened " + serverName);
}
async function Grow(ns, serverName) {
  var growTime = await ns.getGrowTime(serverName);
  ns.tprint("growing " + serverName);
  var start = Date.now();
  var timeTakeMS = growTime;
  ns.tprint("start @ " + msToHMS_Time(start) + " for " + msToHMS_Timespan(timeTakeMS) + " to " + msToHMS_Time(start+timeTakeMS));
  await ns.grow(serverName);
  ns.tprint("grown " + serverName);
}

async function JobDecider(ns, serverName) {
  ns.tprint(" ======================== ");
  var moneyAvailable = await ns.getServerMoneyAvailable(serverName);
  var maxMoney = await ns.getServerMaxMoney(serverName);
  var secLevel = await ns.getServerSecurityLevel(serverName);
  var minSecLevel = await ns.getServerMinSecurityLevel(serverName);

  var moneyThreshold = maxMoney * 0.5
  var secThreshold = minSecLevel * 1.1

  if (secLevel > secThreshold) {
    await Weaken(ns, serverName);
  } else if (moneyAvailable < moneyThreshold) {
    await Grow(ns, serverName);
  } else  {
    await Hack(ns, serverName);
  }
  ns.tprint(" ======================== ");

}

// }
