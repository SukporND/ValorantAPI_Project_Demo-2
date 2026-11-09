import { useEffect, useMemo, useState } from 'react'
import { HashTable, mergeSort } from './dataStructures.js'
import './App.css'

const API_BASE = '/api'
const LOADOUT_STORAGE_KEY = 'valorant-dataforge-loadout-v1'
const COPY = {
  en: {
    navExplorer: 'Explorer', navLoadout: 'Loadout builder', live: 'LIVE GAME DATA',
    heroEyebrow: 'VALORANT API EXPLORER', heroTitleA: 'Know the game.', heroTitleB: 'Own the meta.',
    heroDescription: 'Explore every Agent, weapon, skin and map. Then craft a loadout that feels like yours.',
    exploreDatabase: 'EXPLORE THE DATABASE', poweredBy: 'Powered by the community VALORANT API',
    nextMatch: 'YOUR NEXT MATCH', archive: 'THE ARCHIVE', archiveTitleA: 'Game data,', archiveTitleB: 'unlocked.',
    archiveDescription: 'Browse live data straight from the public VALORANT API.',
    heroPreview: 'Your current loadout preview', agentRole: 'AGENT ROLE', selected: 'SELECTED',
    chooseAgent: 'CHOOSE YOUR AGENT', primary: 'PRIMARY', sidearmLabel: 'SIDEARM', mapLabel: 'MAP',
    primaryStat: 'PRIMARY WEAPON', favoriteMapStat: 'FAVORITE MAP', damageRanges: 'DAMAGE BY RANGE',
    head: 'Head', body: 'Body', leg: 'Leg', noAbilityDescription: 'No description available.',
    categoryAll: 'Everything', categoryAgents: 'Agents', categoryWeapons: 'Weapons', categorySkins: 'Weapon skins', categoryMaps: 'Maps',
    skinCount: 'skins', skinsInPopup: 'WEAPON SKINS', selectSkin: 'Select a skin to preview it.', noSkins: 'No skins available for this weapon.',
    searchPlaceholder: 'Search Agents, weapons, skins, maps...', sort: 'SORT',
    loading: 'Loading VALORANT game data…', retry: 'TRY AGAIN ↻', couldNotLoad: 'Couldn’t load game data.',
    clickDetails: 'Click a card for details', items: 'ITEMS', browseSkins: 'BROWSE ALL WEAPON SKINS ↗',
    noResults: 'No game data matches your search.', noItems: 'No items match your search.',
    emptyData: 'The API returned no game data. Try again later.',
    personalArmory: 'YOUR PERSONAL ARMORY', buildLoadoutA: 'Build your', buildLoadoutB: 'loadout.',
    loadoutDescription: 'Pick your favorites. Make every round yours.', loadingArmory: 'Loading your armory…',
    selectGear: '01 — SELECT YOUR GEAR', yourLoadout: '02 — YOUR LOADOUT',
    preview: 'PREVIEW', saveLoadout: 'SAVE LOADOUT', saved: 'Loadout saved in this browser.',
    saveError: 'Could not save loadout. Check browser storage settings.',
    unofficial: 'UNOFFICIAL FAN PROJECT · DATA VIA VALORANT-API.COM',
    closeDetails: 'Close details', closePicker: 'Close picker', skills: 'ABILITIES',
    choose: 'Choose', available: 'AVAILABLE', melee: 'Melee', meleeWeapons: 'MELEE WEAPONS',
    meleeSkins: 'MELEE SKINS', clickSkill: 'Select an ability to view its details.',
    agent: 'Agent', primaryWeapon: 'Primary weapon', primarySkin: 'Primary skin',
    sidearm: 'Sidearm', sidearmSkin: 'Sidearm skin', favoriteMap: 'Favorite map',
    everything: 'Everything', releaseOldest: 'Release · Oldest', releaseNewest: 'Release · Newest',
    priceLow: 'Price · Low to high', priceHigh: 'Price · High to low', nameAsc: 'Name · A–Z',
    nameDesc: 'Name · Z–A', uuidAsc: 'UUID · A–Z', browseData: 'results',
  },
  th: {
    navExplorer: 'สำรวจข้อมูล', navLoadout: 'จัดชุดอุปกรณ์', live: 'ข้อมูลเกมล่าสุด',
    heroEyebrow: 'สำรวจข้อมูล VALORANT API', heroTitleA: 'รู้จักทุกข้อมูล', heroTitleB: 'เล่นให้เหนือกว่า',
    heroDescription: 'สำรวจเอเจนต์ อาวุธ สกิน และแผนที่ แล้วจัดชุดอุปกรณ์ในแบบของคุณ',
    exploreDatabase: 'สำรวจฐานข้อมูล', poweredBy: 'ขับเคลื่อนด้วย VALORANT API จากชุมชน',
    nextMatch: 'แมตช์ถัดไปของคุณ', archive: 'คลังข้อมูล', archiveTitleA: 'ปลดล็อก', archiveTitleB: 'ข้อมูลเกม',
    archiveDescription: 'เรียกดูข้อมูลเกมล่าสุดจาก VALORANT API สาธารณะ',
    heroPreview: 'ตัวอย่างชุดอุปกรณ์ปัจจุบัน', agentRole: 'ตำแหน่งเอเจนต์', selected: 'เลือกแล้ว',
    chooseAgent: 'เลือกเอเจนต์', primary: 'อาวุธหลัก', sidearmLabel: 'ปืนพก', mapLabel: 'แผนที่',
    primaryStat: 'อาวุธหลัก', favoriteMapStat: 'แผนที่โปรด', damageRanges: 'ความเสียหายตามระยะ',
    head: 'หัว', body: 'ลำตัว', leg: 'ขา', noAbilityDescription: 'ไม่มีคำอธิบาย',
    categoryAll: 'ทั้งหมด', categoryAgents: 'เอเจนต์', categoryWeapons: 'อาวุธ', categorySkins: 'สกินอาวุธ', categoryMaps: 'แผนที่',
    skinCount: 'สกิน', skinsInPopup: 'สกินอาวุธ', selectSkin: 'เลือกสกินเพื่อดูตัวอย่าง', noSkins: 'ไม่มีสกินสำหรับอาวุธนี้',
    searchPlaceholder: 'ค้นหาเอเจนต์ อาวุธ สกิน หรือแผนที่...', sort: 'เรียงตาม',
    loading: 'กำลังโหลดข้อมูล VALORANT…', retry: 'ลองอีกครั้ง ↻', couldNotLoad: 'โหลดข้อมูลเกมไม่สำเร็จ',
    clickDetails: 'กดการ์ดเพื่อดูรายละเอียด', items: 'รายการ', browseSkins: 'ดูสกินอาวุธทั้งหมด ↗',
    noResults: 'ไม่พบข้อมูลที่ตรงกับคำค้นหา', noItems: 'ไม่พบรายการที่ตรงกับคำค้นหา',
    emptyData: 'API ไม่พบข้อมูลเกมในขณะนี้ โปรดลองอีกครั้งภายหลัง',
    personalArmory: 'คลังอุปกรณ์ส่วนตัว', buildLoadoutA: 'จัดชุด', buildLoadoutB: 'อุปกรณ์',
    loadoutDescription: 'เลือกของที่ชอบ แล้วทำให้ทุกรอบเป็นสไตล์ของคุณ', loadingArmory: 'กำลังโหลดคลังอุปกรณ์…',
    selectGear: '01 — เลือกอุปกรณ์', yourLoadout: '02 — ชุดอุปกรณ์ของคุณ',
    preview: 'ตัวอย่าง', saveLoadout: 'บันทึกชุดอุปกรณ์', saved: 'บันทึกชุดอุปกรณ์ไว้ในเบราว์เซอร์แล้ว',
    saveError: 'บันทึกไม่สำเร็จ โปรดตรวจสอบการตั้งค่าพื้นที่จัดเก็บของเบราว์เซอร์',
    unofficial: 'แฟนโปรเจกต์ที่ไม่เป็นทางการ · ข้อมูลจาก VALORANT-API.COM',
    closeDetails: 'ปิดรายละเอียด', closePicker: 'ปิดหน้าต่างเลือก', skills: 'สกิล',
    choose: 'เลือก', available: 'รายการ', melee: 'อาวุธประชิด', meleeWeapons: 'อาวุธประชิด',
    meleeSkins: 'สกินอาวุธประชิด', clickSkill: 'เลือกสกิลเพื่อดูรายละเอียด',
    agent: 'เอเจนต์', primaryWeapon: 'อาวุธหลัก', primarySkin: 'สกินอาวุธหลัก',
    sidearm: 'ปืนพก', sidearmSkin: 'สกินปืนพก', favoriteMap: 'แผนที่โปรด',
    everything: 'ทั้งหมด', releaseOldest: 'วันเปิดตัว · เก่าที่สุด', releaseNewest: 'วันเปิดตัว · ใหม่ล่าสุด',
    priceLow: 'ราคา · น้อยไปมาก', priceHigh: 'ราคา · มากไปน้อย', nameAsc: 'ชื่อ · ก–ฮ',
    nameDesc: 'ชื่อ · ฮ–ก', uuidAsc: 'UUID · A–Z', browseData: 'รายการ',
  },
}
const CATEGORIES = [
  { id: 'all', label: 'Everything', icon: '✦' },
  { id: 'agent', label: 'Agents', icon: '🎭' },
  { id: 'weapon', label: 'Weapons', icon: '🔫' },
  { id: 'map', label: 'Maps', icon: '🗺️' },
]
const PICKERS = [
  { id: 'agent', label: 'Agent', icon: '🎭', key: 'agent' },
  { id: 'primaryWeapon', label: 'Primary weapon', icon: '🔫', key: 'weapon', filter: isPrimaryWeapon },
  { id: 'primarySkin', label: 'Primary skin', icon: '✨', key: 'skin', weapon: 'primaryWeapon', filter: isPrimaryWeapon },
  { id: 'secondaryWeapon', label: 'Sidearm', icon: '🔫', key: 'weapon', filter: isSecondaryWeapon },
  { id: 'secondarySkin', label: 'Sidearm skin', icon: '✨', key: 'skin', weapon: 'secondaryWeapon', filter: isSecondaryWeapon },
  { id: 'melee', label: 'Melee', icon: '⚔️', key: 'weapon', filter: isMeleeWeapon },
  { id: 'map', label: 'Favorite map', icon: '🗺️', key: 'map' },
]
const PICKER_LABELS = {
  agent: 'agent', primaryWeapon: 'primaryWeapon', primarySkin: 'primarySkin',
  secondaryWeapon: 'sidearm', secondarySkin: 'sidearmSkin', melee: 'melee', map: 'favoriteMap',
}

