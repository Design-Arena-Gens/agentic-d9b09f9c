"use client";

import { useMemo, useState } from "react";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type Language = "en" | "af";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
};

type BookingDetails = {
  name?: string;
  contact?: string;
  vehicle?: string;
  year?: string;
  damage?: string;
  photos?: string;
  insuranceProvider?: string;
};

type AgentState = {
  language: Language;
  activeFlow?: "estimate" | "booking" | "update" | "tips";
  expectedField?: keyof BookingDetails;
  details: BookingDetails;
  lastServiceMentioned?: string;
  variantCursor?: number;
};

const initialMessages: Message[] = [
  {
    id: createId(),
    role: "assistant",
    content:
      "Good day! I'm the De Jongh family's digital assistant. How can I help with your vehicle today?",
    timestamp: Date.now(),
  },
];

const languageLabels: Record<Language, string> = {
  en: "English",
  af: "Afrikaans",
};

const services = [
  {
    key: "collision repair",
    label: "Collision Repair",
    description:
      "Panel beating and chassis alignment to factory specifications after an accident.",
  },
  {
    key: "spray painting",
    label: "Spray Painting",
    description:
      "Full resprays, custom colours, and flawless spot repairs in our downdraft spray booth.",
  },
  {
    key: "dent removal",
    label: "Dent Removal",
    description:
      "Precision dent and crease removal to restore your vehicle's smooth finish.",
  },
  {
    key: "rust repair",
    label: "Rust Repair",
    description:
      "Cut out corrosion, treat affected panels, and reseal to stop rust in its tracks.",
  },
  {
    key: "polishing",
    label: "Polishing & Detailing",
    description:
      "Machine polishing and ceramic protection to keep paintwork shining.",
  },
  {
    key: "insurance",
    label: "Insurance Claims",
    description:
      "We liaise with major insurers and assist with paperwork for a smooth claims process.",
  },
];

const languageSwitchPhrases: Record<Language, string[]> = {
  en: [
    "afrikaans",
    "speak afrikaans",
    "switch to afrikaans",
    "kan jy afrikaans praat",
  ],
  af: [
    "english",
    "speak english",
    "switch to english",
    "praat jy engels",
  ],
};

const politeGoodbyes = [
  "Thank you for reaching out to De Jongh's Panelbeating Centre. We're always here if you need anything else.",
  "It's been a pleasure assisting you. Let us know if you'd like to book a visit or need more advice.",
];

const maintenanceTips: Record<Language, string[]> = {
  en: [
    "Rinse your vehicle weekly to remove road grime and salt before it can damage the paint.",
    "Apply a quality wax or ceramic coating every 6 months to shield the respray from UV and contaminants.",
    "Avoid automatic car washes for the first 30 days after a respray-hand washing keeps the finish flawless.",
    "Keep rubber seals and trims conditioned so moisture doesn't creep behind fresh panels.",
  ],
  af: [
    "Spoel jou voertuig weekliks af om padvuil en sout te verwyder voordat dit die verf beskadig.",
    "Wend elke 6 maande 'n goeie was of keramieklaag aan om die nuwe verf teen UV en besoedeling te beskerm.",
    "Vermy outomatiese karwassies vir die eerste 30 dae na 'n spuitwerk-handewas hou die afwerking netjies.",
    "Hou rubbers en afdichtings behandel sodat vog nie agter vars panele inkruip nie.",
  ],
};

const flowPrompts: Record<Language, Record<keyof BookingDetails, string>> = {
  en: {
    name: "Could I please have your name so we can personalise the booking?",
    contact:
      "What is the best contact number or email address for updates?",
    vehicle: "Which make and model are we working on?",
    year: "Do you know the model year of the vehicle?",
    damage:
      "Please describe the damage or repair needed-feel free to mention location and severity.",
    photos:
      "If you have photos, you can paste a link here so our estimators can review them.",
    insuranceProvider:
      "Are you claiming through insurance? If so, which provider is assisting you?",
  },
  af: {
    name: "Laat weet my asseblief jou naam sodat ons die bespreking kan personaliseer.",
    contact:
      "Wat is die beste kontaknommer of e-posadres vir terugvoer?",
    vehicle: "Watter maak en model werk ons aan?",
    year: "Ken jy die modeljaar van die voertuig?",
    damage:
      "Beskryf asseblief die skade of werk wat gedoen moet word-noem waar en hoe erg dit is.",
    photos:
      "As jy foto's het, kan jy 'n skakel hier plak sodat ons beoordelaars dit kan bekyk.",
    insuranceProvider:
      "Is dit 'n versekeringsaanspraak? Indien wel, saam met watter verskaffer werk jy?",
  },
};

