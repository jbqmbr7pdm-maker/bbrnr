/** @param {NS} ns */
export async function main(ns) {

  var scripts = [
    { "script": "buy-servers", "autorun": "true" },
    { "script": "hacker.js", "autorun": "false" },
    { "script": "crawler.js", "autorun": "true" }
  ]


  scripts.forEach((s, index) => {
    ns.wget("https://raw.githubusercontent.com/jbqmbr7pdm-maker/bbrnr/refs/heads/main/" + s.script, s.script);
    if (s.autorun) {
      ns.run(s.script);
    }
  })
}