function isPrimaryWeapon(weapon) {
  return weapon.category !== 'EEquippableCategory::Sidearm' && weapon.category !== 'EEquippableCategory::Melee'
}

function isSecondaryWeapon(weapon) {
  return weapon.category === 'EEquippableCategory::Sidearm'
}

function isMeleeWeapon(weapon) {
  return weapon.category === 'EEquippableCategory::Melee'
}

function categoryLabel(category, language) {
  const keys = {
    all: 'categoryAll', agent: 'categoryAgents', weapon: 'categoryWeapons',
    skin: 'categorySkins', map: 'categoryMaps',
  }
  return COPY[language][keys[category]] || category
}

async function fetchResource(resource, signal) {
  const response = await fetch(`${API_BASE}/${resource}`, { signal })
  if (!response.ok) throw new Error(`Could not load ${resource}: HTTP ${response.status}`)
  const result = await response.json()
  if (result.status !== 200 || !Array.isArray(result.data)) {
    throw new Error(`The ${resource} response did not contain a data list.`)
  }
  return result.data
}

function getSkinPrice(skin) {
  const prices = {
    select: [875, 875],
    deluxe: [1275, 1275],
    premium: [1775, 1775],
    exclusive: [2175, 2675],
    ultra: [2475, 2475],
  }
  const price = prices[skin.contentTier?.devName?.toLowerCase()]
  if (!price) return null
  const multiplier = skin.weaponCategory === 'EEquippableCategory::Melee' ? 2 : 1
  return price.map((value) => value * multiplier)
}

