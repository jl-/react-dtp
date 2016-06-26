/**
 * <DatePicker
 *   date
 *   onChange // trigge on selected date change
 * />
 *
 *
 *
 */
import React, { Component } from 'react';
import cx from  'classnames';
import './style.scss';

const LEVEL_YEARS = 1;
const LEVEL_MONTHS = 2;
const LEVEL_DATES = 3;
const LEVEL_TIME = 4;

const YEAR_OFFSET = 4;
const MONTH_OFFSET = 4;

const MONTHS = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec'
];

const DTP_REF = Symbol('dtp');
const WEEKDAY_FLAGS = (
  <div className='dtp-wfs'>
  {
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((flag, index) => (
      <span key={index} className='dtp__wf'>{flag}</span>
    ))
  }
  </div>
);

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function composeDateFromTarget(target, root) {
  while (target && target !== root) {
    let dataDate = target.getAttribute('data-date');
    if (dataDate) return new Date(dataDate);
    target = target.parentElement;
  }
  return null;
}

class DatetimePicker extends Component {
  constructor(props) {
    super(props);
    const { date: selectedDate, level = LEVEL_DATES } = props;
    const pendingDate = isValidDate(selectedDate) ? new Date(selectedDate) : new Date();
    this.state = { selectedDate, pendingDate, level };
    this.handleCalendarClick = ::this.handleCalendarClick;
  }
  componentWillReceiveProps({ date, level }) {
    const dateChanged = date !== this.props.date && isValidDate(date);
    const levelChange = level !== this.props.level;
    if (dateChanged) {
      this.setState({ selectedDate: date, pendingDate: new Date(date) });
    }
    if (levelChange) {
      this.setState({ level });
    }
  }
  getValue() {
    return this.state.selectedDate;
  }
  levelUp(thisLevel) {
    if (thisLevel === LEVEL_YEARS) return;
    const level = thisLevel === LEVEL_TIME ? LEVEL_DATES  : thisLevel === LEVEL_DATES ? LEVEL_MONTHS : LEVEL_YEARS;
    this.setState({ level });
  }
  nav(level, factor) {
    const { pendingDate: prevPendingDate, selectedDate: prevSelectedDate } = this.state;
    const [prevYear, prevMonth, prevDate] = [
      prevPendingDate.getFullYear(), prevPendingDate.getMonth(), prevPendingDate.getDate()
    ];
    let pendingDate, selectedDate = prevSelectedDate;
    if (level === LEVEL_YEARS) {
      pendingDate = new Date(prevYear + factor * 10, prevMonth);
    } else if (level === LEVEL_MONTHS) {
      pendingDate = new Date(prevYear + factor, prevMonth);
    } else if (level === LEVEL_DATES) {
      pendingDate = new Date(prevYear, prevMonth + factor + 1, 0);
      const daysCount = pendingDate.getDate();
      if (daysCount > prevDate) {
        pendingDate.setDate(prevDate);
      }
    } else {
      pendingDate = new Date();
    }
    this.setState({ pendingDate, selectedDate });
  }
  handleCalendarClick(e) {
    const date = composeDateFromTarget(e.target, this.refs[DTP_REF]);
    if (!isValidDate(date)) return;
    const { level: prevLevel, selectedDate: prevSelectedDate } = this.state;
    const level = prevLevel === LEVEL_YEARS ? LEVEL_MONTHS :
      prevLevel === LEVEL_MONTHS ? LEVEL_DATES : LEVEL_TIME;
    const pendingDate = date;
    const selectedDate = prevLevel === LEVEL_DATES || prevLevel === LEVEL_TIME ? new Date(date) : prevSelectedDate;
    const { onChange } = this.props;
    setTimeout(() => this.setState({ level, selectedDate, pendingDate }), 0);
    if (typeof onChange === 'function') onChange(selectedDate);
  }
  renderHeaderCtrl(pendingDate, level) {
    const year = pendingDate.getFullYear();
    return (
      <div className='dtp-hc'>
      <span className='dtp-prev icon icon-double-left' onClick={() => this.nav(level, -1)}></span>
      <span
      className='dtp-curr'
      onClick={() => this.levelUp(level)}
      >
      {
        level === LEVEL_YEARS ? `${year - YEAR_OFFSET} - ${year + 7}` :
          level === LEVEL_MONTHS ? `${year}` :
          level === LEVEL_DATES ? `${year} - ${pendingDate.getMonth() + 1}` :
          `${year} - ${pendingDate.getMonth() + 1} - ${pendingDate.getDate()}`
      }
      </span>
      <span className='dtp-next icon icon-double-right' onClick={() => this.nav(level, 1)}></span>
      </div>
    );
  }
  renderYears(thisYear) {
    const startYear = thisYear - YEAR_OFFSET;
    const endYear = startYear + 11;
    const currentYear = (new Date()).getFullYear();
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      let isPast = year < currentYear;
      let isCurrent = year === currentYear;
      let className = `dtp__yc dtp__yc--${isPast ? 'past' : isCurrent ? 'curr' : 'future'}`;
      (year === thisYear) && (className += ' dtp__yc--selected');
      years.push((
        <span
        key={years.length}
        className={className}
        data-date={`${year}`}
        >
        {year}
        </span>
      ));
    }
    return <div className='dtp-ycs'>{years}</div>;
  }
  renderMonths(thisYear, thisMonth) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const months = MONTHS.map((month, index) => {
      const isPast = thisYear < currentYear || (thisYear === currentYear && index < currentMonth);
      const isCurrent = thisYear === currentYear && index === currentMonth;
      let className = `dtp__mc dtp__mc--${isPast ? 'past' : isCurrent ? 'curr' : 'future'}`;
      (index === thisMonth) && (className += ' dtp__mc--selected');
      return (
        <span
        key={index}
        className={className}
        data-date={`${thisYear}/${index + 1}`}
        >
        {month}
        </span>
      );
    });
    return <div className='dtp-mcs'>{months}</div>
  }
  renderDates(thisYear, thisMonth, thisDate, selected) {
    const today = new Date();
    const [currentYear, currentMonth, currentDate] = [
      today.getFullYear(), today.getMonth(), today.getDate()
    ];
    const selectedYear = selected && selected.getFullYear();
    const selectedMonth = selected && selected.getMonth();
    const selectedDate = selected && selected.getDate();

    const lastDateOfThisMonth = new Date(thisYear, thisMonth + 1, 0);
    const datesCountOfThisMonth = lastDateOfThisMonth.getDate();

    const lastDateOfPrevMonth = new Date(thisYear, thisMonth, 0);
    const lastDayOfPrevMonth = lastDateOfPrevMonth.getDay();
    const visibleDatesCountOfPrevMonth = (lastDayOfPrevMonth + 1) % 7;

    // there are 42 dates in the calendar of a month.
    const visibleDatesCountOfNextMonth = 42 - visibleDatesCountOfPrevMonth - datesCountOfThisMonth;

    const dates = [];

    // a few ending dates of previous month may be visible
    // in the begining of the calendar of this month.
    if (visibleDatesCountOfPrevMonth > 0) {
      const datesCountOfPrevMonth = lastDateOfPrevMonth.getDate();
      const startDateOfPrevVisible = datesCountOfPrevMonth - visibleDatesCountOfPrevMonth + 1;
      const prevMonth = (thisMonth -1 + 12) % 12;
      const prevYear = prevMonth > thisMonth ? thisYear - 1 : thisYear;
      for (let date = startDateOfPrevVisible; date <= datesCountOfPrevMonth; date++) {
        dates.push({ date, year: prevYear, month: prevMonth });
      }
    }

    // dates of this month
    for (let date = 1; date <= datesCountOfThisMonth; date++) {
      dates.push({ date, year: thisYear, month: thisMonth });
    }

    // a few begining dates of next month may be visible
    // in the end of the calendar of this month
    if (visibleDatesCountOfNextMonth > 0) {
      const nextMonth = (thisMonth + 1) % 12;
      const nextYear = nextMonth > thisMonth ? thisYear : thisYear + 1;
      for (let date = 1; date <= visibleDatesCountOfNextMonth; date++) {
        dates.push({ date, year: nextYear, month: nextMonth });
      }
    }

    const dateItems = dates.map(({ date, year, month }, index) => {
      const isPast = (year < currentYear) || (year === currentYear && (
        (month < currentMonth) || (month === currentMonth && date < currentDate)
      ));
      const isCurrent = !isPast && (year === currentYear) && (month === currentMonth) && (date === currentDate);
      const isFuture = !isCurrent && !isPast;
      const isSelected = year === selectedYear && month === selectedMonth && date === selectedDate;
      let className = `dtp__dc dtp__dc--${isPast ? 'past' : isCurrent ? 'curr' : 'future'}`;
      className += ` dtp__dc--${month < thisMonth ? 'prev' : month === thisMonth ? 'this' : 'next'}`;
      isSelected && (className += ' dtp__dc--selected');
      (month === thisMonth && date === thisDate) && (className += ' dtp__dc--this-selected');
      return (
        <span
        key={index}
        data-date={`${year}/${month + 1}/${date}`}
        className={className}
        >
        {date}
        </span>
      );
    });

    return <div className='dtp-dcs'>{dateItems}</div>;
  }
  setTime(hour, minute) {
    const { onChange } = this.props;
    const selectedDate = new Date(this.state.selectedDate);
    selectedDate.setHours(hour);
    selectedDate.setMinutes(minute);
    const pendingDate = new Date(selectedDate);
    this.setState({ selectedDate, pendingDate });
    if (typeof onChange === 'function') onChange(selectedDate);
  }
  renderTimePicker(selectedDate) {
    const selectedHour = selectedDate.getHours();
    const selectedMinute = selectedDate.getMinutes();
    const isPM = selectedHour >= 12;

    return (
      <div className='dtp-tc'>
      <div className='dtp-tc-g'>
      <span className='dtp-tc__plus icon icon-up' onClick={() => this.setTime(selectedHour + 1, selectedMinute)}></span>
      <input
      type='number' min={0} max={12}
      className='dtp-tc__input'
      value={isPM ? selectedHour - 12 : selectedHour}
      onChange={e => {
        const value = e.target.value;
        e.stopPropagation();
        this.setTime(isPM ? value + 12 : value, selectedMinute);
      }}
        />
      <span className='dtp-tc__min icon icon-down' onClick={() => this.setTime(selectedHour - 1, selectedMinute)}></span>
      </div>
      <span className=''>:</span>
      <div className='dtp-tc-g'>
      <span className='dtp-tc__plus icon icon-up' onClick={() => this.setTime(selectedHour, selectedMinute + 5)}></span>
      <input
      type='number' min={0} max={59}
      className='dtp-tc__input'
      value={selectedMinute}
      onChange={e => {
        e.stopPropagation();
        this.setTime(selectedHour, e.target.value);
      }}
        />
      <span className='dtp-tc__min icon icon-down' onClick={() => this.setTime(selectedHour, selectedMinute - 5)}></span>
      </div>
      <span
      className='dtp-tc__apm'
      onClick={() => this.setTime(isPM ? selectedHour - 12 : selectedHour + 12, selectedMinute)}
      >
      {isPM ? 'PM' : 'AM'}
      </span>
      </div>
    );
  }

  render() {
    const { date, level: _level, ...props } = this.props;
    const { level, pendingDate, selectedDate } = this.state;
    const thisYear = pendingDate.getFullYear();
    const thisMonth = pendingDate.getMonth();
    const thisDate = pendingDate.getDate();
    props.className = cx(props.className, 'dtp');
    return (
      <div {...props} onClick={this.handleCalendarClick} ref={DTP_REF}>
      {this.renderHeaderCtrl(pendingDate, level)}
      {
        level === LEVEL_DATES ? WEEKDAY_FLAGS : null
      }
      {
        level === LEVEL_YEARS ? this.renderYears(thisYear) :
          level === LEVEL_MONTHS ? this.renderMonths(thisYear, thisMonth) :
          level === LEVEL_DATES ? this.renderDates(thisYear, thisMonth, thisDate, selectedDate) :
          this.renderTimePicker(selectedDate)
      }
      </div>
    );
  }
}

export default DatetimePicker;

