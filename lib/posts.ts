export type Post = {
  slug: string
  title: string
  description: string
  cover?: string
  tags: string[]
  datePublished: string // ISO
  dateModified?: string // ISO
  faq?: { q: string; a: string }[]
  bodyHtml: string
  categorySlug: string
}

export const posts: Post[] = [
  {
    slug: "nadcisnienie-tetnicze-objawy-diagnostyka-leczenie",
    title: "Nadciśnienie tętnicze — objawy, diagnostyka, leczenie",
    description:
      "Czym jest nadciśnienie tętnicze, jakie daje objawy, jak je diagnozować i leczyć oraz kiedy zgłosić się do lekarza.",
    cover: "/og.jpg",
    tags: ["nadciśnienie", "serce", "ciśnienie krwi"],
    datePublished: "2025-08-23T08:00:00.000Z",
    faq: [
      { q: "Jakie są objawy nadciśnienia?", a: "Najczęściej brak. U części osób występują bóle głowy, szumy uszne, kołatanie serca czy krwawienia z nosa." },
      { q: "Jak mierzyć ciśnienie w domu?", a: "O stałej porze, rano i wieczorem, po kilku minutach odpoczynku. Używaj mankietu na wysokości serca." },
      { q: "Kiedy iść do lekarza?", a: "Gdy średnie wartości domowe przekraczają 135/85 mmHg lub pojawiają się objawy alarmowe." }
    ],
    bodyHtml: `
      <h2>Czym jest nadciśnienie tętnicze?</h2>
      <p>Nadciśnienie tętnicze to przewlekłe podwyższenie ciśnienia krwi powyżej wartości uznanych za prawidłowe. Jest to jeden z najczęstszych problemów zdrowotnych dorosłych i główny czynnik ryzyka chorób sercowo-naczyniowych, takich jak zawał serca czy udar mózgu.</p>

      <h2>Objawy</h2>
      <p>Nadciśnienie często przebiega bezobjawowo („cichy zabójca”). Czasami pojawiają się: bóle i zawroty głowy, kołatania serca, zmęczenie, krwawienia z nosa. Dlatego tak istotne są regularne pomiary.</p>

      <h2>Diagnostyka</h2>
      <ul>
        <li><strong>Pomiar gabinetowy i domowy</strong> – powtarzane w różnych porach dnia.</li>
        <li><strong>Holter ciśnieniowy (ABPM)</strong> – całodobowe monitorowanie.</li>
        <li><strong>Badania dodatkowe</strong> – EKG, morfologia, badanie moczu, profil lipidowy, ocena nerek.</li>
      </ul>

      <h2>Leczenie</h2>
      <p>Leczenie opiera się na dwóch filarach:</p>
      <h3>Modyfikacja stylu życia</h3>
      <ul>
        <li>Dieta uboga w sól (dieta DASH), ograniczenie alkoholu.</li>
        <li>Redukcja masy ciała, aktywność fizyczna 30 min dziennie.</li>
        <li>Zaprzestanie palenia tytoniu.</li>
      </ul>
      <h3>Farmakoterapia</h3>
      <p>Leki (np. inhibitory ACE, sartany, beta-blokery) dobiera lekarz indywidualnie.</p>

      <h2>Teleporada czy wizyta domowa?</h2>
      <p>W wielu przypadkach kontrola ciśnienia i dostosowanie leczenia może odbywać się w formie <a href="/?type=Teleporada#umow">teleporady</a>. W sytuacjach nagłych, z wysokim ciśnieniem i objawami — konieczna jest szybka interwencja, czasem <a href="/?type=Wizyta domowa#umow">wizyta domowa</a> lub wezwanie pogotowia.</p>
    `,
    categorySlug: "kardiologia"
  },
  {
    slug: "cukrzyca-typu-2-objawy-badania-leczenie",
    title: "Cukrzyca typu 2 — objawy, badania, leczenie",
    description:
      "Objawy cukrzycy typu 2, badania diagnostyczne, sposoby leczenia i rola wizyt kontrolnych.",
    cover: "/og.jpg",
    tags: ["cukrzyca", "glukoza", "metabolizm"],
    datePublished: "2025-08-23T09:00:00.000Z",
    faq: [
      { q: "Jakie są wczesne objawy cukrzycy typu 2?", a: "Wzmożone pragnienie, częste oddawanie moczu, zmęczenie, spadek masy ciała, zaburzenia widzenia." },
      { q: "Jak rozpoznać cukrzycę?", a: "Podstawą jest pomiar glukozy i HbA1c. W razie wątpliwości wykonuje się test OGTT." },
      { q: "Czy można kontrolować cukrzycę przez internet?", a: "Tak, wiele wizyt kontrolnych można odbywać w formie teleporady, szczególnie omawiając wyniki badań." }
    ],
    bodyHtml: `
      <h2>Czym jest cukrzyca typu 2?</h2>
      <p>Cukrzyca typu 2 to przewlekła choroba metaboliczna charakteryzująca się insulinoopornością i zaburzoną produkcją insuliny. Nieleczona prowadzi do poważnych powikłań sercowo-naczyniowych, nerkowych i okulistycznych.</p>

      <h2>Objawy</h2>
      <ul>
        <li>Polidypsja – wzmożone pragnienie.</li>
        <li>Poliuria – częste oddawanie moczu.</li>
        <li>Utrata masy ciała mimo apetytu.</li>
        <li>Zmęczenie, senność, zaburzenia widzenia.</li>
      </ul>

      <h2>Badania diagnostyczne</h2>
      <p>Rozpoznanie stawia się na podstawie:</p>
      <ul>
        <li>Glukozy na czczo ≥ 126 mg/dl w dwóch pomiarach.</li>
        <li>HbA1c ≥ 6.5%.</li>
        <li>Testu OGTT przy wątpliwościach.</li>
      </ul>

      <h2>Leczenie</h2>
      <h3>Styl życia</h3>
      <p>Dieta o niskim indeksie glikemicznym, redukcja masy ciała, regularna aktywność fizyczna.</p>
      <h3>Leki</h3>
      <p>Najczęściej rozpoczyna się od metforminy, w razie potrzeby dodając inne grupy leków doustnych lub insulinę.</p>

      <h2>Monitorowanie i kontrola</h2>
      <p>Wymaga regularnych wizyt lekarskich i badań kontrolnych (glikemia, HbA1c, profil lipidowy, funkcja nerek). Wiele wizyt można odbywać jako <a href="/?type=Teleporada#umow">teleporadę</a>.</p>
    `,
    categorySlug: "diabetologia"
  },
  {
    slug: "angina-paciorkowcowa-objawy-testy-leczenie",
    title: "Angina paciorkowcowa — objawy, testy, leczenie",
    description:
      "Angina paciorkowcowa: objawy, szybkie testy diagnostyczne, leczenie antybiotykiem i profilaktyka.",
    cover: "/og.jpg",
    tags: ["angina", "paciorkowce", "gardło"],
    datePublished: "2025-08-23T10:00:00.000Z",
    faq: [
      { q: "Czy każda angina wymaga antybiotyku?", a: "Nie. Anginę wirusową leczymy objawowo, paciorkowcowa zwykle wymaga antybiotyku." },
      { q: "Co to jest test Strep A?", a: "To szybki test z wymazu z gardła wykrywający paciorkowce grupy A." },
      { q: "Jakie są powikłania nieleczonej anginy?", a: "Gorączka reumatyczna, ropień okołomigdałkowy, zapalenie nerek." }
    ],
    bodyHtml: `
      <h2>Objawy anginy paciorkowcowej</h2>
      <ul>
        <li>Silny ból gardła, trudności w przełykaniu.</li>
        <li>Wysoka gorączka, dreszcze.</li>
        <li>Brak kaszlu, ropne naloty na migdałkach.</li>
        <li>Powiększone, bolesne węzły chłonne szyjne.</li>
      </ul>

      <h2>Diagnostyka</h2>
      <p>Podstawą jest ocena objawów (skala Centora/McIsaaca) oraz <strong>szybki test Strep A</strong>. W razie wątpliwości wykonuje się posiew wymazu z gardła.</p>

      <h2>Leczenie</h2>
      <p>Podstawą jest antybiotykoterapia (np. penicylina), leki przeciwgorączkowe, płukanie gardła, odpoczynek. Kontrola jest wskazana przy nawracających anginach.</p>

      <h2>Kiedy teleporada, a kiedy wizyta domowa?</h2>
      <p>Wystawienie e-recepty i interpretację objawów można uzyskać w ramach <a href="/?type=Teleporada#umow">teleporady</a>. W ciężkich przypadkach, z trudnościami w oddychaniu lub osłabioną odpornością, konieczna może być <a href="/?type=Wizyta domowa#umow">wizyta domowa</a>.</p>
    `,
    categorySlug: "laryngologia"
  },
  {
    slug: "zapalenie-pecherza-objawy-leczenie-profilaktyka",
    title: "Zapalenie pęcherza u dorosłych — objawy, leczenie, profilaktyka",
    description:
      "Jak rozpoznać zapalenie pęcherza, jakie są objawy, jakie badania wykonać i jak wygląda leczenie.",
    cover: "/og.jpg",
    tags: ["zapalenie pęcherza", "infekcje dróg moczowych"],
    datePublished: "2025-08-23T10:30:00.000Z",
    faq: [
      { q: "Jakie badania przy podejrzeniu zapalenia pęcherza?", a: "Badanie ogólne moczu, a w nawrotach lub w ciąży posiew." },
      { q: "Czy zawsze potrzebny jest antybiotyk?", a: "Czasem wystarczy leczenie objawowe, ale najczęściej stosuje się antybiotyk." },
      { q: "Jak zapobiegać nawrotom?", a: "Nawadnianie, mikcja po stosunku, higiena, ewentualnie profilaktyka farmakologiczna." }
    ],
    bodyHtml: `
      <h2>Objawy zapalenia pęcherza</h2>
      <ul>
        <li>Pieczenie i ból przy oddawaniu moczu.</li>
        <li>Parcie naglące, częste oddawanie moczu.</li>
        <li>Ból w podbrzuszu.</li>
        <li>Nieprzyjemny zapach moczu, czasem krwiomocz.</li>
      </ul>

      <h2>Diagnostyka</h2>
      <p>Rozpoznanie stawia się na podstawie wywiadu i <strong>badania ogólnego moczu</strong>. W nawrotach oraz w ciąży konieczny jest posiew moczu.</p>

      <h2>Leczenie</h2>
      <ul>
        <li>Nawodnienie i częste oddawanie moczu.</li>
        <li>Leki przeciwbólowe, rozkurczowe.</li>
        <li>W większości przypadków – antybiotykoterapia.</li>
      </ul>

      <h2>Teleporada a wizyta domowa</h2>
      <p>Proste przypadki mogą być omówione w ramach <a href="/?type=Teleporada#umow">teleporady</a>. Przy nasilonych objawach, ciąży, gorączce lub braku poprawy konieczna może być <a href="/?type=Wizyta domowa#umow">wizyta domowa</a>.</p>
    `,
    categorySlug: "urologia"
  },
  {
    slug: "migrena-domowe-sposoby-i-leczenie",
    title: "Migrena — objawy, domowe sposoby i leczenie",
    description:
      "Jak rozpoznać migrenę, jakie są objawy i metody leczenia oraz które domowe sposoby mogą pomóc.",
    cover: "/og.jpg",
    tags: ["migrena", "ból głowy", "neurologia"],
    datePublished: "2025-08-23T11:00:00.000Z",
    faq: [
      { q: "Czym migrena różni się od napięciowego bólu głowy?", a: "Migrena to ból pulsujący, często jednostronny, z nudnościami i światłowstrętem. Ból napięciowy jest tępy i obustronny." },
      { q: "Jakie domowe metody pomagają?", a: "Sen, ciemne pomieszczenie, zimne okłady, unikanie głodu i stresu." },
      { q: "Kiedy zgłosić się pilnie do lekarza?", a: "Przy nagłym, najsilniejszym bólu w życiu, zaburzeniach neurologicznych, gorączce lub po urazie głowy." }
    ],
    bodyHtml: `
      <h2>Objawy migreny</h2>
      <p>Migrena to napadowy ból głowy trwający od kilku godzin do nawet 3 dni. Ból jest zwykle jednostronny, pulsujący, często z nudnościami, wymiotami, nadwrażliwością na światło i dźwięk. U części osób występuje aura — zaburzenia widzenia, czucia lub mowy poprzedzające napad.</p>

      <h2>Przyczyny i czynniki wyzwalające</h2>
      <p>Migrena wiąże się z nadpobudliwością układu nerwowego. Ataki mogą wywołać: nieregularny sen, stres, niektóre pokarmy (czekolada, czerwone wino), odwodnienie, zmiany hormonalne.</p>

      <h2>Postępowanie doraźne</h2>
      <ul>
        <li>Szybkie przyjęcie leków przeciwbólowych lub tryptanów na początku napadu.</li>
        <li>Odpoczynek w ciemnym, cichym pokoju.</li>
        <li>Zimne okłady na czoło lub kark.</li>
      </ul>

      <h2>Leczenie profilaktyczne</h2>
      <p>Stosowane przy częstych, ciężkich napadach. Obejmuje farmakoterapię (np. beta-blokery, leki przeciwpadaczkowe) oraz zmianę stylu życia.</p>

      <h2>Konsultacja lekarska</h2>
      <p>Regularne kontrole i omówienie dzienniczka bólów głowy można odbywać w formie <a href="/?type=Teleporada#umow">teleporady</a>. Przy ciężkich napadach lub nowych objawach konieczna może być <a href="/?type=Wizyta domowa#umow">wizyta domowa</a>.</p>
    `,
    categorySlug: "neurologia"
  }
]

// Helpers
export function getAllPosts() {
  return posts.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
}
export function getPostBySlug(slug: string) {
  return posts.find(p => p.slug === slug) || null
}
export function getAllSlugs() {
  return posts.map(p => p.slug)
}
export function getPostsByCategory(slug: string) {
  return getAllPosts().filter(p => p.categorySlug === slug)
}