function getImage(item) {
  return item?.displayIcon || item?.listViewIcon || item?.fullRender || ''
}

function getMapImage(item) {
  return item?.splash || item?.stylizedBackgroundImage || item?.backgroundImage || getImage(item)
}

function cleanApiText(value) {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : ''
}

function getSummary(category, item) {
  if (category === 'agent') {
    const abilities = (item.abilities || []).map((ability) => ability.displayName).filter(Boolean)
    return abilities.length ? abilities.join(', ') : 'Playable Agent'
  }
  if (category === 'role') return item.description || 'Agent role'
  if (category === 'weapon') {
    const group = item.shopData?.categoryText || item.category?.split('::').pop() || 'Weapon'
    return Number.isFinite(item.shopData?.cost) ? `${group} · ${item.shopData.cost.toLocaleString()} credits` : group
  }
  if (category === 'skin') {
    const price = getSkinPrice(item)
    const label = price ? (price[0] === price[1] ? `${price[0].toLocaleString()} VP est.` : `${price[0].toLocaleString()}–${price[1].toLocaleString()} VP est.`) : 'Price unavailable'
    return `${item.weaponName} · ${label}`
  }
  return item.tacticalDescription || item.coordinates || 'Valorant map'
}

function getSortPrice(category, item) {
  if (category === 'weapon') return Number.isFinite(item.shopData?.cost) ? item.shopData.cost : null
  const price = getSkinPrice(item)
  return price ? (price[0] + price[1]) / 2 : null
}

function sortItems(items, category, sort) {
  const direction = sort.endsWith('-desc') ? -1 : 1
  return mergeSort(items, (a, b) => {
    if (sort.startsWith('release-')) {
      const first = Date.parse(a.releaseDate)
      const second = Date.parse(b.releaseDate)
      if (Number.isFinite(first) && Number.isFinite(second) && first !== second) return (first - second) * direction
      if (Number.isFinite(first) !== Number.isFinite(second)) return Number.isFinite(first) ? -1 : 1
    } else if (sort.startsWith('price-')) {
      const first = getSortPrice(category, a)
      const second = getSortPrice(category, b)
      if (first !== null && second !== null && first !== second) return (first - second) * direction
      if ((first !== null) !== (second !== null)) return first !== null ? -1 : 1
    } else {
      const first = sort === 'uuid-asc' ? a.uuid : a.displayName
      const second = sort === 'uuid-asc' ? b.uuid : b.displayName
      const comparison = String(first || '').localeCompare(String(second || ''), 'en', { numeric: true, sensitivity: 'base' })
      if (comparison) return comparison * direction
    }
    return String(a.displayName || '').localeCompare(String(b.displayName || ''), 'en', { numeric: true, sensitivity: 'base' })
  })
}

function sortOptions(category, text) {
  const options = [['name-asc', text('nameAsc')], ['name-desc', text('nameDesc')], ['uuid-asc', text('uuidAsc')]]
  if (category === 'agent') options.push(['release-asc', text('releaseOldest')], ['release-desc', text('releaseNewest')])
  if (category === 'weapon' || category === 'skin') options.push(['price-asc', text('priceLow')], ['price-desc', text('priceHigh')])
  return options
}

