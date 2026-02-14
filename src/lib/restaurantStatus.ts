/**
 * Verifica se o restaurante está aberto baseado nos horários configurados
 */
export function isRestaurantOpen(schedules: any): { isOpen: boolean; message: string } {
  if (!schedules || typeof schedules !== 'object') {
    return { isOpen: true, message: 'Horários não configurados' };
  }

  // Pega horário atual de São Paulo
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
  
  // Mapeia dia da semana em português para chave do objeto
  const weekdayMap: { [key: string]: string } = {
    'segunda-feira': 'monday',
    'terça-feira': 'tuesday',
    'quarta-feira': 'wednesday',
    'quinta-feira': 'thursday',
    'sexta-feira': 'friday',
    'sábado': 'saturday',
    'domingo': 'sunday'
  };

  const todayKey = weekdayMap[weekdayPart.value.toLowerCase()];
  if (!todayKey) {
    return { isOpen: true, message: 'Dia da semana não identificado' };
  }

  const todaySchedules = schedules[todayKey];
  
  // Se não tem horários configurados para hoje, considera fechado
  if (!todaySchedules || !Array.isArray(todaySchedules) || todaySchedules.length === 0) {
    return { isOpen: false, message: 'Fechado hoje' };
  }

  // Verifica se está dentro de algum período de funcionamento
  for (const schedule of todaySchedules) {
    if (!schedule.start || !schedule.end) continue;
    
    if (isTimeInRange(currentTime, schedule.start, schedule.end)) {
      return { 
        isOpen: true, 
        message: `Aberto até ${schedule.end}` 
      };
    }
  }

  // Se não está em nenhum horário, verifica qual é o próximo horário
  const nextSchedule = todaySchedules.find((s: any) => s.start && s.start > currentTime);
  if (nextSchedule) {
    return { 
      isOpen: false, 
      message: `Abre às ${nextSchedule.start}` 
    };
  }

  return { isOpen: false, message: 'Fechado' };
}

/**
 * Verifica se um horário está dentro de um range
 */
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
