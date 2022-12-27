import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

const FIXED_HOLIDAYS = [
  {
    name: 'Capodanno',
    date: new Date('2023-01-01'),
    isWorking: false,
  },
  {
    name: 'Epifania',
    date: new Date('2023-01-06'),
    isWorking: false,
  },
  {
    name: 'Festa del Donna',
    date: new Date('2023-03-08'),
    isWorking: true,
  },
  {
    name: 'Festa del Papà',
    date: new Date('2023-03-19'),
    isWorking: true,
  },
  {
    name: 'Liberazione',
    date: new Date('2023-04-25'),
    isWorking: false,
  },
  {
    name: 'Festa del Lavoro',
    date: new Date('2023-05-01'),
    isWorking: false,
  },
  {
    name: 'Festa della Mamma',
    date: new Date('2023-05-08'),
    isWorking: true,
  },
  {
    name: 'Festa della Repubblica',
    date: new Date('2023-06-02'),
    isWorking: false,
  },
  {
    name: 'Ferragosto',
    date: new Date('2023-08-15'),
    isWorking: false,
  },
  {
    name: 'Tutti i Santi',
    date: new Date('2023-11-01'),
    isWorking: false,
  },
  {
    name: 'Immacolata',
    date: new Date('2023-12-08'),
    isWorking: false,
  },
  {
    name: 'Natale',
    date: new Date('2023-12-25'),
    isWorking: false,
  },
  {
    name: 'Santo Stefano',
    date: new Date('2023-12-26'),
    isWorking: false,
  },
  {
    name: 'San Silvestro',
    date: new Date('2023-12-31'),
    isWorking: true,
  },
];

// TODO implement dynamic calculation
const MOVING_HOLIDAYS = [
  {
    name: 'Mercoledì delle Ceneri',
    date: new Date('2022-03-02'),
    isWorking: true,
  },
  {
    name: 'Mercoledì delle Ceneri',
    date: new Date('2023-02-22'),
    isWorking: true,
  },
  {
    name: 'Venerdi Santo',
    date: new Date('2023-04-07'),
    isWorking: true,
  },
  {
    name: 'Pasqua',
    date: new Date('2023-04-09'),
    isWorking: false,
  },
  {
    name: 'Lunedì di Pasquetta',
    date: new Date('2023-04-10'),
    isWorking: false,
  },
];

type Day = {
  number?: number;
  isSunday?: boolean;
  eventName?: string;
  holidayName?: string;
  otherMonth?: boolean;
  event?: CalendarEvent;
  isWorking?: boolean;
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
  locale!: 'it' | 'en';
  days = DAYS[this.locale];
  months = MONTHS[this.locale];
  initialDate!: Date;

  events: CalendarEvent[] = [];
  calendar: Calendar = [];

  form = new FormGroup({
    year: new FormControl<string>('2023', { nonNullable: true }),
    language: new FormControl<'it' | 'en'>('it', { nonNullable: true }),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    dateControl: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    color: new FormControl<string>('#3abe29', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  @ViewChild('pages') pages?: ElementRef<HTMLElement>;

  constructor() {}

  ngOnInit() {
    this.initialDate = new Date(this.form.controls.year.value);
    this.locale = this.form.controls.language.value;

    this.restoreState();
    this.updateCalendar();

    this.form.controls.year.valueChanges.subscribe({
      next: (newYear) => {
        if (newYear) {
          this.initialDate = new Date(newYear);
          this.updateCalendar();
        }
      },
      error: (error) => {},
    });

    this.form.controls.language.valueChanges.subscribe({
      next: (newLanguage) => {
        if (newLanguage) {
          this.locale = newLanguage;
          this.days = DAYS[this.locale];
          this.months = MONTHS[this.locale];
        }
      },
      error: (error) => {},
    });
  }

  private isSameDate(first: Date, second: Date) {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  private isSameDayMonth(first: Date, second: Date) {
    return first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
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
          const holiday = FIXED_HOLIDAYS.find((value) => this.isSameDayMonth(value.date, date));
          if (holiday) {
            day.holidayName = holiday.name;
            day.isWorking = holiday.isWorking;
          }

          const movingHoliday = MOVING_HOLIDAYS.find((value) => this.isSameDate(value.date, date));
          if (movingHoliday) {
            day.holidayName = movingHoliday.name;
            day.isWorking = movingHoliday.isWorking;
          }

          // Evento
          const event = this.events.find((value) => this.isSameDayMonth(value.date, date));
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
