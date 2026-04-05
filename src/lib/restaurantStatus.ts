/**
 * Verifica se o restaurante está aberto baseado nos horários configurados
 */
export function isRestaurantOpen(schedules: any): { isOpen: boolean; message: string } {
  if (!schedules || typeof schedules !== 'object') {
    return { isOpen: true, message: 'Horários não configurados' };
  }

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const weekdayPart = parts.find(p => p.type === 'weekday');
  const hourPart = parts.find(p => p.type === 'hour');
  const minutePart = parts.find(p => p.type === 'minute');

  if (!weekdayPart || !hourPart || !minutePart) {
    return { isOpen: true, message: 'Erro ao verificar horário' };
  }

  const currentTime = `${hourPart.value}:${minutePart.value}`;
  const currentMinutes = toMinutes(currentTime);

  const weekdayMap: { [key: string]: string } = {
    'segunda-feira': 'monday',
    'terça-feira': 'tuesday',
    'quarta-feira': 'wednesday',
    'quinta-feira': 'thursday',
    'sexta-feira': 'friday',
    'sábado': 'saturday',
    'domingo': 'sunday'
  };

  const weekdayLabels: { [key: string]: string } = {
    monday: 'segunda',
    tuesday: 'terça',
    wednesday: 'quarta',
    thursday: 'quinta',
    friday: 'sexta',
    saturday: 'sábado',
    sunday: 'domingo'
  };

  const orderedDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const todayKey = weekdayMap[weekdayPart.value.toLowerCase()];
  if (!todayKey) {
    return { isOpen: true, message: 'Dia da semana não identificado' };
  }

  const todaySchedules = normalizeSchedules(schedules[todayKey]);

  for (const schedule of todaySchedules) {
    if (isTimeInRange(currentTime, schedule.start, schedule.end)) {
      return {
        isOpen: true,
        message: `Aberto até ${schedule.end}`
      };
    }
  }

  const nextToday = todaySchedules.find((schedule) => toMinutes(schedule.start) > currentMinutes);
  if (nextToday) {
    return {
      isOpen: false,
      message: `Abre hoje às ${nextToday.start}`
    };
  }

  const todayIndex = orderedDays.indexOf(todayKey);
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayKey = orderedDays[(todayIndex + offset) % orderedDays.length];
    const nextSchedules = normalizeSchedules(schedules[nextDayKey]);
    const nextSchedule = nextSchedules[0];

    if (nextSchedule?.start) {
      const dayLabel = offset === 1 ? 'amanhã' : weekdayLabels[nextDayKey];
      return {
        isOpen: false,
        message: `Abre ${dayLabel} às ${nextSchedule.start}`
      };
    }
  }

  return { isOpen: false, message: 'Fechado no momento' };
}

/**
 * Verifica se um horário está dentro de um range
 */
function normalizeSchedules(daySchedules: any): Array<{ start: string; end: string }> {
  if (!Array.isArray(daySchedules)) return [];

  return daySchedules
    .filter((schedule) => schedule?.start && schedule?.end)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return (hour || 0) * 60 + (minute || 0);
}

function isTimeInRange(current: string, start: string, end: string): boolean {
  const [currentHour, currentMinute] = current.split(':').map(Number);
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMinute;
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  // Se o horário de fim é menor que o de início, significa que passa da meia-noite
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  // Se o horário atual é menor que o de início, pode ser que já passou da meia-noite
  if (currentMinutes < startMinutes && endMinutes >= 24 * 60) {
    const adjustedCurrent = currentMinutes + 24 * 60;
    return adjustedCurrent >= startMinutes && adjustedCurrent <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
