import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

const DAYS = ['days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri', 'days.sat', 'days.sun'];
const MONTHS = [
  'months.january',
  'months.february',
  'months.march',
  'months.april',
  'months.may',
  'months.june',
  'months.july',
  'months.august',
  'months.september',
  'months.october',
  'months.november',
  'months.december',
];
const FIXED_HOLIDAYS = [
  {
    name: 'events.it.capodanno',
    date: new Date('2023-01-01'),
    isWorking: false,
  },
  {
    name: 'events.it.epifania',
    date: new Date('2023-01-06'),
    isWorking: false,
  },
  {
    name: 'events.it.festa_del_donna',
    date: new Date('2023-03-08'),
    isWorking: true,
  },
  {
    name: 'events.it.festa_del_pap',
    date: new Date('2023-03-19'),
    isWorking: true,
  },
  {
    name: 'events.it.liberazione',
    date: new Date('2023-04-25'),
    isWorking: false,
  },
  {
    name: 'events.it.festa_del_lavoro',
    date: new Date('2023-05-01'),
    isWorking: false,
  },
  {
    name: 'events.it.festa_della_mamma',
    date: new Date('2023-05-08'),
    isWorking: true,
  },
  {
    name: 'events.it.festa_della_repubblica',
    date: new Date('2023-06-02'),
    isWorking: false,
  },
  {
    name: 'events.it.ferragosto',
    date: new Date('2023-08-15'),
    isWorking: false,
  },
  {
    name: 'events.it.tutti_i_santi',
    date: new Date('2023-11-01'),
    isWorking: false,
  },
  {
    name: 'events.it.immacolata',
    date: new Date('2023-12-08'),
    isWorking: false,
  },
  {
    name: 'events.it.natale',
    date: new Date('2023-12-25'),
    isWorking: false,
  },
  {
    name: 'events.it.santo_stefano',
    date: new Date('2023-12-26'),
    isWorking: false,
  },
  {
    name: 'events.it.san_silvestro',
    date: new Date('2023-12-31'),
    isWorking: true,
  },
];

// TODO implement dynamic calculation
const MOVING_HOLIDAYS = [
  {
    name: 'events.it.mercoledi_delle_ceneri',
    date: new Date('2022-03-02'),
    isWorking: true,
  },
  {
    name: 'events.it.mercoledi_delle_ceneri',
    date: new Date('2023-02-22'),
    isWorking: true,
  },
  {
    name: 'events.it.venerdi_santo',
    date: new Date('2023-04-07'),
    isWorking: true,
  },
  {
    name: 'events.it.pasqua',
    date: new Date('2023-04-09'),
    isWorking: false,
  },
  {
    name: 'events.it.lunedi_di_pasquetta',
    date: new Date('2023-04-10'),
    isWorking: false,
  },
];

interface CalendarEvent {
  name: string;
  color?: string;
  date: Date;
}

type Day = {
  number?: number;
  isSunday?: boolean;
  eventName?: string;
  holidayName: string;
  otherMonth?: boolean;
  event?: CalendarEvent;
  isWorking?: boolean;
};

type Month = {
  name: string;
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
  days = DAYS;
  months = MONTHS;
  initialDate!: Date;

  events: CalendarEvent[] = [];
  calendar: Calendar = [];

  form = new FormGroup({
    year: new FormControl<string>('2023', { nonNullable: true }),
    language: new FormControl<'it' | 'en'>('en', { nonNullable: true }),
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

  constructor(private translate: TranslateService, private clinent: HttpClient) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.initialDate = new Date(this.form.controls.year.value);
    this.locale = this.form.controls.language.value;
    this.translate.use(this.locale);

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
          this.translate.use(this.locale);
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
        name: MONTHS[monthIndex],
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
          const day: Day = {
            holidayName: ''
          };

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
