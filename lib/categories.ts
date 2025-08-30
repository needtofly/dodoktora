export type Category = {
  slug: string
  name: string
  shortDescription: string
  longMetaDescription: string
}

export const categories: Category[] = [
  {
    slug: "kardiologia",
    name: "Choroby układu krążenia",
    shortDescription: "Nadciśnienie, profilaktyka sercowo-naczyniowa, diagnostyka i leczenie.",
    longMetaDescription:
      "Artykuły o chorobach układu krążenia: nadciśnienie tętnicze, profilaktyka sercowo-naczyniowa, diagnostyka i leczenie. Przejrzyste zalecenia, listy objawów i wskazówki, kiedy pilnie skonsultować się z lekarzem. Sprawdzone treści, czytelne sekcje i linki do rezerwacji teleporady."
  },
  {
    slug: "diabetologia",
    name: "Cukrzyca i zaburzenia metaboliczne",
    shortDescription: "Cukrzyca typu 2, badania, dieta, farmakoterapia i monitorowanie.",
    longMetaDescription:
      "Kompletny przewodnik po cukrzycy typu 2 i zaburzeniach metabolicznych: objawy, badania, dieta, farmakoterapia i monitorowanie powikłań. Praktyczne porady dla pacjentów, przykładowe wyniki badań oraz możliwość umówienia teleporady online."
  },
  {
    slug: "laryngologia",
    name: "Infekcje górnych dróg oddechowych",
    shortDescription: "Angina paciorkowcowa, diagnostyka i leczenie, profilaktyka nawrotów.",
    longMetaDescription:
      "Angina paciorkowcowa oraz inne infekcje górnych dróg oddechowych: rozpoznanie, szybkie testy, skuteczne leczenie i profilaktyka. Wyjaśniamy różnice między infekcją wirusową a bakteryjną i kiedy potrzebna jest antybiotykoterapia."
  },
  {
    slug: "urologia",
    name: "Urologia",
    shortDescription: "Zapalenie pęcherza, objawy, badania, leczenie i zapobieganie nawrotom.",
    longMetaDescription:
      "Urologia dla dorosłych: zapalenie pęcherza i infekcje dróg moczowych. Objawy, badania (w tym posiew), leczenie i profilaktyka nawrotów. Zwięzłe wskazówki, kiedy wystarczy teleporada, a kiedy potrzebna jest pilna konsultacja."
  },
  {
    slug: "neurologia",
    name: "Neurologia",
    shortDescription: "Migrena: objawy, czynniki wyzwalające, leczenie doraźne i profilaktyczne.",
    longMetaDescription:
      "Neurologia w pigułce: migrena i bóle głowy — objawy, czynniki wyzwalające, leczenie doraźne i profilaktyczne. Praktyczne schematy postępowania oraz informacje, kiedy zgłosić się do lekarza lub skorzystać z wizyty domowej."
  }
]

export function getCategoryBySlug(slug: string) {
  return categories.find(c => c.slug === slug) || null
}
