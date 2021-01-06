from datetime import datetime, timedelta
from monthdelta import monthdelta, monthmod
import dateutil.parser
from enum import Enum
from server.enums import EventTypes
from server.types import *
from typing import Union, Callable, Dict


def generate_indexes(time_delta: datetime, start: datetime) -> List[datetime]:
    time_slots = []
    date = start
    now = datetime.utcnow()
    while date < now:
        time_slots.append(date)
        date += time_delta
    return time_slots


class TimeUnits(Enum):
    minute = 'minute'
    hour = 'hour'
    day = 'day'
    month = 'month'
    year = 'year'


time_deltas = {
    'minute': lambda value: timedelta(minutes=value),
    'hour': lambda value: timedelta(hours=value),
    'day': lambda value: timedelta(days=value),
    'month': lambda value: monthdelta(value),
    'year': lambda value: monthdelta(value * 12),
}


time_mods = {
    'minute': lambda value:
        lambda start, end:
            timedelta(
                minutes=value * ((end - start).total_seconds() // (60 * value))
            ),
    'hour': lambda value:
        lambda start, end:
            timedelta(
                hours=value * ((end - start).total_seconds() // (3600 * value))
            ),
    'day': lambda value:
        lambda start, end:
            timedelta(
                days=value * ((end - start).total_seconds() // (86400 * value))
            ),
    'month': lambda value:
        lambda start, end:
            monthdelta(value) * (monthmod(start, end)[0] // monthdelta(value)),
    'year': lambda value:
        lambda start, end:
            monthdelta(value * 12) * (monthmod(start, end)[0] // monthdelta(value * 12)),
}


def get_time_delta(time_interval):
    return time_deltas[time_interval['unit']](time_interval['value'])


def parse_data(data: EventSeries, time_interval):
    start = data['created_at'].replace(microsecond=0)
    time_delta = get_time_delta(time_interval)
    indexes = generate_indexes(time_delta, start)

    def parse(result: str, event: EventTypes, parser: Callable[[List], Union[int, float]], aggregate: Callable) -> Dict:
        time_slots = {index: () for index in indexes}

        for event in data['events'][event + '_events']:
            date = dateutil.parser.parse(event['created_at'])
            time_mod = time_mods[time_interval['unit']]

            index = start + time_mod(time_interval['value'])(start, date)
            time_slots[index] += (event,)

        time_series = []
        for key, value in time_slots.items():
            time_series.append({'index': key, 'value': parser(value)})

        total = aggregate(map(lambda x: x['value'], time_series))

        return {
            result: total,
            result + '_series': time_series,
        }

    return {
        **parse(
            'revenue',
            'purchase',
            lambda values: sum(map(lambda x: x['price'], values)), sum),
        **parse('clicks', 'click', lambda values: len(values), sum),
        **parse('volume', 'purchase', lambda values: len(values), sum),
    }
