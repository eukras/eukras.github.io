const SPECTRUMS = {
  'covid_19': {
    id: 'covid_19',
    name: 'COVID-19 2022',
    version: '1.0',
    description: "This collection of conspiratorial statements were seen online during the COVID pandemic.",
    statements: {
      '5g': "COVID-19 symptoms are caused by 5G towers rather than by any virus",
      'af': "COVID-19 is not threatening to African populations",
      'bi': "COVID-19 was created in a bioweapons research program",
      'ch': "COVID-19 cannot affect true Christians",
      'ci': "COVID-19 was part of a CIA program to weaken Chinese influence",
      'cm': "COVID-19 vaccines have been monopolised by wealthy nations to the detriment of poor nations",
      'cp': "COVID-19 is being exploited to maximise corporate profit",
      'cs': "COVID-19 is a cover for human organ trafficking networks",
      'cv': "COVID-19 is cover story for something else that's happening",
      'dg': "COVID-19 vaccines pose a greater threat to the average person than the virus does",
      'dn': "COVID-19 mRNA vaccines permanently alter human DNA",
      'dp': "COVID-19 is being exploited to increase political polarisation",
      'fd': "COVID-19 originated in a bioweapons lab in North America",
      'fl': "COVID-19 is no more dangerous than influenza",
      'fr': "COVID-19 is being exploited to limit the freedom of citizens in western nations",
      'fx': "COVID-19 is being exploited to make the public give up their freedoms",
      'gr': "COVID-19 conspiracies exist and are part of larger global conspiracies such as a 'New World Order' or 'Great Reset'",
      'gi': "COVID-19 vaccine company shareholders include United States politicians",
      'ht': "COVID-19 mRNA vaccine boosters cause a high rate of heart attacks in young people",
      'hx': "COVID-19 doesn't exist; it's 100% a hoax",
      'ic': "COVID-19 is an internationalist conspiracy to undermine national sovereignty",
      'im': "COVID-19 has been disproportionately spread by immigrant communities",
      'in': "COVID-19 mRNA vaccines cause infertility in women",
      'vi': "COVID-19 mRNA vaccine manufacturers have histories of legal settlements, medical fraud convictions, and unapproved clinical trials.",
      'iv': "COVID-19 treatments like Ivermectin or hydroxychloroquine are being suppressed for non-medical reasons",
      'jw': "COVID-19 is a conspiracy by Jewish globalists",
      'lt': "COVID-19 variants have consistently been less dangerous than authorities have claimed",
      'mk': "COVID-19 masks are a health risk",
      'mm': "COVID-19 vaccines have consistently provided less resistance to the virus than authorities have claimed",
      'nb': "COVID-19 vaccine injections contain technological materials such as magnets, nanobots, or microchips",
      'nt': "COVID-19 vaccines have not been properly tested",
      'of': "COVID-19 infections have been under-reported by Chinese officials",
      'ov': "COVID-19 hospitalisations and deaths have been over-reported by doctors",
      'ox': "COVID-19 hospitalisations and deaths are being covered up by doctors, media, and politicians in western nations",
      'pw': "COVID-19 emergency powers are an attempt to permanently take power over citizens",
      'rs': "COVID-19 threats were ignored by US President Trump for political reasons",
      'rx': "COVID-19 threats were exaggerated in order to undermine US President Trump",
      'se': "COVID-19 was deliberately created and spread to sell vaccines",
      'st': "COVID-19 vaccines are being used to carry out mass sterilisations of specific ethnic groups",
      'td': "COVID-19 conspiracy theories are being used to sow mistrust in democratic governments and public institutions",
      'te': "COVID-19 tests are far less reliable than authorities are saying",
      'tf': "COVID-19 policies have not adequately protected personal freedom",
      'ts': "COVID-19 policies have not adequately protected personal safety",
      'us': "COVID-19 was created by the United States government",
      'ur': "COVID-19 hospitalisations and deaths are under-reported by doctors",
      'va': "COVID-19 variants are being intentionally released at intervals in order to prolong the pandemic",
      'vt': "COVID-19 can be prevented with vitamins, good health, and our bodies' natural defenses",
      'wv': "COVID-19 escaped from the Wuhan Institute of Virology in China",
      'zh': "COVID-19 was created by the Chinese government",
    },
  },
  'trump': {
    id: 'trump',
    name: 'Trump 2020',
    version: '1.0',
    description: "This spectrum is based on the Wikipedia page, 'List of conspiracy theories promoted by Donald Trump', as of February 2022. It is limited to claims that Trump has explicitly endorsed.",
    statements: {
      '16': "Millions of illegal immigrants voted in the 2016 presidential election, costing Trump the popular vote",
      '20': "There was widespread electoral fraud in the 2020 presidential election; it was 'stolen' from Trump, who legitimately won",
      'bl': "The raid that supposedly killed Osama bin Laden only killed a body double",
      'bo': "Barack Obama was not born in the United States",
      'cl': "Bill and Hillary Clinton have had former colleagues and associates murdered",
      'cv': "COVID-19 deaths were systematically overcounted by doctors during his presidency",
      'ds': "A 'Deep State', consisting of unelected military, intelligence and government officials try to secretly manipulate government",
      'fb': "The FBI helped stage the attack on the Capitol building on 6 Jan 2021",
      'im': "The death tolls from hurricanes Irma and Maria in Puerto Rico were inflated by democrats to smear President Trump's image",
      'je': "Jeffery Epstein did not commit suicide",
      'jh': "Joe and Hunter Biden engaged in corrupt activities in Ukraine",
      'js': "The political commentator and Trump critic Joe Scarborough murdered an intern in 2001",
      'rm': "The US embassy in Rome used satellites and military technology to switch votes to Joe Biden in the 2020 presidential election",
      'sg': "The Obama administration illegally spied on Trump campaign figures",
      'sp': "The Obama adminstration placed a spy inside Trump's 2016 presidential campaign",
      'tc': "Ted Cruz committed fraud and stole the Iowa caucuses of 2016, in which he defeated Trump",
      'tt': "Trump Tower was surveilled by US or UK government agencies during the 2016 presidential campaign",
      'uk': "Ukraine attempted to interfere in the 2016 presidential election",
    },
  },
  'us_classics': {
    id: 'us_classics',
    name: 'US Classics 2018',
    version: '1.0',
    description: "This top-ten list of mostly-American conspiracy theories appears in Chapter 2 " +
      "of 'Escaping the Rabbit Hole' (Mick West, 2018). An updated list would include news media, " +
      "electoral fraud, COVID-19, and QAnon.",
    statements: {
      'bp': "pharmaceutical companies conspire to maximise profit by selling drugs that people do not actually need",
      'gw': "climate change is not caused by man-made carbon emissions, and there's some other motive for claiming this",
      'jf': "people in addition to Lee Harvey Oswald were involved in the assassination of John F. Kennedy",
      'wt': "the events of 9/11 were arranged by elements within the US government",
      'ct': "the trails left behind aircraft are part of a secret spraying program",
      'ff': "shootings like Sandy Hook and Las Vegas either never happened or were arranged by people in power",
      'ml': "the moon landings were faked in a movie studio",
      'uf': "the US government has contact with aliens or crashed alien aircraft and is keeping it secret",
      'fe': "the earth is flat, but governments, business, and scientists all pretend it is a globe",
      'ro': "the ruling classes are a race of shape-shifting trans-dimensional reptiles",
    },
  },
  'us_rightwing': {
    id: 'us_rightwing',
    name: 'US Right Wing 2015',
    version: '1.0',
    description: "This spectrum is based on the 2015 Salon article “10 Right-Wing Conspiracy Theories That Have Slowly Invaded American Politics” by Mark Potok and Don Terry.",
    statements: {
      'cc': 'the Common Core State Standards in education are political indoctrination',
      'ml': 'the Jade Helm 15 military exercises were a prelude to invoking martial law',
      '21': 'the United Nations’ Agenda 21 program attempts utopian environmentalism, social engineering, and global political control',
      'nu': 'the North American Union agreement will merge Canada, the United States, and Mexico into a single nation',
      'sl': 'Sharia law (i.e. Islamic religious law) is being implemented in American court-rooms',
      'gc': 'the government is planning to seize privately owned firearms',
      'fe': 'the Federal Emergency Management Agency has built hundreds of concentration camps across the United States',
      'ib': 'international bankers, usually Jewish, are manipulating economic events in the United States',
      'mt': 'there are Muslim terrorist training camps scattered across the United States',
      'lg': 'campaigns for LGBT rights are efforts to control and marginalise Christians',
    },
  },
};

export { SPECTRUMS };