const serviceDescriptions: Record<Language, string> = {
  en: services
    .map(
      (service) =>
        `- ${service.label}: ${service.description}`,
    )
    .join("\n"),
  af: [
    "- Botsingsherstel: Paneelklop en onderstelregstelling volgens fabriekspesifikasies na 'n ongeluk.",
    "- Spuitwerk: Volledige oorspuitings, pasgemaakte kleure en plekreparasies in ons afwaartse spuitkamer.",
    "- Duikverwydering: Presiese verwydering van duike en kreuke vir 'n gladde afwerking.",
    "- Roessaanpassing: Sny roes uit, behandel panele en verseel weer om verdere skade te keer.",
    "- Poleer & Detailing: Masjienpoleer en keramiekbeskerming om jou verfwerk te laat glans.",
    "- Versekeringshulp: Ons skakel met groot versekeringsmaatskappye en help met papierwerk vir 'n gladde eisproses.",
  ].join("\n"),
};

const friendlyFallback: Record<Language, string> = {
  en: "I'm here to help with anything related to repairs, bookings, or updates. How can I support you today?",
  af: "Ek is hier om jou te help met herstelwerk, besprekings of opdaterings. Hoe kan ek jou vandag bystaan?",
};

const acknowledgmentByField: Record<
  keyof BookingDetails,
  { en: string; af: string }
> = {
  name: {
    en: "Thanks, {value}.",
    af: "Dankie, {value}.",
  },
  contact: {
    en: "Perfect, we'll use {value} to keep you updated.",
    af: "Genoeg, ons gebruik {value} om jou op hoogte te hou.",
  },
  vehicle: {
    en: "Great, working on a {value} helps us prepare the right team.",
    af: "Goed, om aan 'n {value} te werk help ons om die regte span gereed te kry.",
  },
  year: {
    en: "Noted, model year {value}.",
    af: "Genoteer, modeljaar {value}.",
  },
  damage: {
    en: "Thanks for the detail - that gives our estimators a head start.",
    af: "Dankie vir die detail - dit help ons beoordelaars om vinnig te begin.",
  },
  photos: {
    en: "Excellent, photos always help our quoting team.",
    af: "Uitstekend, foto's help altyd ons kwotasiespan.",
  },
  insuranceProvider: {
    en: "Brilliant, we have a good relationship with {value}.",
    af: "Wonderlik, ons werk gereeld saam met {value}.",
  },
};

const detectLanguageSwitch = (message: string, current: Language): Language => {
  const lower = message.toLowerCase();
  const alternate: Language = current === "en" ? "af" : "en";
  const triggers = languageSwitchPhrases[current];
  if (triggers.some((phrase) => lower.includes(phrase))) {
    return alternate;
  }
  return current;
};

const detectFarewell = (message: string) =>
  /\b(thank you|thanks|baie dankie|appreciate|tot siens|goodbye|have a good day)\b/i.test(
    message,
  );

const detectFlow = (message: string): AgentState["activeFlow"] => {
  const lower = message.toLowerCase();
  if (
    /\b(quote|estimate|quotation|kwotasie|vooraf|prys|cost|kosten)\b/.test(lower)
  ) {
    return "estimate";
  }
  if (
    /\b(book|booking|schedule|appointment|bespreek|skeduleer|afspraak)\b/.test(
      lower,
    )
  ) {
    return "booking";
  }
  if (/\b(status|update|progress|vordering|klaar)\b/.test(lower)) {
    return "update";
  }
  if (
    /\b(tip|maintenance|protect|onderhoud|wenke|beskerm)\b/.test(lower)
  ) {
    return "tips";
  }
  return undefined;
};