function normalizeData(agents, weapons, maps, tiers) {
  const playableAgents = agents.filter((agent) => agent.isPlayableCharacter && agent.role)
  const rolesById = new HashTable()
  for (const agent of playableAgents) {
    if (agent.role.uuid && !rolesById.has(agent.role.uuid)) rolesById.set(agent.role.uuid, agent.role)
  }
  const roles = rolesById.values()

  const tierById = new HashTable()
  for (const tier of tiers) {
    if (tier.uuid) tierById.set(tier.uuid, tier)
  }

  const skinsByUuid = new HashTable()
  const skinsByWeaponName = new HashTable()
  const skins = []
  for (const weapon of weapons) {
    for (const skin of weapon.skins || []) {
      if (!skin.uuid || skinsByUuid.has(skin.uuid)) continue
      const normalizedSkin = {
        ...skin,
        weaponName: weapon.displayName,
        weaponCategory: weapon.category,
        contentTier: skin.contentTierUuid ? tierById.get(skin.contentTierUuid) || null : null,
        displayIcon: skin.chromas?.find((chroma) => chroma.fullRender)?.fullRender ||
          skin.displayIcon || skin.levels?.find((level) => level.displayIcon)?.displayIcon || '',
      }
      skins.push(normalizedSkin)
      skinsByUuid.set(skin.uuid, normalizedSkin)
      const weaponSkins = skinsByWeaponName.get(weapon.displayName) || []
      weaponSkins.push(normalizedSkin)
      skinsByWeaponName.set(weapon.displayName, weaponSkins)
    }
  }

  function indexByUuid(items) {
    const index = new HashTable()
    for (const item of items) {
      if (item.uuid) index.set(item.uuid, item)
    }
    return index
  }

  const weaponsByName = new HashTable()
  for (const weapon of weapons) {
    if (weapon.displayName) weaponsByName.set(weapon.displayName, weapon)
  }

  return {
    agent: playableAgents,
    role: roles,
    weapon: weapons,
    skin: skins,
    map: maps,
    indexes: {
      byUuid: {
        agent: indexByUuid(playableAgents),
        weapon: indexByUuid(weapons),
        skin: skinsByUuid,
        map: indexByUuid(maps),
      },
      skinsByWeaponName,
      weaponsByName,
    },
  }
}

function IconImage({ item, category, className = '' }) {
  const src = category === 'map' ? getMapImage(item) : getImage(item)
  return (
    <div className={`artwork artwork-${category} ${className}`}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span>{CATEGORIES.find((entry) => entry.id === category)?.icon || '✦'}</span>}
    </div>
  )
}

function DataCard({ category, item, onClick, selected = false, language = 'en', skinCount = 0 }) {
  return (
    <button className={`data-card ${selected ? 'selected' : ''}`} type="button" onClick={onClick}>
      {category === 'agent' ? (
        <div className="agent-card-art">
          <IconImage item={item} category={category} />
          {item.role?.displayIcon ? (
            <span className="role-badge" title={item.role.displayName}>
              <img src={item.role.displayIcon} alt={`${item.role.displayName} role`} loading="lazy" />
            </span>
          ) : null}
        </div>
      ) : <IconImage item={item} category={category} />}
      <span className="card-category">{category === 'agent' ? `${categoryLabel(category, language)} · ${item.role?.displayName || 'ROLE'}` : categoryLabel(category, language)}</span>
      <strong>{item.displayName}</strong>
      <span className="card-summary">{category === 'weapon' ? `${getSummary(category, item)} · ${skinCount || item.skins?.length || 0} ${COPY[language].skinCount}` : getSummary(category, item)}</span>
    </button>
  )
}

function RequestStatus({ loading, error, loadingLabel, text, onRetry }) {
  if (loading) {
    return <div className="status-panel"><span className="loader" /> {text(loadingLabel)}</div>
  }
  if (error) {
    return (
      <div className="status-panel error-panel">
        <b>{text('couldNotLoad')}</b>
        <span>{error}</span>
        <button type="button" onClick={onRetry}>{text('retry')}</button>
      </div>
    )
  }
  return null
}

