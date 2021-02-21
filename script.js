console.log("Hello");

const lang = "it";

const days = {
  it: ["lun", "mar", "mer", "gio", "ven", "sab", "dom"],
  en: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
};

const months = {
  it: [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre"
  ],
  en: [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
  ]
};

const holidays = [
  {
    name: "Capodanno",
    date: new Date("01/01/2020")
  },
  {
    name: "Epifania",
    date: new Date("01/06/2020")
  },
  {
    name: "Pasqua",
    date: new Date("04/12/2020")
  },
  {
    name: "Lunedì di Pasquetta",
    date: new Date("04/13/2020")
  },
  {
    name: "Liberazione",
    date: new Date("04/25/2020")
  },
  {
    name: "Festa del Lavoro",
    date: new Date("05/01/2020")
  },
  {
    name: "Festa della Repubblica",
    date: new Date("06/02/2020")
  },
  {
    name: "Ferragosto",
    date: new Date("08/15/2020")
  },
  {
    name: "Tutti i Santi",
    date: new Date("11/01/2020")
  },
  {
    name: "Immacolata",
    date: new Date("12/08/2020")
  },
  {
    name: "Natale",
    date: new Date("12/25/2020")
  },
  {
    name: "Santo Stefano",
    date: new Date("12/26/2020")
  }
];

const events = [
  // {
  //   name: "Compleanno Mama",
  //   date: new Date("03/26/2020")
  // },
  // {
  //   name: "Compleanno Alex",
  //   date: new Date("06/08/2020")
  // },
  // {
  //   name: "Compleanno Vitalie",
  //   date: new Date("06/16/2020")
  // },
  // {
  //   name: "Compleanno Aurora",
  //   date: new Date("07/24/2020")
  // }
];

const root = document.getElementById("root");

const date = new Date(`01/01/2020`);

for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
  // Crea la sezione del mese.
  const section = document.createElement("section");
  section.classList.add("sheet");

  // Aggiunge il nome del mese in alto e l'anno in basso.
  section.innerHTML += `<span class="month-name">${months[lang][monthIndex]}</span>`;
  section.innerHTML += `<span class="year">${date.getFullYear()}</span>`;

  // Crea la tabella.
  const table = document.createElement("table");
  table.setAttribute("cellspacing", "0");
  table.classList.add("month");

  const tbody = document.createElement("tbody");

  // Aggiunge intestazione dei giorni.
  const td = document.createElement("tr");
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const asd = document.createElement("td");
    asd.innerHTML = days[lang][dayIndex];
    td.appendChild(asd);
  }
  tbody.appendChild(td);

  // Serve per iniziare correttamente la numerazione dei giorni.
  date.setDate(date.getDate() - date.getDate());
  date.setDate(date.getDate() - date.getDay() + 1);

  // Aggiunge il resto delle righe.
  for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
    const tr = document.createElement("tr");
    for (let colIndex = 0; colIndex < 7; colIndex++) {
      const td = document.createElement("td");

      const dayNumberInMonth = date.getDate(); // One based
      const dayNumberInWeek = date.getDay(); // Zero based

      // Giorno normale.
      td.innerHTML = dayNumberInMonth;

      // Domenica
      if (colIndex === 6) {
        td.innerHTML = `<span class="event-day red">${dayNumberInMonth}</span>`;
      }

      // Giorno festivo
      const hDay = holidays.find(value => value.date.getTime() === date.getTime());
      if (hDay) {
        td.classList.add("event");
        td.innerHTML = `<span class="event-day red">${dayNumberInMonth}</span><span class="event-label">${hDay.name}</span>`;
      }

      // Evento
      const eDay = events.find(value => value.date.getTime() === date.getTime());
      if (eDay) {
        td.classList.add("event");
        td.innerHTML = `<span class="event-day green">${dayNumberInMonth}</span><span class="event-label">${eDay.name}</span>`;
      }

      // Giorno di un altro mese. Mostrato in grigio chiaro.
      if (date.getMonth() !== monthIndex) {
        td.classList.add("off");
        td.innerHTML = dayNumberInMonth;
      }

      tr.appendChild(td);
      date.setDate(date.getDate() + 1);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  section.appendChild(table);
  root.appendChild(section);
}
