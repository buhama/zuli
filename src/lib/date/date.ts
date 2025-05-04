/* eslint-disable quotes */
import {
	add,
	format,
	getTime,
	isBefore,
	isSameDay,
	isValid,
	parse,
	setHours,
	startOfDay,
	startOfHour,
} from 'date-fns';

export const convertDateToUnix = (date: string, time?: string): number => {
	let parsedDate;

	if (time) {
		parsedDate = parse(
			`${date} ${time}`,
			'yyyy-MM-dd HH:mm:ss.SSS',
			new Date()
		);

		if (!isValid(parsedDate)) {
			parsedDate = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
		}

		if (!isValid(parsedDate)) {
			parsedDate = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
		}
	} else {
		parsedDate = parse(date, 'yyyy-MM-dd', new Date());
	}

	if (!isValid(parsedDate)) {
		return -1;
	}

	return getTime(parsedDate);
};

export const convertUnixToDate = (
	unix: number | undefined | null,
	dateFormat = DATE_FORMAT.YYYY_MM_DD
): string => {
	if (!unix) {
		return '';
	}

	if (unix === 0) {
		return '';
	}

	return isValid(unix) ? format(new Date(unix), dateFormat).toString() : '';
};

export const getTodaysDate = (): number =>
	convertDateToUnix(
		format(new Date(), DATE_FORMAT.YYYY_MM_DD),
		format(new Date(), DATE_FORMAT.HH_MM_SS_SSS)
	);

export const getStartOfDay = (): number =>
	startOfDay(getTodaysDate()).getTime();

export const displayEventDate = (
	startTime?: number | null,
	endTime?: number | null,
	format = DATE_FORMAT.DAY_WRITTEN_DATE_AND_TIME
): string => {
	let dateString = '';

	if (startTime) {
		dateString += convertUnixToDate(startTime, format);
	}
	if (endTime) {
		dateString += ' - ';
	}
	if (endTime) {
		if (isSameDay(startTime || 0, endTime)) {
			dateString += convertUnixToDate(endTime, DATE_FORMAT.WRITTEN_TIME);
		} else {
			dateString += convertUnixToDate(endTime, format);
		}
	}

	return dateString;
};

export enum DATE_FORMAT {
	YYYY_MM_DD = 'yyyy-MM-dd',
	YYYY_MM_DD_HH_MM_SS = 'yyyy-MM-dd hh:mm:ss',
	HH_MM = 'HH:mm',
	HH_MM_SS = 'HH:mm:ss',
	HH_MM_SS_SSS = 'HH:mm:ss.SSS',
	HH_MM_A = 'hh:mm a',
	WRITTEN_TIME = 'h:mm a',
	WRITTEN_DATE = "MMM dd',' yyyy",
	WRITTEN_DATE_AND_TIME = "MMM dd 'at' hh:mm a",
	WRITTEN_MONTH_DAY = 'MMMM do',
	MONTH_DAY = 'MMM dd',
	DAY = 'dd',
	DAY_SUFFIX = 'do',
	WEEK_DAY = 'EEE',
	DAY_WRITTEN_DATE_AND_TIME = "EEE, MMM d 'at' h:mm a",
	DAY_WRITTEN_DATE = 'EEE, MMM d',
	MONTH = 'MMMM',
	MONTH_YEAR = 'MMMM yyyy',
	DATE_TIME_LOCAL = "yyyy-MM-dd'T'HH:mm",
	WRITTEN_DATE_TIME_AND_YEAR = "MMM dd 'at' hh:mm a yyyy",
}

export const getDayString = (day: number): string => {
	switch (day) {
		case 0:
			return 'sunday';
		case 1:
			return 'monday';
		case 2:
			return 'tuesday';
		case 3:
			return 'wednesday';
		case 4:
			return 'thursday';
		case 5:
			return 'friday';
		case 6:
			return 'saturday';
		default:
			return '';
	}
};

export const defaultStartDate = () => {
	const futureDate = add(startOfHour(getTodaysDate()), { weeks: 2 });
	const futureDateAtEight = setHours(futureDate, 20);
	if (futureDate < futureDateAtEight) {
		return futureDate;
	} else {
		return futureDateAtEight;
	}
};

export const createTimeList = (
	maxTime = '11:30 PM',
	minTime = '12:00 AM',
	interval = 30
): string[] => {
	const startTime = parse(minTime, 'h:mm aa', new Date());
	const endTime = parse(maxTime, 'h:mm aa', new Date());

	if (interval <= 0) {
		throw new Error('Interval must be greater than 0.');
	}

	const timeList: string[] = [];
	let currentTime = startTime;

	while (
		isBefore(currentTime, endTime) ||
		currentTime.getTime() === endTime.getTime()
	) {
		timeList.push(format(currentTime, 'hh:mm a')); // Simplified formatting
		currentTime = new Date(currentTime.getTime() + interval * 60 * 1000); // Increment by interval
	}

	return timeList;
};

export const to24HourFormat = (time: string): string => {
	const parsedTime = parse(time, 'hh:mm a', new Date());
	return format(parsedTime, 'HH:mm'); // Converts to 24-hour format
};

export const to12HourFormat = (time: string): string => {
	const parsedTime = parse(time, 'HH:mm', new Date());
	return format(parsedTime, 'hh:mm a'); // Converts to 12-hour format
};
