export interface IEspInfo {
  espId: string
  name: string
  room: string
  hasAlarm?: boolean
  hasTempSensor?: boolean
}

export interface IEspStatus {
  status: 'Conectado' | 'Desconectado'
}