function ExplorerResults({ groups, category, language, text, hasData, onSelect }) {
  if (!hasData) return <div className="status-panel">{text('emptyData')}</div>
  if (!groups.length) return <div className="status-panel">{text('noResults')}</div>

  return (
    <>
      <div className="result-status">
        {groups.reduce((count, group) => count + group.matches.length, 0).toLocaleString()} {text('browseData')}
        <span> · </span>{text('clickDetails')}
      </div>
      {groups.map((group) => (
        <div className="data-group" key={group.id}>
          {category === 'all' ? <div className="group-heading"><h3>{categoryLabel(group.id, language)}</h3><span>{group.matches.length.toLocaleString()} {text('items')}</span></div> : null}
          <div className="card-grid">
            {group.items.map((item) => (
              <DataCard
                category={group.id}
                item={item}
                language={language}
                key={item.uuid}
                onClick={() => onSelect(group.id, item)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function App() {
  const [language, setLanguage] = useState('en')
  const text = (key) => COPY[language][key]
  const [data, setData] = useState(() => normalizeData([], [], [], []))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [page, setPage] = useState('explorer')
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [builderSort, setBuilderSort] = useState('name-asc')
  const [selection, setSelection] = useState({})
  const [details, setDetails] = useState(null)
  const [activeAbility, setActiveAbility] = useState(null)
  const [activeSkinPreview, setActiveSkinPreview] = useState(null)
  const [picker, setPicker] = useState('')
  const [pickerSearch, setPickerSearch] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [agents, weapons, maps, tiers] = await Promise.all([
          fetchResource('agents', controller.signal),
          fetchResource('weapons', controller.signal),
          fetchResource('maps', controller.signal),
          fetchResource('contenttiers', controller.signal),
        ])
        const loaded = normalizeData(agents, weapons, maps, tiers)
        setData(loaded)
        const initial = {
          agent: loaded.agent[0],
          primaryWeapon: loaded.weapon.find(isPrimaryWeapon),
          secondaryWeapon: loaded.weapon.find(isSecondaryWeapon),
          melee: loaded.weapon.find(isMeleeWeapon),
          map: loaded.map[0],
        }
        for (const [weaponKey, skinKey] of [
          ['primaryWeapon', 'primarySkin'], ['secondaryWeapon', 'secondarySkin'],
        ]) {
          const weaponName = initial[weaponKey]?.displayName
          initial[skinKey] = weaponName ? loaded.indexes.skinsByWeaponName.get(weaponName)?.[0] : undefined
        }
        initial.meleeSkin = loaded.skin.find((skin) => isMeleeWeapon({ category: skin.weaponCategory }))
        try {
          const saved = JSON.parse(localStorage.getItem(LOADOUT_STORAGE_KEY) || 'null')
          if (saved && typeof saved === 'object') {
            for (const config of PICKERS) {
              const savedUuid = saved[config.id]
              const found = typeof savedUuid === 'string'
                ? loaded.indexes.byUuid[config.key].get(savedUuid)
                : undefined
              if (found) initial[config.id] = found
            }
            const savedMeleeSkin = typeof saved.meleeSkin === 'string'
              ? loaded.indexes.byUuid.skin.get(saved.meleeSkin)
              : undefined
            if (savedMeleeSkin && isMeleeWeapon({ category: savedMeleeSkin.weaponCategory })) initial.meleeSkin = savedMeleeSkin
          }
        } catch (storageError) {
          console.warn('Saved loadout could not be read:', storageError)
        }
        for (const weaponKey of ['primaryWeapon', 'secondaryWeapon']) {
          const skinKey = weaponKey.replace('Weapon', 'Skin')
          if (initial[weaponKey] && initial[skinKey]?.weaponName !== initial[weaponKey].displayName) {
            initial[skinKey] = loaded.indexes.skinsByWeaponName.get(initial[weaponKey].displayName)?.[0]
          }
        }
        setSelection(initial)
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [retryCount])

  const visibleCategories = category === 'all' ? CATEGORIES.filter((entry) => entry.id !== 'all') : CATEGORIES.filter((entry) => entry.id === category)
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const explorerGroups = useMemo(() => visibleCategories.map((entry) => {
    const matches = data[entry.id].filter((item) => {
      const abilities = entry.id === 'agent' ? (item.abilities || []).flatMap((ability) => [ability.displayName, ability.description]) : []
      const skinNames = entry.id === 'weapon' ? (item.skins || []).map((skin) => skin.displayName) : []
      const text = [item.displayName, item.description, item.tacticalDescription, item.coordinates, item.weaponName, getSummary(entry.id, item), ...abilities, ...skinNames]
        .filter(Boolean).join(' ').toLocaleLowerCase()
      return text.includes(normalizedSearch)
    })
    const sorted = sortItems(matches, entry.id, sort)
    return { ...entry, matches, items: sorted }
  }).filter((group) => group.items.length), [data, normalizedSearch, sort, visibleCategories])
  const detailWeaponSkins = details?.category === 'weapon'
    ? sortItems(data.indexes.skinsByWeaponName.get(details.item.displayName) || [], 'skin', 'name-asc')
    : []

  const pickerConfig = PICKERS.find((entry) => entry.id === picker)
  const pickerItems = useMemo(() => {
    if (!pickerConfig) return []
    if (pickerConfig.id === 'melee') return []
    const chosenWeapon = pickerConfig.weapon ? selection[pickerConfig.weapon] : null
    return sortItems(data[pickerConfig.key].filter((item) => {
      if (pickerConfig.filter && pickerConfig.key === 'weapon' && !pickerConfig.filter(item)) return false
      if (pickerConfig.key === 'skin') {
        const weapon = data.indexes.weaponsByName.get(item.weaponName)
        if (pickerConfig.filter && weapon && !pickerConfig.filter(weapon)) return false
        if (chosenWeapon && item.weaponName !== chosenWeapon.displayName) return false
      }
      return `${item.displayName} ${item.weaponName || ''} ${getSummary(pickerConfig.key, item)}`.toLocaleLowerCase().includes(pickerSearch.trim().toLocaleLowerCase())
    }), pickerConfig.key, builderSort)
  }, [builderSort, data, pickerConfig, pickerSearch, selection])

  const meleeWeapons = useMemo(() => sortItems(data.weapon.filter((item) =>
    isMeleeWeapon(item) && `${item.displayName} ${getSummary('weapon', item)}`.toLocaleLowerCase().includes(pickerSearch.trim().toLocaleLowerCase()),
  ), 'weapon', builderSort), [builderSort, data.weapon, pickerSearch])
  const meleeSkins = useMemo(() => sortItems(data.skin.filter((item) =>
    isMeleeWeapon({ category: item.weaponCategory }) && `${item.displayName} ${item.weaponName} ${getSummary('skin', item)}`.toLocaleLowerCase().includes(pickerSearch.trim().toLocaleLowerCase()),
  ), 'skin', builderSort), [builderSort, data.skin, pickerSearch])

  function chooseItem(config, item) {
    setSelection((current) => {
      const next = { ...current, [config.id]: item }
      if (config.id.endsWith('Weapon')) {
        const skinKey = config.id.replace('Weapon', 'Skin')
        if (next[skinKey]?.weaponName !== item.displayName) {
          next[skinKey] = data.indexes.skinsByWeaponName.get(item.displayName)?.[0]
        }
      }
      if (config.id === 'melee') {
        next.meleeSkin = (data.indexes.skinsByWeaponName.get(item.displayName) || []).find((skin) => isMeleeWeapon({ category: skin.weaponCategory }))
      }
      if (config.weapon && next[config.weapon] && item.weaponName !== next[config.weapon].displayName) {
        next[config.weapon] = data.indexes.weaponsByName.get(item.weaponName)
      }
      return next
    })
    setPicker('')
    setPickerSearch('')
  }

  function chooseMeleeSkin(item) {
    setSelection((current) => ({ ...current, meleeSkin: item }))
    setPicker('')
    setPickerSearch('')
  }

  function saveLoadout() {
    try {
      const snapshot = Object.fromEntries([
        ...PICKERS.map((entry) => [entry.id, selection[entry.id]?.uuid || null]),
        ['meleeSkin', selection.meleeSkin?.uuid || null],
      ])
      localStorage.setItem(LOADOUT_STORAGE_KEY, JSON.stringify(snapshot))
      setSavedMessage(text('saved'))
    } catch (saveError) {
      console.error('Unable to save loadout:', saveError)
      setSavedMessage(text('saveError'))
    }
  }

  const agent = selection.agent
  const primarySkin = selection.primarySkin
  const primaryWeapon = selection.primaryWeapon
  const map = selection.map

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage('explorer') }}>
          <span className="brand-mark">V</span><span>VALORANT<span className="brand-accent"> DATAFORGE</span></span>
        </a>
        <nav aria-label={language === 'th' ? 'เมนูหลัก' : 'Main navigation'}>
          <button className={page === 'explorer' ? 'active' : ''} onClick={() => setPage('explorer')} type="button">{text('navExplorer')}</button>
          <button className={page === 'builder' ? 'active' : ''} onClick={() => setPage('builder')} type="button">{text('navLoadout')}</button>
        </nav>
        <div className="header-tools">
          <div className="language-switch" role="group" aria-label={language === 'th' ? 'เลือกภาษา' : 'Choose language'}>
            <button type="button" className={language === 'th' ? 'active' : ''} aria-pressed={language === 'th'} onClick={() => setLanguage('th')}>TH</button>
            <button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>ENG</button>
          </div>
          <span className="live-badge"><i /> {text('live')}</span>
        </div>
      </header>

      {page === 'explorer' ? (
        <main>
          <section className="hero-section">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-line" /> {text('heroEyebrow')}</span>
              <h1>{text('heroTitleA')}<br /><span>{text('heroTitleB')}</span></h1>
              <p>{text('heroDescription')}</p>
              <button className="primary-button" onClick={() => document.getElementById('data-explorer')?.scrollIntoView({ behavior: 'smooth' })} type="button">
                {text('exploreDatabase')} <span>↘</span>
              </button>
              <div className="hero-note"><span>↳</span> {text('poweredBy')}</div>
            </div>
            <div className="hero-art" aria-label={text('heroPreview')}>
              <div className="hero-art-top"><span>{text('nextMatch')}</span><span>✦ 2026</span></div>
              <div className="hero-agent-card">
                {agent?.background ? <img className="agent-bg" src={agent.background} alt="" /> : null}
                {agent?.fullPortrait ? <img className="agent-portrait" src={agent.fullPortrait} alt="" /> : null}
                <span className="agent-label">{text('agentRole')} / {agent?.role?.displayName || text('selected')}</span>
                <strong>{agent?.displayName || (loading ? text('loading') : text('chooseAgent'))}</strong>
                <span className="agent-index">01</span>
              </div>
              <div className="hero-loadout">
                {[[text('primary'), primarySkin, 'skin'], [text('sidearmLabel'), selection.secondarySkin, 'skin'], [text('mapLabel'), map, 'map']].map(([label, item, type]) => (
                  <div className="hero-slot" key={label}>
                    <span>{label}</span>
                    <IconImage item={item} category={type} />
                    <b>{item?.displayName || '—'}</b>
                  </div>
                ))}
              </div>
              <div className="hero-stats">
                <div><small>{text('primaryStat')}</small><b>{primaryWeapon?.displayName || '—'}</b></div>
                <div><small>{text('favoriteMapStat')}</small><b>{map?.displayName || '—'}</b></div>
              </div>
              <span className="art-glow" />
            </div>
          </section>

          <section className="explorer-section" id="data-explorer">
            <div className="section-heading">
              <div><span className="eyebrow"><span className="eyebrow-line" /> {text('archive')}</span><h2>{text('archiveTitleA')} <span>{text('archiveTitleB')}</span></h2></div>
              <p>{text('archiveDescription')}</p>
            </div>
            <div className="category-row" aria-label="Filter by category">
              {CATEGORIES.map((entry) => (
                <button key={entry.id} className={`category-button ${category === entry.id ? 'active' : ''}`} onClick={() => { setCategory(entry.id); setSort('name-asc') }} type="button">
                  <span>{entry.icon}</span>{categoryLabel(entry.id, language)}
                </button>
              ))}
            </div>
            <div className="toolbar">
              <label className="search-field"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text('searchPlaceholder')} /></label>
              <label className="sort-field"><span>{text('sort')}</span><select value={sort} onChange={(event) => setSort(event.target.value)}>{sortOptions(category === 'all' ? 'all' : category, text).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            <RequestStatus
              loading={loading}
              error={error}
              loadingLabel="loading"
              text={text}
              onRetry={() => setRetryCount((count) => count + 1)}
            />
            {!loading && !error ? (
              <ExplorerResults
                groups={explorerGroups}
                category={category}
                language={language}
                text={text}
                hasData={Boolean(data.agent.length || data.weapon.length || data.skin.length || data.map.length)}
                onSelect={(selectedCategory, item) => {
                  setDetails({ category: selectedCategory, item })
                  setActiveAbility(selectedCategory === 'agent'
                    ? (item.abilities || []).find((ability) => ability.displayName) || null
                    : null)
                  const weaponSkins = selectedCategory === 'weapon'
                    ? data.indexes.skinsByWeaponName.get(item.displayName) || []
                    : []
                  setActiveSkinPreview(weaponSkins.find((skin) =>
                    skin.displayName.toLocaleLowerCase().includes(normalizedSearch),
                  ) || weaponSkins[0] || null)
                }}
              />
            ) : null}
          </section>
        </main>
      ) : (
        <main className="builder-section">
          <div className="builder-heading"><span className="eyebrow"><span className="eyebrow-line" /> {text('personalArmory')}</span><h1>{text('buildLoadoutA')} <span>{text('buildLoadoutB')}</span></h1><p>{text('loadoutDescription')}</p></div>
          <RequestStatus
            loading={loading}
            error={error}
            loadingLabel="loadingArmory"
            text={text}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
          {!loading && !error ? (
            <div className="builder-layout">
              <section className="builder-picks">
                <div className="builder-panel-heading"><span>{text('selectGear')}</span><strong>{PICKERS.filter((entry) => selection[entry.id]).length} / {PICKERS.length} {text('selected')}</strong></div>
                <label className="sort-field builder-sort"><span>{text('sort')}</span><select value={builderSort} onChange={(event) => setBuilderSort(event.target.value)}>{[['name-asc', text('nameAsc')], ['name-desc', text('nameDesc')], ['price-asc', text('priceLow')], ['price-desc', text('priceHigh')]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                {PICKERS.map((entry, index) => (
                  <button className="picker-row" key={entry.id} type="button" onClick={() => { setPicker(entry.id); setPickerSearch('') }}>
                    <span className="picker-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="picker-icon">{selection[entry.id] ? <IconImage item={selection[entry.id]} category={entry.key} /> : entry.icon}</span>
                    <span className="picker-text"><small>{text(PICKER_LABELS[entry.id])}</small><b>{selection[entry.id]?.displayName || `${text('choose')} ${text(PICKER_LABELS[entry.id])}`}</b></span>
                    <span className="picker-plus">{selection[entry.id] ? '↗' : '+'}</span>
                  </button>
                ))}
              </section>
              <section className="loadout-preview">
                <div className="builder-panel-heading"><span>{text('yourLoadout')}</span><span className="preview-live"><i /> {text('preview')}</span></div>
                <div className="loadout-agent">
                  {agent?.background ? <img className="agent-bg" src={agent.background} alt="" /> : null}
                  {agent?.fullPortrait ? <img className="agent-portrait" src={agent.fullPortrait} alt="" /> : null}
                  <span>{agent?.role?.displayName || text('agentRole')}</span><strong>{agent?.displayName || text('chooseAgent')}</strong>
                </div>
                <div className="preview-gear">
                  {PICKERS.filter((entry) => entry.id !== 'agent').map((entry) => (
                    <div className="preview-gear-row" key={entry.id}><span>{text(PICKER_LABELS[entry.id])}</span><b>{(entry.id === 'melee' ? selection.meleeSkin : selection[entry.id])?.displayName || '—'}</b></div>
                  ))}
                </div>
                <div className="selected-art-grid">
                  {['primarySkin', 'secondarySkin', 'meleeSkin', 'map'].map((key) => {
                    const item = selection[key]
                    const type = key === 'map' ? 'map' : 'skin'
                    return <div key={key} className="selected-art"><IconImage item={item} category={type} /><span>{item?.displayName || text('choose')}</span></div>
                  })}
                </div>
                <button className="primary-button save-button" type="button" onClick={saveLoadout}>{text('saveLoadout')} <span>↗</span></button>
                <p className="save-status" role="status">{savedMessage}</p>
              </section>
            </div>
          ) : null}
        </main>
      )}

      <footer><span className="brand-mark">V</span><span>VALORANT DATAFORGE</span><span>{text('unofficial')}</span></footer>

      {details ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetails(null) }}>
          <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <button className="modal-close" type="button" aria-label={text('closeDetails')} onClick={() => setDetails(null)}>×</button>
            <span className="eyebrow"><span className="eyebrow-line" /> {categoryLabel(details.category, language)}</span>
            <IconImage item={details.item} category={details.category} className="detail-artwork" />
            <h2 id="detail-title">{details.item.displayName}</h2>
            <p>{cleanApiText(details.item.description) || cleanApiText(details.item.tacticalDescription) || getSummary(details.category, details.item)}</p>
            {details.category === 'agent' ? (
              <div className="agent-skills">
                <h3>{text('skills')}</h3>
                <div className="skill-buttons">
                  {(details.item.abilities || []).filter((ability) => ability.displayName).map((ability) => (
                    <button
                      className={`skill-button ${activeAbility?.slot === ability.slot ? 'active' : ''}`}
                      key={`${ability.slot}-${ability.displayName}`}
                      type="button"
                      aria-pressed={activeAbility?.slot === ability.slot}
                      onClick={() => setActiveAbility(ability)}
                    >
                      <span className="skill-icon">
                        {ability.displayIcon ? <img src={ability.displayIcon} alt="" /> : <span>{ability.slot?.slice(0, 1) || '✦'}</span>}
                      </span>
                      <span><b>{ability.displayName}</b><small>{ability.slot}</small></span>
                    </button>
                  ))}
                </div>
                {activeAbility ? (
                  <div className="skill-description">
                    {activeAbility.displayIcon ? <img src={activeAbility.displayIcon} alt="" /> : null}
                    <div><b>{activeAbility.displayName} · {activeAbility.slot}</b><span>{cleanApiText(activeAbility.description) || text('clickSkill')}</span></div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {details.category === 'weapon' && details.item.weaponStats?.damageRanges?.length ? <div className="damage-list"><b>{text('damageRanges')}</b>{details.item.weaponStats.damageRanges.map((range) => <span key={`${range.rangeStartMeters}-${range.rangeEndMeters}`}>{range.rangeStartMeters}–{range.rangeEndMeters} m · {text('head')} {range.headDamage} · {text('body')} {range.bodyDamage} · {text('leg')} {range.legDamage}</span>)}</div> : null}
            {details.category === 'weapon' ? (
              <section className="weapon-skins">
                <div className="weapon-skins-heading">
                  <h3>{text('skinsInPopup')}</h3>
                  <span>{detailWeaponSkins.length}</span>
                </div>
                {activeSkinPreview ? (
                  <div className="weapon-skin-preview">
                    <IconImage item={activeSkinPreview} category="skin" />
                    <div><b>{activeSkinPreview.displayName}</b><span>{getSummary('skin', activeSkinPreview)}</span></div>
                  </div>
                ) : <p className="no-weapon-skins">{text('noSkins')}</p>}
                <div className="weapon-skin-grid">
                  {detailWeaponSkins.map((skin) => (
                    <button
                      type="button"
                      className={`weapon-skin-option ${activeSkinPreview?.uuid === skin.uuid ? 'active' : ''}`}
                      key={skin.uuid}
                      aria-pressed={activeSkinPreview?.uuid === skin.uuid}
                      onClick={() => setActiveSkinPreview(skin)}
                    >
                      <IconImage item={skin} category="skin" />
                      <span>{skin.displayName}</span>
                    </button>
                  ))}
                </div>
                {detailWeaponSkins.length > 1 ? <p className="skin-selection-hint">{text('selectSkin')}</p> : null}
              </section>
            ) : null}
            <div className="detail-summary">{getSummary(details.category, details.item)}</div>
          </section>
        </div>
      ) : null}

      {pickerConfig ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPicker('') }}>
          <section className="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title">
            <div className="picker-modal-head"><div><span className="eyebrow"><span className="eyebrow-line" /> {text('navLoadout')}</span><h2 id="picker-title">{text('choose')} {text(PICKER_LABELS[pickerConfig.id]).toLowerCase()}.</h2></div><button className="modal-close" type="button" aria-label={text('closePicker')} onClick={() => setPicker('')}>×</button></div>
            <label className="search-field picker-search"><span>⌕</span><input autoFocus type="search" value={pickerSearch} onChange={(event) => setPickerSearch(event.target.value)} placeholder={`${text('choose')} ${text(PICKER_LABELS[pickerConfig.id]).toLowerCase()}…`} /></label>
            {pickerConfig.id === 'melee' ? (
              <div className="melee-picker-content">
                <section>
                  <div className="melee-picker-heading"><h3>{text('meleeWeapons')}</h3><span>{meleeWeapons.length} {text('available')}</span></div>
                  <div className="card-grid picker-grid">
                    {meleeWeapons.map((item) => <DataCard category="weapon" item={item} language={language} key={item.uuid} selected={selection.melee?.uuid === item.uuid} onClick={() => chooseItem(pickerConfig, item)} />)}
                  </div>
                </section>
                <section>
                  <div className="melee-picker-heading"><h3>{text('meleeSkins')}</h3><span>{meleeSkins.length} {text('available')}</span></div>
                  <div className="card-grid picker-grid">
                    {meleeSkins.map((item) => <DataCard category="skin" item={item} language={language} key={item.uuid} selected={selection.meleeSkin?.uuid === item.uuid} onClick={() => chooseMeleeSkin(item)} />)}
                  </div>
                </section>
                {!meleeWeapons.length && !meleeSkins.length ? <div className="status-panel">{text('noItems')}</div> : null}
              </div>
            ) : (
              <>
                <div className="picker-count">{pickerItems.length.toLocaleString()} {text('available')}</div>
                <div className="card-grid picker-grid">
                  {pickerItems.map((item) => <DataCard category={pickerConfig.key} item={item} language={language} key={item.uuid} selected={selection[pickerConfig.id]?.uuid === item.uuid} onClick={() => chooseItem(pickerConfig, item)} />)}
                </div>
                {!pickerItems.length ? <div className="status-panel">{text('noItems')}</div> : null}
              </>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default App
