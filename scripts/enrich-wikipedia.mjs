// Image/reference metadata only. Never downloads article bodies or scrapes pages.
// Source research is performed with the offline ZIM archive (see offline-import.py).
import { readFile, writeFile } from 'node:fs/promises'
const { nodes } = JSON.parse(await readFile('public/data/catalog.json', 'utf8'))
const target = 'public/data/wikipedia.json'
let cache = {}
try { cache = JSON.parse(await readFile(target, 'utf8')) } catch {}
const refresh = process.argv.includes('--refresh')
const idsArg = process.argv.find(a => a.startsWith('--ids='))?.slice(6).split(',')
const creditsOnly = process.argv.includes('--credits')
const wanted = creditsOnly ? [] : nodes.filter(n => (!idsArg || idsArg.includes(n.id)) && (refresh || !cache[n.id] || cache[n.id].requestedTitle !== n.wiki))
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
let nextRequest = 0
async function query(host, params) {
  const url = new URL(`https://${host}/w/api.php`)
  url.search = new URLSearchParams({ action:'query', format:'json', formatversion:'2', maxlag:'5', ...params })
  for (let attempt=0; attempt<4; attempt++) {
    await pause(Math.max(0, nextRequest - Date.now()))
    const r = await fetch(url, { headers: { 'User-Agent': 'HumanityTechTree/0.1 (personal static educational atlas; image metadata only)' }, signal:AbortSignal.timeout(60000) })
    nextRequest = Date.now() + 6000
    if (!r.ok) { if (attempt===3) throw new Error(`Metadata request failed: ${r.status}`); const delay = Math.max(60000, Number(r.headers.get('retry-after') || 60) * 1000); console.log(`Metadata service returned ${r.status}; respecting a ${delay/1000}s pause.`); await pause(delay); continue }
    const data = await r.json()
    if (data.error) { if(attempt===3) throw new Error(data.error.info); await pause(2000*(attempt+1)); continue }
    return data.query ?? {}
  }
}
function plain(value = '') {
  return value.replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()
}
for(let offset=0;offset<wanted.length;offset+=40) {
  const batch = wanted.slice(offset,offset+40)
  const q = await query('en.wikipedia.org', { titles:batch.map(n=>n.wiki).join('|'), redirects:'1', prop:'info|pageimages|pageprops', inprop:'url', piprop:'thumbnail|name', pilicense:'free', pithumbsize:'500', pilimit:'50', ppprop:'disambiguation' })
  const aliases = new Map([...(q.normalized??[]),...(q.redirects??[])].map(a=>[a.from,a.to]))
  const resolve = title => {const seen=new Set();while(aliases.has(title)&&!seen.has(title)){seen.add(title);title=aliases.get(title)}return title}
  const pages = new Map((q.pages??[]).map(p=>[p.title,p]))
  const imageTitles = [...new Set((q.pages??[]).filter(p=>p.pageimage).map(p=>`File:${p.pageimage}`))]
  let imagePages = new Map()
  if(imageTitles.length) {
    const iq = await query('commons.wikimedia.org', { titles:imageTitles.join('|'), redirects:'1', prop:'imageinfo', iiprop:'url|extmetadata', iiurlwidth:'500' })
    imagePages = new Map((iq.pages??[]).map(p=>[p.title.replaceAll('_',' '),p]))
  }
  for(const n of batch) {
    const p = pages.get(resolve(n.wiki))
    if(!p || p.missing) { cache[n.id]={requestedTitle:n.wiki,title:n.wiki,missing:true,checked:new Date().toISOString().slice(0,10)}; continue }
    const file = imagePages.get(`File:${p.pageimage}`.replaceAll('_',' '))?.imageinfo?.[0]
    const m = file?.extmetadata ?? {}
    cache[n.id] = {
      requestedTitle:n.wiki,title:p.title,url:p.canonicalurl??p.fullurl,pageId:p.pageid,revision:p.lastrevid,
      checked:new Date().toISOString().slice(0,10),source:'wikimedia-metadata',disambiguation:p.pageprops?.disambiguation!==undefined,
      ...(p.thumbnail?.source ? {thumbnail:p.thumbnail.source.replace(/\?.*$/,''),imageTitle:p.pageimage,
        imagePage:file?.descriptionurl??`https://en.wikipedia.org/wiki/File:${encodeURIComponent(p.pageimage)}`,
        imageArtist:plain(m.Artist?.value),imageLicense:plain(m.LicenseShortName?.value),imageLicenseUrl:m.LicenseUrl?.value,
        imageDescription:plain(m.ImageDescription?.value).slice(0,240)} : {})
    }
  }
  await writeFile(target,JSON.stringify(cache))
  console.log(`Image metadata ${Math.min(offset+40,wanted.length)}/${wanted.length}; ${Object.values(cache).filter(m=>m.thumbnail).length} CDN images.`)
  await pause(400)
}
// This maintenance pass reads only missing image credits, without repeating
// article metadata requests. File names normalize underscores to spaces.
if (creditsOnly) {
  const entries = Object.entries(cache).filter(([id,m]) => m.thumbnail && m.imageTitle && (!m.imageArtist || !m.imageLicense) && (!idsArg || idsArg.includes(id)))
  for (let offset=0;offset<entries.length;offset+=40) {
    const batch=entries.slice(offset,offset+40)
    const titles=[...new Set(batch.map(([,m])=>`File:${m.imageTitle}`))]
    const q=await query('commons.wikimedia.org',{titles:titles.join('|'),redirects:'1',prop:'imageinfo',iiprop:'url|extmetadata'})
    const pages=new Map((q.pages??[]).map(p=>[p.title.replaceAll('_',' '),p]))
    const redirects=new Map((q.redirects??[]).map(p=>[p.from.replaceAll('_',' '),p.to.replaceAll('_',' ')]))
    const localFiles = titles.filter(t => !pages.get(redirects.get(t.replaceAll('_',' ')) ?? t.replaceAll('_',' '))?.imageinfo?.[0])
    if(localFiles.length) {
      const local = await query('en.wikipedia.org',{titles:localFiles.join('|'),redirects:'1',prop:'imageinfo',iiprop:'url|extmetadata'})
      for(const p of local.pages??[]) if(p.imageinfo?.[0]) pages.set(p.title.replaceAll('_',' '),p)
      for(const p of local.redirects??[]) redirects.set(p.from.replaceAll('_',' '),p.to.replaceAll('_',' '))
    }
    for (const [id,m] of batch) {
      let title=`File:${m.imageTitle}`.replaceAll('_',' ')
      title=redirects.get(title)??title
      const file=pages.get(title)?.imageinfo?.[0]
      if(!file) continue
      const meta=file.extmetadata??{}
      cache[id]={...m,imagePage:file.descriptionurl,imageArtist:plain(meta.Artist?.value),imageLicense:plain(meta.LicenseShortName?.value),imageLicenseUrl:meta.LicenseUrl?.value,imageDescription:plain(meta.ImageDescription?.value).slice(0,240)}
    }
    await writeFile(target,JSON.stringify(cache))
    console.log(`Image credits ${Math.min(offset+40,entries.length)}/${entries.length}.`)
  }
}
const missing = nodes.filter(n=>cache[n.id]?.missing).map(n=>`${n.id}: ${n.wiki}`)
const ambiguous = nodes.filter(n=>cache[n.id]?.disambiguation).map(n=>`${n.id}: ${n.wiki}`)
console.log(JSON.stringify({total:nodes.length,images:Object.values(cache).filter(m=>m.thumbnail).length,missing,ambiguous},null,2))
