/** @param {NS} ns **/
function calcBestRam(ns, numServers) {
  let ramList = [];

  let i = 1;
  while (ramList.length < 20) {
    let result = Math.pow(2, i);
    ramList.push(result);
    i++;
  }

  const affordableRamList = ramList.filter(ram => (numServers * ns.getPurchasedServerCost(ram)) <= ns.getServerMoneyAvailable('home'));

  const bestRam = ramList[affordableRamList.length - 1];
  return bestRam;
}

function deletePurchasedServers(ns, numServers, newRam) {
  const pservs = ns.getPurchasedServers();

  let pservObjs = pservs.map(server => {
    return {
      'name': server,
      'ram': ns.getServerMaxRam(server)
    }
  })

  pservObjs.sort((a, b) => {
    return a.ram - b.ram;
  });

  let pservNames = [];

  pservObjs.forEach((server, index) => {
    if (ns.getServerMaxRam(server.name) >= newRam) {
      return;
    } else if (index < numServers) {
      ns.killall(server.name);
      ns.tprint("deleting " + server.name);
      ns.deleteServer(server.name);
      return pservNames.push(server.name);
    }
  });

  return pservNames;
}

function deleteServer(ns, server) {
  ns.killall(server.name);
  ns.tprint("deleting   : " + server.name + " (ram = " + server.ram + ")");
  ns.deleteServer(server.name);
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}


export async function main(ns) {




  while (true) {
    var pservs = ns.getPurchasedServers();
    var currentNumServers = pservs.length;
    var targetNumServers = ns.getPurchasedServerLimit();
    const ram = calcBestRam(ns, targetNumServers);

    if (ram > 0) {

    ns.tprint(" ------------------ ");
    ns.tprint("servers    : ");
    ns.tprint("have       : " + currentNumServers);
    ns.tprint("target     : " + targetNumServers);
    ns.tprint("target ram : " + ram);
    ns.tprint(" ------------------ ");


    let pservObjs = pservs.map(server => {
      return {
        'name': server,
        'ram': ns.getServerMaxRam(server)
      }
    })
    var ownedServersUnderTargetRam = pservObjs.filter(f => f.ram < ram);

    ownedServersUnderTargetRam.forEach((server, index) => {
      deleteServer(ns, server);
    })

    pservs = ns.getPurchasedServers();
    currentNumServers = pservs.length;

    ns.tprint(" ------------------ ");
    ns.tprint("servers    : ");
    ns.tprint("have       : " + currentNumServers);
    ns.tprint("target     : " + targetNumServers);
    ns.tprint("target ram : " + ram);
    ns.tprint(" ------------------ ");

    while (ns.getPurchasedServers().length < targetNumServers) {
      var newServerName = "home-" + ram +"-" + uuidv4();
      ns.tprint("buying     : " + newServerName + " (ram = " + ram + ")");
      ns.purchaseServer(newServerName, ram);
    }

    await ns.asleep(1000 * 60);

  }
  }

}
