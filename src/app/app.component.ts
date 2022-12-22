import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    dateControl: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    color: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {}

  ngOnInit() {
    this.initialDate = new Date(`01/01/2022`);

    this.restoreState();
    this.updateCalendar();
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
    if (this.form.valid) {
      this.events.push({
        name: this.form.controls.name.value,
        date: new Date(this.form.controls.dateControl.value),
        color: this.form.controls.color.value,
      });

      this.form.reset();

      window.localStorage.setItem('save', JSON.stringify(this.events));

      this.updateCalendar();
    } else {
      Object.keys(this.form.controls).forEach((field) => {
        const control = this.form.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
    }
  }

  public deleteEvent(index: number) {
    this.events.splice(index, 1);

    window.localStorage.setItem('save', JSON.stringify(this.events));

    this.updateCalendar();
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

  public isFieldValid(field: string) {
    return !this.form.get(field)?.valid && this.form.get(field)?.touched;
  }
}