const getNextField = (details: BookingDetails): keyof BookingDetails | undefined => {
  const ordering: (keyof BookingDetails)[] = [
    "name",
    "contact",
    "vehicle",
    "year",
    "damage",
    "photos",
    "insuranceProvider",
  ];
  return ordering.find((field) => !details[field]);
};

const summariseBooking = (details: BookingDetails, lang: Language) => {
  const lines: string[] = [];
  if (details.name) {
    lines.push(
      lang === "en"
        ? `Name: ${details.name}`
        : `Naam: ${details.name}`,
    );
  }
  if (details.contact) {
    lines.push(
      lang === "en"
        ? `Contact: ${details.contact}`
        : `Kontak: ${details.contact}`,
    );
  }
  if (details.vehicle) {
    lines.push(
      lang === "en"
        ? `Vehicle: ${details.vehicle}${details.year ? ` (${details.year})` : ""}`
        : `Voertuig: ${details.vehicle}${details.year ? ` (${details.year})` : ""}`,
    );
  }
  if (details.damage) {
    lines.push(
      lang === "en"
        ? `Damage: ${details.damage}`
        : `Skade: ${details.damage}`,
    );
  }
  if (details.photos) {
    lines.push(
      lang === "en"
        ? `Photos: ${details.photos}`
        : `Foto's: ${details.photos}`,
    );
  }
  if (details.insuranceProvider) {
    lines.push(
      lang === "en"
        ? `Insurance: ${details.insuranceProvider}`
        : `Versekeringsverskaffer: ${details.insuranceProvider}`,
    );
  }

  if (!lines.length) return "";

  return lines.map((line) => `- ${line}`).join("\n");
};

const jobUpdateResponses: Record<Language, string[]> = {
  en: [
    "I've checked the workshop tracker for you. Your vehicle is in the spray booth today and we're expecting polishing to wrap up by Thursday afternoon.",
    "The panel beating is complete and paint is curing overnight. We'll do quality control first thing tomorrow and keep you posted.",
    "We've ordered a replacement for the damaged panel and expect delivery tomorrow morning. We'll send photos once it's fitted.",
  ],
  af: [
    "Ek het die werkswinkelstelsel gekontroleer. Jou voertuig is vandag in die spuitkamer en ons beplan om die poleerwerk teen Donderdagmiddag klaar te maak.",
    "Die paneelklop is voltooi en die verf droog oornag. Ons doen more oggend gehaltebeheer en hou jou op hoogte.",
    "Ons het 'n vervangingspaneel bestel en verwag aflewering more oggend. Ons stuur foto's sodra dit aangebring is.",
  ],
};

const estimateIntro: Record<Language, string> = {
  en: "I can help with that estimate. To make it accurate, may I capture a few details?",
  af: "Ek kan met die kwotasie help. Kan ek 'n paar besonderhede vasle om dit akkuraat te maak?",
};

const bookingThanks: Record<Language, string> = {
  en: "Thanks so much-we have everything we need to prepare your booking. Our team will reach out shortly to confirm timing and next steps.",
  af: "Baie dankie, ons het alles wat ons nodig het om jou bespreking voor te berei. Ons span kontak jou binnekort om tydsberekening en volgende stappe te bevestig.",
};

const tipIntro: Record<Language, string> = {
  en: "Here are a few maintenance and paint protection pointers from our workshop:",
  af: "Hier is 'n paar onderhouds- en verfbeskermingswenke uit ons werkswinkel:",
};

const serviceMenuIntro: Record<Language, string> = {
  en: "We're a family-run panelbeater offering the following services:",
  af: "Ons is 'n familieonderneming wat die volgende dienste bied:",
};

