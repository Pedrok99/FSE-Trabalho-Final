#ifndef __MQTT_H__
#define __MQTT_H__

void mqtt_start();

void mqtt_envia_mensagem(char * topico, char * mensagem);

#endif