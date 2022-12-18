import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

interface CalendarEvent {
  name: string;
  color?: string;
  date: Date;
}

const LANG = 'it';

const DAYS = {
  it: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
  en: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
};

const MONTHS = {
  it: [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ],
  en: [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ],
};

const HOLIDAYS = [
  {
    name: 'Capodanno',
    date: new Date('01/01/2022'),
  },
  {
    name: 'Epifania',
    date: new Date('01/06/2022'),
  },
  {
    name: 'Pasqua',
    date: new Date('04/12/2022'),
  },
  {
    name: 'Lunedì di Pasquetta',
    date: new Date('04/13/2022'),
  },
  {
    name: 'Liberazione',
    date: new Date('04/25/2022'),
  },
  {
    name: 'Festa del Lavoro',
    date: new Date('05/01/2022'),
  },
  {
    name: 'Festa della Repubblica',
    date: new Date('06/02/2022'),
  },
  {
    name: 'Ferragosto',
    date: new Date('08/15/2022'),
  },
  {
    name: 'Tutti i Santi',
    date: new Date('11/01/2022'),
  },
  {
    name: 'Immacolata',
    date: new Date('12/08/2022'),
  },
  {
    name: 'Natale',
    date: new Date('12/25/2022'),
  },
  {
    name: 'Santo Stefano',
    date: new Date('12/26/2022'),
  },
];

// let events: CalendarEvent[] = [
//   {
//     name: 'Compleanno Mama',
//     date: new Date('03/26/2022'),
//   },
//   {
//     name: 'Compleanno Alex',
//     date: new Date('06/08/2022'),
//   },
//   {
//     name: 'Compleanno Vitalie',
//     date: new Date('06/16/2022'),
//   },
//   {
//     name: 'Compleanno Aurora',
//     date: new Date('07/24/2022'),
//   },
// ];

type Day = {
  number?: number;
  isSunday?: boolean;
  eventName?: string;
  holidayName?: string;
  otherMonth?: boolean;
  event?: CalendarEvent;
};

type Month = {
  name?: string;
  rows: {
    cols: Day[];
  }[];
};

type Calendar = Array<Month>;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  locale = 'it';
  days = DAYS['it'];
  months = MONTHS['it'];
  initialDate: Date = new Date(`01/01/2022`);

  events: CalendarEvent[] = [];
  calendar: Calendar = [];

  form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    dateControl: new FormControl<Date>(new Date(), { nonNullable: true }),
    color: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit() {
    this.initialDate = new Date(`01/01/2022`);

    this.restoreState();
    this.updateCalendar();
    this.updateEvents();
  }

  private isSameDay(first: Date, second: Date) {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  public print() {
    window.print();
  }

  public addEvent() {
    this.events.push({
      name: this.form.controls.name.value,
      date: this.form.controls.dateControl.value,
      color: this.form.controls.color.value,
    });

    window.localStorage.setItem('save', JSON.stringify(this.events));

    this.updateCalendar();
    this.updateEvents();
  }

  public deleteEvent(index: number) {
    this.events.splice(index, 1);

    window.localStorage.setItem('save', JSON.stringify(this.events));

    this.updateCalendar();
    this.updateEvents();
  }

  private updateEvents() {
    // const container = document.getElementById('events');
    // container.innerHTML = '';
    // for (let i = 0; i < events.length; i++) {
    //   const event = events[i];
    //   const date = event.date.toLocaleDateString();
    //   container?.appendChild(
    //     `<li>${event.name} - ${date} <button id="btn-event-${i}">Del</button></li>`
    //   );
    //   document
    //     .getElementById(`btn-event-${i}`)
    //     ?.addEventListener('click', () => {
    //       events = events.filter((v, idx) => idx !== i);
    //       console.log(events);
    //       this.updateEvents();
    //     });
    // }
  }

  private restoreState() {
    const restoredState = window.localStorage.getItem('save');

    if (restoredState) {
      this.events = [
        ...JSON.parse(restoredState).map((v: CalendarEvent) => ({
          name: v.name,
          date: new Date(v.date),
          color: v.color,
        })),
      ];
    }
  }

  private updateCalendar() {
    const date = new Date(this.initialDate);
    const newCalendar: Calendar = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month: Month = {
        name: MONTHS['it'][monthIndex],
        rows: [],
      };

      newCalendar.push(month);

      // Serve per iniziare correttamente la numerazione dei giorni.
      date.setDate(date.getDate() - date.getDate());
      date.setDate(date.getDate() - date.getDay() + 1);

      // Aggiunge il resto delle righe.
      for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
        newCalendar[monthIndex].rows.push({
          cols: [],
        });

        for (let colIndex = 0; colIndex < 7; colIndex++) {
          const day: Day = {};

          const dayNumberInMonth = date.getDate(); // One based

          // Giorno normale.
          day.number = dayNumberInMonth;

          // Domenica
          if (colIndex === 6) {
            day.isSunday = true;
          }

          // Giorno festivo
          const holiday = HOLIDAYS.find((value) => this.isSameDay(value.date, date));
          if (holiday) {
            day.holidayName = holiday.name;
          }

          // Evento
          const event = this.events.find((value) => this.isSameDay(value.date, date));
          if (event) {
            day.eventName = event.name;
            day.event = event;
          }

          // Giorno di un altro mese. Mostrato in grigio chiaro.
          if (date.getMonth() !== monthIndex) {
            day.otherMonth = true;
          }

          newCalendar[monthIndex].rows[rowIndex].cols.push(day);

          date.setDate(date.getDate() + 1);
        }
      }
    }

    this.calendar = newCalendar;
  }
}