export function ChatAgent() {
  const [messages, setMessages] = useState<Message[]>(() => initialMessages);
  const [input, setInput] = useState("");
  const [state, setState] = useState<AgentState>({
    language: "en",
    details: {},
    variantCursor: 0,
  });

  const quickReplies = useMemo(() => {
    if (state.activeFlow === "tips") {
      return [];
    }
    return [
      state.language === "en"
        ? "What services do you offer?"
        : "Watter dienste bied julle?",
      state.language === "en"
        ? "Can I get an estimate?"
        : "Kan ek 'n kwotasie kry?",
      state.language === "en"
        ? "I'd like to book a repair."
        : "Ek wil 'n herstel bespreek.",
      state.language === "en"
        ? "What's the status of my car?"
        : "Wat is die status van my kar?",
      state.language === "en"
        ? "Share maintenance tips."
        : "Deel onderhoudswennke.",
    ];
  }, [state.activeFlow, state.language]);

  const appendMessage = (role: Message["role"], content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role,
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  const respond = (userMessage: string) => {
    const trimmed = userMessage.trim();
    if (!trimmed) return;

    const language = detectLanguageSwitch(trimmed, state.language);
    const farewell = detectFarewell(trimmed);
    const flowFromMessage = detectFlow(trimmed);
    let newState: AgentState = {
      ...state,
      language,
    };

    let variantCursor = state.variantCursor ?? 0;
    const takeVariant = (list: string[]) => {
      if (!list.length) return "";
      const choice = list[variantCursor % list.length];
      variantCursor += 1;
      return choice;
    };

    const responses: string[] = [];

    const lower = trimmed.toLowerCase();

    if (flowFromMessage && flowFromMessage !== state.activeFlow) {
      if (flowFromMessage === "estimate" || flowFromMessage === "booking") {
        newState = {
          ...newState,
          activeFlow: flowFromMessage,
          expectedField: getNextField(newState.details) ?? "name",
        };
        responses.push(estimateIntro[language]);
        const nextField = newState.expectedField;
        if (nextField) {
          responses.push(flowPrompts[language][nextField]);
        }
      } else if (flowFromMessage === "update") {
        newState = {
          ...newState,
          activeFlow: "update",
          expectedField: undefined,
        };
        const updateResponse = takeVariant(jobUpdateResponses[language]);
        if (updateResponse) {
          responses.push(updateResponse);
        }
        responses.push(
          language === "en"
            ? "Would you like us to arrange a pickup time once detailing is finished?"
            : "Wil jy he ons moet 'n ophaaltyd reel sodra die finishing klaar is?",
        );
      } else if (flowFromMessage === "tips") {
        newState = {
          ...newState,
          activeFlow: "tips",
          expectedField: undefined,
        };
        responses.push(
          `${tipIntro[language]}\n${maintenanceTips[language]
            .slice(0, 3)
            .map((tip) => `- ${tip}`)
            .join("\n")}`,
        );
        responses.push(
          language === "en"
            ? "Let me know if you'd like more guidance tailored to your vehicle."
            : "Laat weet my as jy meer raad wil he wat by jou voertuig pas.",
        );
      }
    } else if (state.expectedField) {
      const field = state.expectedField;
      const updatedDetails: BookingDetails = {
        ...state.details,
        [field]: trimmed,
      };
      const nextField = getNextField(updatedDetails);
      newState = {
        ...newState,
        details: updatedDetails,
        expectedField: nextField,
      };

      const acknowledgementTemplate = acknowledgmentByField[field];
      const acknowledgement =
        acknowledgementTemplate?.[language] ?? "";

      if (acknowledgement) {
        responses.push(acknowledgement.replace("{value}", trimmed));
      }

      if (nextField) {
        responses.push(flowPrompts[language][nextField]);
      } else {
        responses.push(bookingThanks[language]);
        const summary = summariseBooking(updatedDetails, language);
        if (summary) {
          responses.push(
            language === "en"
              ? `Here's a summary for our workshop:\n${summary}`
              : `Hier is 'n opsomming vir ons werkswinkel:\n${summary}`,
          );
        }
        responses.push(
          language === "en"
            ? "If you're working through insurance, feel free to email supporting documents to quotes@dejonghpanel.co.za."
            : "As jy deur versekerings werk, stuur gerus dokumente na quotes@dejonghpanel.co.za.",
        );
        newState = {
          ...newState,
          activeFlow: undefined,
          expectedField: undefined,
          details: {},
        };
      }
    } else if (
      /\b(services|do you offer|watter dienste|service list|help with)\b/.test(
        lower,
      )
    ) {
      responses.push(
        `${serviceMenuIntro[language]}\n${serviceDescriptions[language]}`,
      );
      responses.push(
        language === "en"
          ? "Let me know which repair you need and I'll guide you through scheduling or quoting."
          : "Laat weet watter herstel jy benodig en ek help jou deur die bespreking of kwotasie.",
      );
    } else if (
      /\b(status|update|progress|job|vordering|klaar|ready)\b/.test(lower)
    ) {
      const updateResponse = takeVariant(jobUpdateResponses[language]);
      if (updateResponse) {
        responses.push(updateResponse);
      }
      responses.push(
        language === "en"
          ? "Would you like us to call when it's ready for collection?"
          : "Moet ons jou bel wanneer dit reg is vir afhaal?",
      );
    } else if (
      /\b(thank|dankie|appreciate|baie dankie|great|awesome)\b/.test(lower) &&
      state.activeFlow !== "tips"
    ) {
      responses.push(
        language === "en"
          ? takeVariant(politeGoodbyes)
          : "Baie dankie dat jy De Jongh se Paneelklop Sentrum gekies het. Laat weet as ons verder kan help.",
      );
    } else if (
      /\b(tips|maintenance|protect|respray|aftercare|onderhoud|versorg)\b/.test(
        lower,
      )
    ) {
      responses.push(
        `${tipIntro[language]}\n${maintenanceTips[language]
          .slice(0, 3)
          .map((tip) => `- ${tip}`)
          .join("\n")}`,
      );
      responses.push(
        language === "en"
          ? "If you'd like personalised recommendations, just tell me your paint colour or driving habits."
          : "As jy persoonlike aanbevelings wil he, noem jou verfkleur of bestuurstyl.",
      );
    } else if (
      /\b(hours|open|location|waar|address|adres|opening|closing)\b/.test(lower)
    ) {
      responses.push(
        language === "en"
          ? "We're based in Bellville South, Cape Town. Workshop hours are Monday to Friday 07:30-17:00, and Saturdays by appointment."
          : "Ons is in Bellville-Suid, Kaapstad. Werksure is Maandag tot Vrydag 07:30-17:00 en Saterdae volgens afspraak.",
      );
      responses.push(
        language === "en"
          ? "You're welcome to drop by or send photos ahead of time for a head start on the quote."
          : "Jy's welkom om in te loer of vooraf foto's te stuur sodat ons aan die kwotasie kan begin werk.",
      );
    } else if (
      /\b(insurance|claim|insurer|assessor|versekering|eis)\b/.test(lower)
    ) {
      responses.push(
        language === "en"
          ? "We work closely with most major insurers and guide you through assessments and claim approvals."
          : "Ons werk nou saam met die meeste groot versekerings en lei jou deur assesserings en eise goedkeuring.",
      );
      responses.push(
        language === "en"
          ? "If you share your claim number and assessor's contact, we'll take it from there."
          : "As jy jou eisnommer en assessor se kontakbesonderhede deel, hanteer ons die res.",
      );
      newState = {
        ...newState,
        activeFlow: "booking",
        expectedField: getNextField(newState.details) ?? "name",
      };
      if (newState.expectedField) {
        responses.push(flowPrompts[language][newState.expectedField]);
      }
    } else if (
      /\b(chassis|frame|straighten|alignment|onderstel|reguit)\b/.test(lower)
    ) {
      responses.push(
        language === "en"
          ? "Our chassis alignment bench restores factory geometry after heavy impacts. We measure digitally to ensure perfect tracking."
          : "Ons onderstelreguitbank herstel fabriekgeometrie na ernstige impakte. Ons meet digitaal om perfekte wielsporing te verseker.",
      );
      responses.push(
        language === "en"
          ? "Would you like us to arrange a structural assessment?"
          : "Wil jy he ons moet 'n strukturele assessering reel?",
      );
      newState = {
        ...newState,
        lastServiceMentioned: "chassis alignment",
      };
    } else if (
      /\b(polish|detailing|shine|buff|ceramic|politoer|glans)\b/.test(lower)
    ) {
      responses.push(
        language === "en"
          ? "Our detailing team offers machine polishing, swirl removal, and ceramic coatings for long-lasting gloss."
          : "Ons detailing-span bied masjienpoleer, krapverwydering en keramiekbedekkings vir langdurige glans.",
      );
      responses.push(
        language === "en"
          ? "Let me know if you prefer a maintenance plan or a once-off treatment."
          : "Laat weet of jy 'n onderhoudsplan of 'n eenmalige behandeling verkies.",
      );
      newState = {
        ...newState,
        lastServiceMentioned: "detailing",
      };
    } else if (farewell) {
      responses.push(
        language === "en"
          ? takeVariant(politeGoodbyes)
          : "Baie dankie dat jy met ons gesels het. Laat weet gerus as ons verder kan help.",
      );
    } else if (
      state.lastServiceMentioned &&
      /\b(yes|ja|please|please do|sure|sounds good|go ahead|asseblief)\b/.test(
        lower,
      )
    ) {
      const followUp =
        state.lastServiceMentioned === "chassis alignment"
          ? language === "en"
            ? "Wonderful. I'll note that you'd like a structural check added to your visit."
            : "Wonderlik. Ek maak 'n nota dat jy 'n strukturele toets by jou afspraak wil he."
          : language === "en"
          ? "Great choice. I'll include a detailing package in your notes."
          : "Goeie keuse. Ek voeg 'n detailing-pakket by jou notas.";
      responses.push(followUp);
      newState = {
        ...newState,
        lastServiceMentioned: undefined,
        activeFlow: "booking",
        expectedField: getNextField(newState.details) ?? "name",
      };
      if (newState.expectedField) {
        responses.push(flowPrompts[language][newState.expectedField]);
      }
    } else {
      responses.push(friendlyFallback[language]);
    }

    if (state.language !== language) {
      responses.unshift(
        language === "en"
          ? "Sure thing, I'll continue in English."
          : "Geen probleem nie, ek gaan verder in Afrikaans.",
      );
    }

    responses.forEach((response) => {
      if (response.trim().length) {
        appendMessage("assistant", response);
      }
    });

    const normalizedCursor = variantCursor % 1000;

    if (farewell) {
      newState = {
        language,
        details: {},
        variantCursor: normalizedCursor,
      };
    } else {
      newState = {
        ...newState,
        variantCursor: normalizedCursor,
      };
    }

    setState(newState);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-stone-500">
            Conversational Assistant
          </p>
          <p className="font-semibold text-stone-900">
            De Jongh&apos;s Panelbeating Centre
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-sm text-stone-600 shadow-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span>Online | {languageLabels[state.language]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-3xl border border-stone-200 bg-white/80 shadow-lg backdrop-blur">
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "assistant"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                    message.role === "assistant"
                      ? "bg-amber-50 text-amber-950"
                      : "bg-stone-900 text-white"
                  }`}
                >
                  {message.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                  <p className="mt-2 text-[11px] text-stone-500">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 bg-white/60 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => {
                    appendMessage("user", reply);
                    respond(reply);
                  }}
                  className="rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-200"
                >
                  {reply}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-2 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault();
                const trimmed = input.trim();
                if (!trimmed) return;
                appendMessage("user", trimmed);
                setInput("");
                respond(trimmed);
              }}
            >
              <textarea
                className="h-16 flex-1 resize-none border-none bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                placeholder={
                  state.language === "en"
                    ? "Ask about repairs, quotes, bookings, or tips..."
                    : "Vra oor herstelwerk, kwotasies, besprekings of wenke..."
                }
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <button
                type="submit"
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                {state.language === "en" ? "Send" : "Stuur"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
