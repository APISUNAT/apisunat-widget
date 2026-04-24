// @ts-nocheck
import { Calendar, DateField, DatePicker, Label } from '@heroui/react';
import { parseDate } from '@internationalized/date';

export function HeroUIDatePicker({ value, onChange }) {
	return (
		<DatePicker
			className="w-full"
			name="fechaEmision"
			value={value ? parseDate(value) : undefined}
			onChange={(nextValue) => onChange?.(nextValue ? nextValue.toString() : '')}
		>
			<Label>Fecha de emision</Label>
			<DateField.Group fullWidth>
				<DateField.Input>
					{(segment) => <DateField.Segment segment={segment} />}
				</DateField.Input>
				<DateField.Suffix>
					<DatePicker.Trigger>
						<DatePicker.TriggerIndicator />
					</DatePicker.Trigger>
				</DateField.Suffix>
			</DateField.Group>
			<DatePicker.Popover>
				<Calendar aria-label="Fecha de emision">
					<Calendar.Header>
						<Calendar.YearPickerTrigger>
							<Calendar.YearPickerTriggerHeading />
							<Calendar.YearPickerTriggerIndicator />
						</Calendar.YearPickerTrigger>
						<Calendar.NavButton slot="previous" />
						<Calendar.NavButton slot="next" />
					</Calendar.Header>
					<Calendar.Grid>
						<Calendar.GridHeader>
							{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
						</Calendar.GridHeader>
						<Calendar.GridBody>
							{(date) => <Calendar.Cell date={date} />}
						</Calendar.GridBody>
					</Calendar.Grid>
					<Calendar.YearPickerGrid>
						<Calendar.YearPickerGridBody>
							{({ year }) => <Calendar.YearPickerCell year={year} />}
						</Calendar.YearPickerGridBody>
					</Calendar.YearPickerGrid>
				</Calendar>
			</DatePicker.Popover>
		</DatePicker>
	);
}
