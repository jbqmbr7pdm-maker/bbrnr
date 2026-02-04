/** @param {NS} ns */
export async function main(ns) {

  var scripts = [
    { "script": "buy-servers.js", "autorun": "true" },
    { "script": "hacknet.js", "autorun": "true" },
    { "script": "hacker.js", "autorun": "false" },
    { "script": "crawler.js", "autorun": "true" }
  ]

  /*
    wget https://raw.githubusercontent.com/jbqmbr7pdm-maker/bbrnr/refs/heads/main/startup.js startup.js
    run startup.js
    alias buyOpeners="buy bruteSSH.exe ; buy FTPcrack.exe ; buy relaySMTP.exe ; buy HTTPworm.exe ; buy SQLinject.exe"
  */


  scripts.forEach((s, index) => {
    ns.wget("https://raw.githubusercontent.com/jbqmbr7pdm-maker/bbrnr/refs/heads/main/" + s.script, s.script);
    if (s.autorun == "true") {
      ns.run(s.script);
    }
  })
}
