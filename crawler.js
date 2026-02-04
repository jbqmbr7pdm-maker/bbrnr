/** @param {NS} ns */
export async function main(ns) {

  ns.disableLog("getHackingLevel");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerRequiredHackingLevel");

  var targetServer = '';
  var newTargetServer = '';
  while (true) {
    newTargetServer = getTargetServer(ns);
    if (newTargetServer != targetServer) {
      await getRootAccess(ns, newTargetServer);
      ns.tprint("crawler.js now targeting " + newTargetServer);
    }
    for (const host of getHostServers(ns)) {
      await ns.asleep(1000 * 1);
      await runHack(ns, host, targetServer, newTargetServer);
    }
    targetServer = newTargetServer;
    await ns.asleep(1000 * 60);
    ns.tprint("awake!")
  }
}

async function killAndRerun(ns, pid, host, target) {
  var hacker = "hacker.js"
  if (pid > 0) {
    ns.tprint("killing " + hacker + " on " + host);
    await ns.kill("hacker.js", host, target)
  }
  await ns.scp(hacker, host, "home");
  var threads = getNoOfThreads(ns, hacker, host);


  //await ns.exec(hacker, host, threads, target)
  if (threads > 0) {
    ns.tprint(` ======== running ${hacker}, on ${host}, targeting ${target}, with ${threads} threads ======== `);
    ns.exec(hacker, host, threads, target);
  }
}

async function runHack(ns, host, oldtarget, newtarget) {
  var hacker = "hacker.js"
  await getRootAccess(ns, host);

  var runningScript = ns.getRunningScript(hacker, host, oldtarget);

  if (runningScript == null) {
    await killAndRerun(ns, 0, host, newtarget);
  } else if (oldtarget != newtarget && script_pid > 0) {
    await killAndRerun(ns, runningScript.pid, host, newtarget);
  } else {

    var script_pid = runningScript.pid;
    var script_ramUsage = runningScript.ramUsage;
    var script_threads = runningScript.threads;
    var script_target = runningScript.args[0];

    if (script_target != newtarget) {
      await killAndRerun(ns, script_pid, host, newtarget);
    } else if (script_pid <= 0) {
      await killAndRerun(ns, script_pid, host, newtarget);
    } else if (script_threads > getNoOfThreads(ns, hacker, host, script_ramUsage)) {
      await killAndRerun(ns, script_pid, host, newtarget);
    }
  }


}

function getNoOfThreads(ns, script, host, ramToSubtract = 0) {
  var scriptRAM = ns.getScriptRam(script);
  var hostRAM = (ns.getServerMaxRam(host) - (ns.getServerUsedRam(host) - ramToSubtract));
  var noOfThreads = Math.floor(hostRAM / scriptRAM);
  return noOfThreads;
}

function getTargetServer(ns) {
  var servers = getTargetServers(ns);
  var maxMaxMoney = 0;
  var target = '';
  for (const server of servers) {
    var t = ns.getServerMaxMoney(server);
    if (t > maxMaxMoney) {
      maxMaxMoney = t;
      target = server;
    }
  }
  return target;
}

function getMaxPortsRequired(ns) {
  var filenames = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  var maxPortsRequired = 0;
  for (const f of filenames) {
    if (ns.fileExists(f, "home")) {
      maxPortsRequired++;
    }
    // else if (ns.purchaseTor() && ns.purchaseProgram(f)) {
    // 	maxPortsRequired++;
    // }
  }
  return maxPortsRequired;
}

// function getValidServers(ns, parent, servers) {
//   var okServers = [];
//   var maxPortsRequired = getMaxPortsRequired(ns);
//   for (const server of servers) {
//     if (server === 'home' || server === parent)
//       continue;

//     if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server) &&
//       ns.getServerNumPortsRequired(server) <= maxPortsRequired) {
//       okServers.push(server);
//     }
//   }

//   return okServers;
// }

function getAllServers(ns) {
  const foundServers = new Set([`home`]);
  for (const server of foundServers) ns.scan(server).forEach(adjacentServer => foundServers.add(adjacentServer));
  return [...foundServers].sort();
}

function getTargetServers(ns) {
  var servers = getAllServers(ns);
  var maxPortsRequired = getMaxPortsRequired(ns);
  var targetServers = [];
  for (const server of servers) {
    if (server === 'home')
      continue;
    if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server) &&
      ns.getServerNumPortsRequired(server) <= maxPortsRequired) {
      targetServers.push(server);
    }
  }
  return targetServers;
}

function getHostServers(ns) {
  var servers = getAllServers(ns);
  var maxPortsRequired = getMaxPortsRequired(ns);
  var targetServers = [];
  for (const server of servers) {
    if ((ns.hasRootAccess(server)) || (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server) &&
      ns.getServerNumPortsRequired(server) <= maxPortsRequired)) {
      targetServers.push(server);
    }
  }
  return targetServers;
}

// function getAllServers(ns) {
//   let hostName = ns.getHostname();
//   let scanArray = [hostName];
//   let currentScanLength = 0;
//   let servers = [];
//   while (currentScanLength < scanArray.length) {
//     let previousScanLength = currentScanLength;
//     currentScanLength = scanArray.length;
//     for (let i = previousScanLength; i < currentScanLength; i++) {
//       let currentHost = scanArray[i];
//       servers.push(currentHost);
//       let newScan = ns.scan(currentHost);
//       for (let j = 0; j < newScan.length; j++) {
//         if (scanArray.indexOf(newScan[j]) == -1) {
//           scanArray.push(newScan[j]);
//         }
//       }
//     }
//   }

//   servers = getValidServers(ns, hostName, servers);
//   return servers;
// }


async function getRootAccess(ns, server) {


  if (ns.fileExists("BruteSSH.exe", "home")) {
    await ns.brutessh(server);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    await ns.ftpcrack(server);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    await ns.relaysmtp(server);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    await ns.httpworm(server);
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    await ns.sqlinject(server);
  }

  if (!ns.hasRootAccess(server)) {
    await ns.nuke(server);
    // /await ns.installBackdoor(server);
  }
}
