export interface IEspInfo {
  espId: string;
  name: string;
  room: string;
  hasAlarm?: boolean;
  isAlarmOn?: boolean;
  hasTempSensor?: boolean;
  temperature?: number;
  humidity?: number;
  status?: 'on' | 'off';
  inputName: string;
  outputName?: string;
}
